import {BigInt, cosmos} from "@graphprotocol/graph-ts";
import { saveCoinFromAttribute, updateTotalTokens } from "../helpers";
import {
  VaultClaimReward,
  VaultClaimRewardHistory,
  VaultDeposit, VaultDepositHistory,
  VaultRedeem, VaultRedeemHistory,
  VaultUser,
  VaultUserHistory
} from "../../../generated/schema";

export function handleVaultDeposit(id: string, block: cosmos.HeaderOnlyBlock, vault: string, tokensIn: string[], tokensOut: string[]): void {
  let deposit = VaultDeposit.load(id);

  if (!deposit) {
    deposit = new VaultDeposit(id);
    deposit.block = block.header.hash.toHexString(); // Relate to Block.id
    deposit.vault = vault;
    deposit.tokensIn = tokensIn.map(token => saveCoinFromAttribute(id, token));
    deposit.tokensOut = tokensOut.map(token => saveCoinFromAttribute(id, token));
    deposit.count = BigInt.fromI32(1); // Initialize count
  } else {
    deposit.block = block.header.hash.toHexString(); // Relate to Block.id
    deposit.tokensIn = updateTotalTokens(deposit.tokensIn, tokensIn);
    deposit.count = (deposit.count || BigInt.fromI32(0)).plus(BigInt.fromI32(1)); // Increment count
  }
  deposit.save();

  // History
  let depositHistory = new VaultDepositHistory(`${id}-${block.header.height}`);
  depositHistory.deposit = deposit.id;
  depositHistory.block = block.header.hash.toHexString();
  depositHistory.vault = vault;
  depositHistory.tokensIn = deposit.tokensIn;
  depositHistory.count = deposit.count;
  depositHistory.save();

  // Update VaultUser
  const userId = `${user}-${vault}`;
  let vaultUser = VaultUser.load(userId) || new VaultUser(userId);
  vaultUser.block = block.header.hash.toHexString();
  vaultUser.vault = vault;
  vaultUser.deposits = vaultUser.deposits.plus(BigInt.fromI32(1));
  vaultUser.tokensIn = updateTotalTokens(vaultUser.tokensIn, tokensIn);
  vaultUser.tokensOut = updateTotalTokens(vaultUser.tokensOut, tokensOut);  // If you want to track net tokens in/out
  vaultUser.sharesBalance = vaultUser.sharesBalance.plus(sharesMinted);  // You need to calculate sharesMinted
  vaultUser.save();

  // Add to VaultUserHistory
  const historyId = `${userId}-${block.header.height.toString()}`;
  let vaultUserHistory = new VaultUserHistory(historyId);
  vaultUserHistory.user = vaultUser.id;
  vaultUserHistory.block = block.header.hash.toHexString();
  vaultUserHistory.vault = vault;
  vaultUserHistory.tokensIn = tokensIn.map(token => saveCoinFromAttribute(historyId, token));
  vaultUserHistory.tokensOut = tokensOut.map(token => saveCoinFromAttribute(historyId, token));
  vaultUserHistory.deposits = vaultUser.deposits;
  vaultUserHistory.redeems = vaultUser.redeems;  // Initialize or carry over
  vaultUserHistory.claims = vaultUser.claims;  // Initialize or carry over
  vaultUserHistory.sharesBalance = vaultUser.sharesBalance;
  vaultUserHistory.save();
}

