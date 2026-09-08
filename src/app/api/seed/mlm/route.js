import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import MlmLevelConfig from "@/models/mlm/MlmLevelConfig.js";
import MlmPlatformFeeConfig from "@/models/mlm/MlmPlatformFeeConfig.js";
import MlmShareConfig from "@/models/mlm/MlmShareConfig.js";
import MlmGeneralConfig from "@/models/mlm/MlmGeneralConfig.js";
import { DEFAULT_SHARE_MESSAGE } from "@/constants/mlmShare.js";

export const dynamic = "force-dynamic";

// 3×15 matrix: capacity at each level = 3^level
const DEFAULT_LEVEL_REWARDS = [
  { level: 1, rewardAmount: 500, capacity: 3 },
  { level: 2, rewardAmount: 400, capacity: 9 },
  { level: 3, rewardAmount: 300, capacity: 27 },
  { level: 4, rewardAmount: 200, capacity: 81 },
  { level: 5, rewardAmount: 150, capacity: 243 },
  { level: 6, rewardAmount: 100, capacity: 729 },
  { level: 7, rewardAmount: 80, capacity: 2187 },
  { level: 8, rewardAmount: 60, capacity: 6561 },
  { level: 9, rewardAmount: 50, capacity: 19683 },
  { level: 10, rewardAmount: 40, capacity: 59049 },
  { level: 11, rewardAmount: 30, capacity: 177147 },
  { level: 12, rewardAmount: 25, capacity: 531441 },
  { level: 13, rewardAmount: 20, capacity: 1594323 },
  { level: 14, rewardAmount: 15, capacity: 4782969 },
  { level: 15, rewardAmount: 10, capacity: 14348907 },
];

export async function POST(req) {
  try {
    await dbConnect();
    const results = {};

    // 1. Seed Level Configs
    let levelCreated = 0;
    for (const lc of DEFAULT_LEVEL_REWARDS) {
      const exists = await MlmLevelConfig.findOne({ level: lc.level });
      if (!exists) {
        await MlmLevelConfig.create({ ...lc, isActive: true, version: 1 });
        levelCreated++;
      }
    }
    results.levelConfigs = `${levelCreated} new level configs created (${15 - levelCreated} already existed)`;

    // 2. Seed Platform Fee Config
    const existingFee = await MlmPlatformFeeConfig.findOne({ isActive: true });
    if (!existingFee) {
      const feeAmount = 500;
      const gstPercent = 18;
      await MlmPlatformFeeConfig.create({ version: 1, feeAmount, gstPercent, totalAmount: feeAmount + (feeAmount * gstPercent / 100), isActive: true, description: "Initial platform fee configuration" });
      results.platformFee = "Created with ?500 base + 18% GST = ?590 total";
    } else {
      results.platformFee = "Already exists — skipped";
    }

    // 3. Seed Share Config
    const existingShare = await MlmShareConfig.findOne({ key: "default" });
    if (!existingShare) {
      await MlmShareConfig.create({ key: "default", messageTemplate: DEFAULT_SHARE_MESSAGE, posterUrl: "", isActive: true });
      results.shareConfig = "Default share config created";
    } else {
      results.shareConfig = "Already exists — skipped";
    }

    // 4. Seed General Config
    const generalConfigs = [
      { key: "min_withdrawal_amount", value: 100, label: "Minimum Withdrawal Amount (?)" },
      { key: "max_withdrawal_per_day", value: 3, label: "Max Withdrawals Per Day" },
      { key: "fd_card_provider_url", value: "", label: "FD/Credit Card Provider URL (External)" },
      { key: "registration_open", value: true, label: "Registration Open" },
    ];
    let genCreated = 0;
    for (const gc of generalConfigs) {
      const exists = await MlmGeneralConfig.findOne({ key: gc.key });
      if (!exists) { await MlmGeneralConfig.create(gc); genCreated++; }
    }
    results.generalConfigs = `${genCreated} general configs created`;

    return NextResponse.json({ success: true, message: "NextView (MLM) seeded successfully!", results });
  } catch (error) {
    console.error("[MLM Seed]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
