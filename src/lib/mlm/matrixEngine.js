import mongoose from 'mongoose';
import MlmMatrixNode from '@/models/mlm/MlmMatrixNode';
import MlmMember from '@/models/mlm/MlmMember';
import MlmPlacementHistory from '@/models/mlm/MlmPlacementHistory';
import MlmFdApplication from '@/models/mlm/MlmFdApplication';
import { unlockPendingLevelRewards } from './walletEngine';
const MAX_WIDTH = 3;
const MAX_DEPTH = 15;
/**
 * Finds the next available vacant slot in the 3×15 matrix using BFS.
 *
 * If startNodeId is provided:
 *   - Searches BFS starting from startNodeId (within sponsor's subtree) up to MAX_DEPTH.
 *   - If no vacant slot is found in startNodeId subtree (e.g. subtree full at depth 15),
 *     falls back to global root search.
 *
 * BFS guarantees top-most, left-most vacancy is always filled first.
 */
export async function findNextVacantNode(startNodeId) {
    const root = await MlmMatrixNode.findOne({ isRoot: true, level: 1 }).lean();
    if (!root) {
        // Matrix is empty — the first member becomes the root
        return { parentNodeId: null, positionInParent: 1, level: 1, ancestorIds: [] };
    }
    // 1. Try search starting from sponsor's matrix node if valid
    if (startNodeId) {
        const startNode = await MlmMatrixNode.findById(startNodeId).lean();
        if (startNode && startNode.level < MAX_DEPTH) {
            const queue = [startNode._id];
            while (queue.length > 0) {
                const currentId = queue.shift();
                const current = await MlmMatrixNode.findById(currentId).lean();
                if (!current)
                    continue;
                if (current.level >= MAX_DEPTH)
                    continue;
                const children = await MlmMatrixNode.find({ parentNodeId: currentId })
                    .sort({ positionInParent: 1 })
                    .lean();
                const occupiedPositions = new Set(children.map((c) => c.positionInParent));
                for (let pos = 1; pos <= MAX_WIDTH; pos++) {
                    if (!occupiedPositions.has(pos)) {
                        return {
                            parentNodeId: currentId,
                            positionInParent: pos,
                            level: current.level + 1,
                            ancestorIds: [...(current.ancestorIds || []), currentId],
                        };
                    }
                }
                for (const child of children) {
                    if (child.level < MAX_DEPTH) {
                        queue.push(child._id);
                    }
                }
            }
        }
    }
    // 2. Global BFS queue: start from root
    const queue = [root._id];
    while (queue.length > 0) {
        const currentId = queue.shift();
        const current = await MlmMatrixNode.findById(currentId).lean();
        if (!current)
            continue;
        if (current.level >= MAX_DEPTH)
            continue;
        const children = await MlmMatrixNode.find({ parentNodeId: currentId })
            .sort({ positionInParent: 1 })
            .lean();
        const occupiedPositions = new Set(children.map((c) => c.positionInParent));
        for (let pos = 1; pos <= MAX_WIDTH; pos++) {
            if (!occupiedPositions.has(pos)) {
                return {
                    parentNodeId: currentId,
                    positionInParent: pos,
                    level: current.level + 1,
                    ancestorIds: [...(current.ancestorIds || []), currentId],
                };
            }
        }
        for (const child of children) {
            if (child.level < MAX_DEPTH) {
                queue.push(child._id);
            }
        }
    }
    return null; // Matrix completely full (all 3^15 occupied)
}
/**
 * Calculates the capacity and actual filled positions at a relative level for a matrix node.
 * Level capacity formula: Capacity(relativeLevel) = 3 ^ relativeLevel.
 */
export async function getLevelOccupancy(matrixNodeId, relativeLevel) {
    const capacity = Math.pow(MAX_WIDTH, relativeLevel);
    const node = await MlmMatrixNode.findById(matrixNodeId).select('level').lean();
    if (!node) {
        return { level: relativeLevel, capacity, filledCount: 0, isComplete: false };
    }
    const targetLevel = node.level + relativeLevel;
    if (targetLevel > MAX_DEPTH) {
        return { level: relativeLevel, capacity, filledCount: 0, isComplete: false };
    }
    const filledCount = await MlmMatrixNode.countDocuments({
        ancestorIds: matrixNodeId,
        level: targetLevel,
        memberId: { $ne: null },
    });
    return {
        level: relativeLevel,
        capacity,
        filledCount,
        isComplete: filledCount >= capacity,
    };
}
/**
 * Checks if a relative level under a node is truly complete:
 * ALL slots must be placed AND all placed members must have active FD cards (ELIGIBLE or VERIFIED).
 */
