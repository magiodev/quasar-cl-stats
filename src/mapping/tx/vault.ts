import {BigInt, cosmos} from "@graphprotocol/graph-ts";
import { saveCoinFromAttribute, updateTotalTokens } from "../helpers";
import { VaultClaimReward, VaultDeposit, VaultRedeem } from "../../../generated/schema";

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
    deposit.tokensIn = updateTotalTokens(deposit.tokensIn, tokensIn);
    deposit.count = (deposit.count || BigInt.fromI32(0)).plus(BigInt.fromI32(1)); // Increment count
  }
  deposit.save();
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
    redeem.tokensOut = updateTotalTokens(redeem.tokensOut, tokensOut);
    redeem.count = (redeem.count || BigInt.fromI32(0)).plus(BigInt.fromI32(1)); // Increment count
  }
  redeem.save();
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
    claimReward.tokensOut = updateTotalTokens(claimReward.tokensOut, tokensOut);
    claimReward.count = (claimReward.count || BigInt.fromI32(0)).plus(BigInt.fromI32(1)); // Increment count
  }
  claimReward.save();
}
