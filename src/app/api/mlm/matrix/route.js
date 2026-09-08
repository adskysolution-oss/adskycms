import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmMember from '@/models/mlm/MlmMember';
import MlmMatrixNode from '@/models/mlm/MlmMatrixNode';
import MlmFdApplication from '@/models/mlm/MlmFdApplication';
import { getAllLevelsOccupancy } from '@/lib/mlm/matrixEngine';
import { requireModuleAuth } from '@/lib/moduleAuth';
import mongoose from 'mongoose';

/**
 * GET /api/mlm/matrix
 * Returns the member's matrix position, upline, direct children, 15-level occupancy and completion metrics.
 */
export async function GET(req) {
  await dbConnect();
  const auth = await requireModuleAuth(req, 'mlm');
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const memberParam = searchParams.get('member')?.trim();

  let member = null;
  const isAdmin = ['super_admin', 'operations_admin', 'admin'].includes(auth.payload.role);

  if (memberParam) {
    member = await MlmMember.findOne({
      $or: [
        { mlmCode: { $regex: new RegExp(`^${memberParam}$`, 'i') } },
        ...(mongoose.Types.ObjectId.isValid(memberParam) ? [{ _id: new mongoose.Types.ObjectId(memberParam) }] : []),
        { mobile: memberParam },
      ]
    }).populate('sponsorId', 'fullName mlmCode mobile');
  } else if (!isAdmin) {
    const authId = new mongoose.Types.ObjectId(auth.payload.id || auth.payload.userId);
    member = await MlmMember.findOne({
      $or: [{ userId: authId }, { _id: authId }]
    }).populate('sponsorId', 'fullName mlmCode mobile');
  } else {
    // Admin without memberParam: default to the Root node member or first active member
    const rootNode = await MlmMatrixNode.findOne({ isRoot: true, level: 1 }).lean();
    if (rootNode?.memberId) {
      member = await MlmMember.findById(rootNode.memberId).populate('sponsorId', 'fullName mlmCode mobile');
    }
    if (!member) {
      member = await MlmMember.findOne({ status: 'ACTIVE' }).sort({ joinedAt: 1 }).populate('sponsorId', 'fullName mlmCode mobile');
    }
  }

  if (!member) {
    return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });
  }

  // Self-heal and resolve valid matrix node
  let currentNode = member.matrixNodeId ? await MlmMatrixNode.findById(member.matrixNodeId).lean() : null;
  if (!currentNode) {
    const existingNode = await MlmMatrixNode.findOne({ memberId: member._id }).lean();
    if (existingNode) {
      await MlmMember.updateOne(
        { _id: member._id },
        { $set: { matrixNodeId: existingNode._id, matrixLevel: existingNode.level, matrixPosition: existingNode.positionInParent || existingNode.position } }
      );
      member.matrixNodeId = existingNode._id;
      member.matrixLevel = existingNode.level;
      member.matrixPosition = existingNode.positionInParent || existingNode.position;
      currentNode = existingNode;
    } else if (member.platformFeePaid && member.status === 'ACTIVE') {
      const { placeInMatrix } = await import('@/lib/mlm/matrixEngine');
      const placed = await placeInMatrix(member._id, member.userId, member.userId, 'self_heal');
      if (placed?.node) {
        member.matrixNodeId = placed.node._id;
        member.matrixLevel = placed.node.level;
        member.matrixPosition = placed.node.positionInParent;
        currentNode = placed.node;
      }
    }
  }

  if (!currentNode) {
    return NextResponse.json({
      success: true,
      data: {
        isPlaced: false,
        message: 'Member has not been placed in the matrix yet. Complete platform fee payment.',
        member,
        node: null,
        children: [],
        directChildren: [],
        totalDescendantsCount: 0,
        directSponsoredCount: 0,
        directSponsored: [],
      }
    });
  }

  // Find direct children (L1 under this node, max 3)
  const directChildren = await MlmMatrixNode.find({ parentNodeId: currentNode._id })
    .populate({
      path: 'memberId',
      select: 'fullName mlmCode mobile status joinedAt platformFeePaid kycStatus'
    })
    .sort({ positionInParent: 1 })
    .lean();

  // 15-level spatial occupancy and completion
  const { levels: levelOccupancies, totalDownline } = await getAllLevelsOccupancy(currentNode._id);

  // Fetch ALL downline nodes under this node's subtree (ancestorIds: currentNode._id)
  const downlineNodes = await MlmMatrixNode.find({
    ancestorIds: currentNode._id,
    memberId: { $ne: null }
  })
    .populate({
      path: 'memberId',
      select: 'fullName mlmCode mobile status platformFeePaid kycStatus joinedAt sponsorId sponsorCode',
      populate: {
        path: 'sponsorId',
        select: 'fullName mlmCode mobile'
      }
    })
    .populate({
      path: 'parentNodeId',
      select: 'level positionInParent memberId',
      populate: {
        path: 'memberId',
        select: 'fullName mlmCode mobile'
      }
    })
    .sort({ level: 1, positionInParent: 1 })
    .lean();

  const currentMemberIdStr = member._id.toString();
  const currentMlmCode = member.mlmCode;

  // Direct sponsored members (match by sponsorId, sponsor userId or sponsorCode)
  const rawDirectSponsored = await MlmMember.find({
    $or: [
      { sponsorId: member._id },
      { sponsorId: member.userId },
      { sponsorCode: member.mlmCode }
    ]
  })
    .select('fullName mlmCode mobile status platformFeePaid kycStatus joinedAt matrixNodeId matrixLevel matrixPosition')
    .sort({ joinedAt: -1 })
    .lean();

  // Collect member IDs across downline and direct referrals to batch-fetch FD applications
  const allRelatedMemberIds = [
    ...downlineNodes.map((n) => n.memberId?._id).filter(Boolean),
    ...rawDirectSponsored.map((m) => m._id).filter(Boolean),
    ...directChildren.map((c) => c.memberId?._id).filter(Boolean),
  ];

  const fdApplications = await MlmFdApplication.find({
    memberId: { $in: allRelatedMemberIds }
  })
    .select('memberId status fdAmount applicationReference createdAt eligibleAt')
    .sort({ createdAt: -1 })
    .lean();

  const fdMap = new Map();
  for (const app of fdApplications) {
    const memIdStr = app.memberId.toString();
    if (!fdMap.has(memIdStr) || ['ELIGIBLE', 'VERIFIED'].includes(app.status)) {
      fdMap.set(memIdStr, app);
    }
  }

  // Map downline members with rich level, lineage, and FD Card info
  const downlineMembers = downlineNodes.map((n) => {
    const mem = n.memberId;
    const parentNode = n.parentNodeId;
    const parentMem = parentNode?.memberId;
    const sponsorObj = mem?.sponsorId;
    const relLevel = n.level - currentNode.level;

    const isDirect = (sponsorObj?._id && sponsorObj._id.toString() === currentMemberIdStr) ||
                     (sponsorObj?.mlmCode === currentMlmCode) ||
                     (mem?.sponsorCode === currentMlmCode);

    const fdApp = mem?._id ? fdMap.get(mem._id.toString()) : null;
    const fdStatus = fdApp?.status || 'NOT_APPLIED';

    return {
      _id: mem?._id || n._id,
      nodeId: n._id,
      parentNodeId: parentNode?._id || n.parentNodeId,
      fullName: mem?.fullName || 'Anonymous Member',
      mlmCode: mem?.mlmCode || '—',
      mobile: mem?.mobile || '—',
      status: mem?.status || 'ACTIVE',
      platformFeePaid: mem?.platformFeePaid || false,
      kycStatus: mem?.kycStatus || 'PENDING',
      joinedAt: mem?.joinedAt || n.createdAt,
      relativeLevel: relLevel,
      absoluteLevel: n.level,
      positionInParent: n.positionInParent || n.position || 1,
      placedUnder: {
        nodeId: parentNode?._id,
        memberId: parentMem?._id,
        fullName: parentMem?.fullName || (parentNode ? 'Upline Node' : member.fullName),
        mlmCode: parentMem?.mlmCode || (parentNode ? '' : currentMlmCode),
        position: n.positionInParent || n.position || 1,
      },
      sponsor: {
        memberId: sponsorObj?._id,
        fullName: sponsorObj?.fullName || (mem?.sponsorCode ? `Code: ${mem.sponsorCode}` : 'Direct/Root'),
        mlmCode: sponsorObj?.mlmCode || mem?.sponsorCode || '',
      },
      isDirect,
      fdCard: {
        hasApplied: !!fdApp,
        status: fdStatus,
        applicationReference: fdApp?.applicationReference || '',
        appliedAt: fdApp?.createdAt || null,
        eligibleAt: fdApp?.eligibleAt || null,
      },
    };
  });

  const nodeLevelMap = new Map(downlineNodes.map((n) => [n.memberId?._id?.toString(), n.level - currentNode.level]));

  const directSponsored = rawDirectSponsored.map((m) => {
    const fdApp = m?._id ? fdMap.get(m._id.toString()) : null;
    const fdStatus = fdApp?.status || 'NOT_APPLIED';

    return {
      ...m,
      relativeLevel: nodeLevelMap.get(m._id.toString()) ?? (m.matrixLevel ? Math.max(1, m.matrixLevel - (currentNode.level - 1)) : null),
      fdCard: {
        hasApplied: !!fdApp,
        status: fdStatus,
        applicationReference: fdApp?.applicationReference || '',
        appliedAt: fdApp?.createdAt || null,
        eligibleAt: fdApp?.eligibleAt || null,
      },
    };
  });

  const formattedChildren = directChildren.map((c) => {
    const memId = c.memberId?._id?.toString();
    const fdApp = memId ? fdMap.get(memId) : null;
    const fdStatus = fdApp?.status || 'NOT_APPLIED';

    return {
      ...c,
      position: c.positionInParent || c.position || 1,
      memberId: c.memberId ? {
        ...c.memberId,
        fdCard: {
          hasApplied: !!fdApp,
          status: fdStatus,
          applicationReference: fdApp?.applicationReference || '',
          appliedAt: fdApp?.createdAt || null,
          eligibleAt: fdApp?.eligibleAt || null,
        }
      } : null,
    };
  });

  // Enrich levelOccupancies
  const enrichedLevelOccupancies = (levelOccupancies || []).map((occ) => {
    const membersAtLevel = downlineMembers.filter((m) => m.relativeLevel === occ.level);
    const fdDoneAtLevel = membersAtLevel.filter((m) =>
      ['ELIGIBLE', 'VERIFIED'].includes(m.fdCard?.status)
    ).length;
    const placedCount = occ.filledCount;
    const capacity = occ.capacity;
    const allPlaced = placedCount >= capacity;
    const allFdDone = fdDoneAtLevel >= capacity;
    return {
      ...occ,
      fdDoneCount: fdDoneAtLevel,
      placedCount,
      isComplete: allPlaced && allFdDone,
      isPlacementComplete: allPlaced,
    };
  });

  const rootNodeDisplay = {
    ...currentNode,
    memberId: member,
    sponsorId: member.sponsorId || (member.sponsorCode ? { mlmCode: member.sponsorCode } : null),
  };

  return NextResponse.json({
    success: true,
    data: {
      isPlaced: true,
      currentNode,
      member,
      directChildren: formattedChildren,
      totalDescendantsCount: downlineMembers.length || totalDownline,
      directSponsoredCount: directSponsored.length,
      directSponsored,
      downlineMembers,
      downlineNodes: downlineMembers,
      levelOccupancies: enrichedLevelOccupancies,
      node: rootNodeDisplay,
      children: formattedChildren,
      tree: {
        node: rootNodeDisplay,
        member,
        children: formattedChildren,
      }
    }
  });
}