export function handleVaultRedeem(id: string, block: cosmos.HeaderOnlyBlock, vault: string, tokensOut: string[], sharesBurned: string): void {
  let redeem = VaultRedeem.load(id);

  if (!redeem) {
    redeem = new VaultRedeem(id);
    redeem.block = block.header.hash.toHexString();
    redeem.vault = vault;
    redeem.tokensOut = tokensOut.map(token => saveCoinFromAttribute(id, token));
    redeem.count = BigInt.fromI32(1); // Initialize count
  } else {
    redeem.block = block.header.hash.toHexString();
    redeem.tokensOut = updateTotalTokens(redeem.tokensOut, tokensOut);
    redeem.count = (redeem.count || BigInt.fromI32(0)).plus(BigInt.fromI32(1)); // Increment count
  }
  redeem.save();

  // Hisotry
  let redeemHistory = new VaultRedeemHistory(`${id}-${block.header.height}`);
  redeemHistory.redeem = redeem.id;
  redeemHistory.block = block.header.hash.toHexString();
  redeemHistory.vault = vault;
  redeemHistory.tokensOut = redeem.tokensOut;
  redeemHistory.count = redeem.count;
  redeemHistory.save();

  // Update VaultUser
  const userId = `${sender}-${vault}`;
  let vaultUser = VaultUser.load(userId);
  if (!vaultUser) {
    vaultUser = new VaultUser(userId);
    vaultUser.block = block.header.hash.toHexString();
    vaultUser.vault = vault;
    vaultUser.redeems = BigInt.fromI32(1);
    vaultUser.tokensIn = []; // Initialize if needed
    vaultUser.tokensOut = tokensOut.map(token => saveCoinFromAttribute(userId, token));
    vaultUser.sharesBalance = BigInt.fromString(sharesBurned).neg();  // Initialize shares balance negatively if no prior data
  } else {
    vaultUser.block = block.header.hash.toHexString();
    vaultUser.redeems = vaultUser.redeems.plus(BigInt.fromI32(1));
    vaultUser.tokensOut = updateTotalTokens(vaultUser.tokensOut, tokensOut);
    vaultUser.sharesBalance = vaultUser.sharesBalance.minus(BigInt.fromString(sharesBurned));
  }
  vaultUser.save();

  // Add to VaultUserHistory
  const historyId = `${id}-${sender}-${vault}`; // prepend with {blockHashHex}-{txIndex}-{...}
  let vaultUserHistory = new VaultUserHistory(historyId);
  vaultUserHistory.user = vaultUser.id;
  vaultUserHistory.block = block.header.hash.toHexString();
  vaultUserHistory.vault = vault;
  vaultUserHistory.tokensIn = vaultUser.tokensIn;
  vaultUserHistory.tokensOut = tokensOut.map(token => saveCoinFromAttribute(historyId, token));
  vaultUserHistory.deposits = vaultUser.deposits; // Carry over existing values
  vaultUserHistory.redeems = vaultUser.redeems;
  vaultUserHistory.claims = vaultUser.claims; // Carry over existing values
  vaultUserHistory.sharesBalance = vaultUser.sharesBalance;
  vaultUserHistory.save();
}

export function handleVaultClaimRewards(id: string, block: cosmos.HeaderOnlyBlock, vault: string, tokensOut: string[]): void {
  let claimReward = VaultClaimReward.load(id);

  if (!claimReward) {
    claimReward = new VaultClaimReward(id);
    claimReward.block = block.header.hash.toHexString();
    claimReward.vault = vault;
    claimReward.tokensOut = tokensOut.map(token => saveCoinFromAttribute(id, token));
    claimReward.count = BigInt.fromI32(1); // Initialize count
  } else {
    claimReward.block = block.header.hash.toHexString();
    claimReward.tokensOut = updateTotalTokens(claimReward.tokensOut, tokensOut);
    claimReward.count = (claimReward.count || BigInt.fromI32(0)).plus(BigInt.fromI32(1)); // Increment count
  }
  claimReward.save();

  // History
  let claimRewardHistory = new VaultClaimRewardHistory(`${id}-${block.header.height}`);
  claimRewardHistory.claimReward = claimReward.id;
  claimRewardHistory.block = block.header.hash.toHexString();
  claimRewardHistory.vault = vault;
  claimRewardHistory.tokensOut = claimReward.tokensOut;
  claimRewardHistory.count = claimReward.count;
  claimRewardHistory.save();

  // Update VaultUser
  const userId = `${user}-${vault}`;
  let vaultUser = VaultUser.load(userId);
  if (!vaultUser) {
    vaultUser = new VaultUser(userId);
    vaultUser.block = block.header.hash.toHexString();
    vaultUser.vault = vault;
    vaultUser.claims = BigInt.fromI32(1);
    vaultUser.tokensIn = []; // Initialize if needed
    vaultUser.tokensOut = tokensOut.map(token => saveCoinFromAttribute(userId, token)); // Adjust if needed to reflect claims
    vaultUser.sharesBalance = BigInt.fromI32(0); // Initialize if no prior data
  } else {
    vaultUser.block = block.header.hash.toHexString();
    vaultUser.claims = vaultUser.claims.plus(BigInt.fromI32(1));
    vaultUser.tokensOut = updateTotalTokens(vaultUser.tokensOut, tokensOut); // Reflect the rewards claimed
  }
  vaultUser.save();

  // Add to VaultUserHistory
  const historyId = `${userId}-${block.header.height.toString()}`;
  let vaultUserHistory = new VaultUserHistory(historyId);
  vaultUserHistory.user = vaultUser.id;
  vaultUserHistory.block = block.header.hash.toHexString();
  vaultUserHistory.vault = vault;
  vaultUserHistory.tokensIn = vaultUser.tokensIn; // Carry over
  vaultUserHistory.tokensOut = vaultUser.tokensOut; // Include the claimed rewards
  vaultUserHistory.deposits = vaultUser.deposits; // Carry over
  vaultUserHistory.redeems = vaultUser.redeems; // Carry over
  vaultUserHistory.claims = vaultUser.claims;
  vaultUserHistory.sharesBalance = vaultUser.sharesBalance; // Carry over
  vaultUserHistory.save();
}