export async function isLevelComplete(matrixNodeId, relativeLevel) {
    const occ = await getLevelOccupancy(matrixNodeId, relativeLevel);
    if (!occ.isComplete)
        return false; // Placement not full yet
    // Additionally verify that ALL members at this level have active FD cards
    const node = await MlmMatrixNode.findById(matrixNodeId).select('level').lean();
    if (!node)
        return false;
    const targetAbsLevel = node.level + relativeLevel;
    const nodesAtLevel = await MlmMatrixNode.find({
        ancestorIds: matrixNodeId,
        level: targetAbsLevel,
        memberId: { $ne: null },
    }).select('memberId').lean();
    const memberIds = nodesAtLevel.map((n) => n.memberId).filter(Boolean);
    if (!memberIds.length)
        return false;
    const fdCount = await MlmFdApplication.countDocuments({
        memberId: { $in: memberIds },
        status: { $in: ['ELIGIBLE', 'VERIFIED'] },
    });
    return fdCount >= occ.capacity;
}
/**
 * Evaluates all 15 levels for a given matrix node.
 */
export async function getAllLevelsOccupancy(matrixNodeId) {
    const levels = [];
    let totalDownline = 0;
    for (let l = 1; l <= MAX_DEPTH; l++) {
        const occ = await getLevelOccupancy(matrixNodeId, l);
        levels.push(occ);
        totalDownline += occ.filledCount;
    }
    return { levels, totalDownline };
}
/**
 * Checks ancestor chains of a newly placed node to unlock pending rewards for any level
 * that just reached full capacity (3^L).
 */
export async function checkAndUnlockLevelCompletions(placedNode) {
    if (!placedNode?.ancestorIds?.length)
        return;
    for (const ancestorId of placedNode.ancestorIds) {
        const ancNode = await MlmMatrixNode.findById(ancestorId).select('memberId level').lean();
        if (!ancNode?.memberId)
            continue;
        const relativeLevel = placedNode.level - ancNode.level;
        if (relativeLevel < 1 || relativeLevel > MAX_DEPTH)
            continue;
        const occ = await getLevelOccupancy(ancNode._id, relativeLevel);
        if (occ.isComplete) {
            await unlockPendingLevelRewards(ancNode.memberId, relativeLevel);
        }
    }
}
/**
 * Atomically places a new member in the 3×15 matrix.
 * Uses a MongoDB session transaction with automatic retry on concurrent slot conflict.
 *
 * Distinct Sponsor vs Matrix Placement:
 *   - Uses sponsor's matrix node as BFS starting point.
 *   - If sponsor has < 3 direct children, member is placed directly under sponsor.
 *   - If sponsor has >= 3 children, member is placed in sponsor's subtree via fair BFS (spillover).
 */
