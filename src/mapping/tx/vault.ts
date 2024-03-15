import {BigInt, cosmos} from "@graphprotocol/graph-ts";
import {saveCoinFromAttribute, updateTotalTokens} from "../helpers";
import {
  VaultClaimReward,
  VaultClaimRewardHistory,
  VaultDeposit, VaultDepositHistory,
  VaultRedeem, VaultRedeemHistory,
  User,
  UserHistory
} from "../../../generated/schema";

export function handleVaultDeposit(id: string, block: cosmos.HeaderOnlyBlock, sender: string, vault: string, tokensIn: string[], tokensOut: string[], sharesMinted: string): void {
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

  // Update User
  const userId = `${sender}-${vault}`;
  let user = User.load(userId) || new User(userId);
  user.block = block.header.hash.toHexString();
  user.user = sender;
  user.vault = vault;
  user.deposits = user.deposits!.plus(BigInt.fromI32(1));
  user.tokensIn = updateTotalTokens(user.tokensIn, tokensIn);
  user.tokensOut = updateTotalTokens(user.tokensOut, tokensOut);  // If you want to track net tokens in/out
  user.sharesBalance = user.sharesBalance!.plus(BigInt.fromString(sharesMinted));  // You need to calculate sharesMinted
  user.save();

  // Add to UserHistory
  const historyId = `${userId}-${block.header.height.toString()}`;
  let userHistory = new UserHistory(historyId);
  userHistory.user = user.id;
  userHistory.block = block.header.hash.toHexString();
  userHistory.user = sender;
  userHistory.vault = vault;
  userHistory.tokensIn = tokensIn.map(token => saveCoinFromAttribute(historyId, token));
  userHistory.tokensOut = tokensOut.map(token => saveCoinFromAttribute(historyId, token));
  userHistory.deposits = user.deposits;
  userHistory.redeems = user.redeems;  // Initialize or carry over
  userHistory.claims = user.claims;  // Initialize or carry over
  userHistory.sharesBalance = user.sharesBalance;
  userHistory.save();
}

export function handleVaultRedeem(id: string, block: cosmos.HeaderOnlyBlock, sender: string, vault: string, tokensOut: string[], sharesBurned: string): void {
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

  // History
  let redeemHistory = new VaultRedeemHistory(`${id}-${block.header.height}`);
  redeemHistory.redeem = redeem.id;
  redeemHistory.block = block.header.hash.toHexString();
  redeemHistory.vault = vault;
  redeemHistory.tokensOut = redeem.tokensOut;
  redeemHistory.count = redeem.count;
  redeemHistory.save();

  // Update User
  const userId = `${sender}-${vault}`;
  let user = User.load(userId);
  if (!user) {
    user = new User(userId);
    user.block = block.header.hash.toHexString();
    user.user = sender;
    user.vault = vault;
    user.redeems = BigInt.fromI32(1);
    user.tokensIn = []; // Initialize if needed
    user.tokensOut = tokensOut.map(token => saveCoinFromAttribute(userId, token));
    user.sharesBalance = BigInt.fromString(sharesBurned).neg();  // Initialize shares balance negatively if no prior data
  } else {
    user.block = block.header.hash.toHexString();
    user.redeems = user.redeems!.plus(BigInt.fromI32(1));
    user.tokensOut = updateTotalTokens(user.tokensOut, tokensOut);
    user.sharesBalance = user.sharesBalance!.minus(BigInt.fromString(sharesBurned));
  }
  user.save();

  // Add to UserHistory
  const historyId = `${id}-${user}-${vault}`; // prepend with {blockHashHex}-{txIndex}-{...}
  let userHistory = new UserHistory(historyId);
  userHistory.user = user.id;
  userHistory.block = block.header.hash.toHexString();
  userHistory.user = sender;
  userHistory.vault = vault;
  userHistory.tokensIn = user.tokensIn;
  userHistory.tokensOut = tokensOut.map(token => saveCoinFromAttribute(historyId, token));
  userHistory.deposits = user.deposits; // Carry over existing values
  userHistory.redeems = user.redeems;
  userHistory.claims = user.claims; // Carry over existing values
  userHistory.sharesBalance = user.sharesBalance;
  userHistory.save();
}

export function handleVaultClaimRewards(id: string, block: cosmos.HeaderOnlyBlock, sender: string, vault: string, tokensOut: string[]): void {
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

  // Update User
  const userId = `${sender}-${vault}`;
  let user = User.load(userId);
  if (!user) {
    user = new User(userId);
    user.block = block.header.hash.toHexString();
    user.user = sender;
    user.vault = vault;
    user.claims = BigInt.fromI32(1);
    user.tokensIn = []; // Initialize if needed
    user.tokensOut = tokensOut.map(token => saveCoinFromAttribute(userId, token)); // Adjust if needed to reflect claims
    user.sharesBalance = BigInt.fromI32(0); // Initialize if no prior data
  } else {
    user.block = block.header.hash.toHexString();
    user.claims = user.claims!.plus(BigInt.fromI32(1));
    user.tokensOut = updateTotalTokens(user.tokensOut, tokensOut); // Reflect the rewards claimed
  }
  user.save();

  // Add to UserHistory
  const historyId = `${userId}-${block.header.height.toString()}`;
  let userHistory = new UserHistory(historyId);
  userHistory.user = user.id;
  userHistory.block = block.header.hash.toHexString();
  userHistory.vault = vault;
  userHistory.tokensIn = user.tokensIn; // Carry over
  userHistory.tokensOut = user.tokensOut; // Include the claimed rewards
  userHistory.deposits = user.deposits; // Carry over
  userHistory.redeems = user.redeems; // Carry over
  userHistory.claims = user.claims;
  userHistory.sharesBalance = user.sharesBalance; // Carry over
  userHistory.save();
}