export async function placeInMatrix(memberId, userId, placedByUserId, placedByRole, maxRetries = 3) {
    // 1. Idempotency check: already placed in a real matrix node?
    const existing = await MlmMember.findById(memberId).select('matrixNodeId sponsorId mlmCode').lean();
    if (existing?.matrixNodeId) {
        const node = await MlmMatrixNode.findById(existing.matrixNodeId).lean();
        if (node) {
            return { success: true, node };
        }
    }
    // 2. Resolve sponsor start node if sponsor exists
    let startNodeId = null;
    if (existing?.sponsorId) {
        const sponsor = await MlmMember.findById(existing.sponsorId).select('matrixNodeId').lean();
        if (sponsor?.matrixNodeId) {
            startNodeId = sponsor.matrixNodeId;
        }
    }
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const slot = await findNextVacantNode(startNodeId);
        if (!slot) {
            return { success: false, error: 'Matrix is completely full' };
        }
        const session = await mongoose.startSession();
        try {
            let placedNode = null;
            await session.withTransaction(async () => {
                if (slot.parentNodeId === null) {
                    // Creating root node
                    const [node] = await MlmMatrixNode.create([{
                            memberId,
                            mlmCode: existing?.mlmCode || '',
                            parentNodeId: null,
                            level: 1,
                            positionInParent: 1,
                            isRoot: true,
                            isLeaf: false,
                            ancestorIds: [],
                            filledAt: new Date(),
                        }], { session });
                    placedNode = node;
                }
                else {
                    const [node] = await MlmMatrixNode.create([{
                            memberId,
                            mlmCode: existing?.mlmCode || '',
                            parentNodeId: slot.parentNodeId,
                            level: slot.level,
                            positionInParent: slot.positionInParent,
                            isRoot: false,
                            isLeaf: slot.level === MAX_DEPTH,
                            ancestorIds: slot.ancestorIds,
                            filledAt: new Date(),
                        }], { session });
                    placedNode = node;

                    // Update parent's child metrics
                    await MlmMatrixNode.findByIdAndUpdate(slot.parentNodeId, {
                        $addToSet: { directChildIds: node._id },
                        $inc: { childCount: 1 }
                    }, { session });
                }
                // Update member with matrix position
                await MlmMember.findByIdAndUpdate(memberId, {
                    matrixNodeId: placedNode._id,
                    matrixLevel: placedNode.level,
                    matrixPosition: placedNode.positionInParent,
                }, { session });
                // Create placement history record
                await MlmPlacementHistory.create([{
                        memberId,
                        matrixNodeId: placedNode._id,
                        newNodeId: placedNode._id,
                        parentNodeId: slot.parentNodeId,
                        sponsorId: existing?.sponsorId || null,
                        level: placedNode.level,
                        newLevel: placedNode.level,
                        positionInParent: placedNode.positionInParent,
                        newPosition: placedNode.positionInParent,
                        placedBy: placedByUserId,
                        placedByRole,
                        reason: 'Initial 3x15 deterministic placement',
                        timestamp: new Date(),
                        placedAt: new Date(),
                    }], { session });
            });
            // Check if adding this node completed any ancestor's level
            if (placedNode) {
                await checkAndUnlockLevelCompletions(placedNode);
            }
            return { success: true, node: placedNode };
        }
        catch (err) {
            if (err.code === 11000 && attempt < maxRetries) {
                console.log(`[MLM MatrixEngine] Concurrent slot collision on attempt ${attempt}, retrying next vacant slot...`);
                await new Promise((res) => setTimeout(res, 50 * attempt));
                continue;
            }
            console.error('[MLM MatrixEngine] Placement failed:', err.message);
            if (err.code === 11000) {
                return { success: false, error: 'Placement conflict — slot taken by concurrent registration. Please retry.' };
            }
            return { success: false, error: err.message };
        }
        finally {
            await session.endSession();
        }
    }
    return { success: false, error: 'Failed to place member after retries' };
}
/**
 * Resolves the ancestor chain (L1→L15) for a given member's matrix node.
 * Returns beneficiaries in order from closest ancestor (L1) outward.
 */
export async function getMatrixUplineChain(memberId) {
    const member = await MlmMember.findById(memberId).select('matrixNodeId').lean();
    if (!member?.matrixNodeId)
        return [];
    const node = await MlmMatrixNode.findById(member.matrixNodeId).lean();
    if (!node?.ancestorIds?.length)
        return [];
    const chain = [];
    const ancestorIds = [...node.ancestorIds].reverse(); // Closest first
    for (let i = 0; i < Math.min(ancestorIds.length, MAX_DEPTH); i++) {
        const ancestorNode = await MlmMatrixNode.findById(ancestorIds[i]).select('_id memberId level').lean();
        if (ancestorNode?.memberId) {
            chain.push({
                memberId: ancestorNode.memberId,
                level: i + 1, // Reward level (L1 = direct matrix parent)
                matrixLevel: ancestorNode.level,
                matrixNodeId: ancestorNode._id,
            });
        }
    }
    return chain;
}

export const placeNewMemberInMatrix = placeInMatrix;
