import {cosmos} from "@graphprotocol/graph-ts";
import {saveCoinFromAttribute, updateTotalTokens} from "../helpers";
import {
  VaultClaimReward,
  VaultDeposit,
  VaultRedeem
} from "../../../generated/schema";

export function handleVaultDeposit(id: string, block: cosmos.HeaderOnlyBlock, vault: string, tokensIn: string[], tokensOut: string[]): void {
  const depositId = `${vault}-${block.header.hash.toHexString()}`; // TODO: Move outside
  let deposit = VaultDeposit.load(depositId);
  if (!deposit) {
    deposit = new VaultDeposit(depositId);
    deposit.block = block.header.hash.toHexString(); // Relate to Block.id
    deposit.vault = vault;
    deposit.tokensIn = tokensIn.map(token => saveCoinFromAttribute(depositId, token));
    deposit.tokensOut = tokensOut.map(token => saveCoinFromAttribute(depositId, token));
  } else {
    // Update existing deposit with new totals (this logic might depend on your specific requirements)
    deposit.tokensIn = updateTotalTokens(deposit.tokensIn, tokensIn);
    deposit.tokensOut = updateTotalTokens(deposit.tokensOut, tokensOut);
    // TODO: Missing fields
  }
  deposit.save();
}

export function handleVaultRedeem(id: string, block: cosmos.HeaderOnlyBlock, vault: string, tokensOut: string, sharesBurned: string): void {
  const redeemId = `${vault}-${block.header.hash.toHexString()}`; // TODO: Move outside
  let redeem = VaultRedeem.load(redeemId);
  if (!redeem) {
    redeem = new VaultRedeem(redeemId);
    redeem.block = block.header.hash.toHexString();
    redeem.vault = vault;
    redeem.tokensOut = tokensOut.split(',').map(token => saveCoinFromAttribute(redeemId, token));
    // TODO: Missing fields
  } else {
    // Update the tokensOut array by aggregating the new tokens
    redeem.tokensOut = updateTotalTokens(redeem.tokensOut, tokensOut.split(',').map(token => saveCoinFromAttribute(redeemId, token)));
    // TODO: Missing fields
  }
  redeem.save();
}

export function handleVaultClaimRewards(id: string, block: cosmos.HeaderOnlyBlock, vault: string, tokensOut: string): void {
  const claimRewardId = `${vault}-${block.header.hash.toHexString()}`; // TODO: Move outside
  let claimReward = VaultClaimReward.load(claimRewardId);
  if (!claimReward) {
    claimReward = new VaultClaimReward(claimRewardId);
    claimReward.block = block.header.hash.toHexString();
    claimReward.vault = vault;
    claimReward.tokensOut = tokensOut.split(',').map(token => saveCoinFromAttribute(claimRewardId, token));
    // TODO: Missing fields
  } else {
    // Aggregate new tokensOut with existing ones
    claimReward.tokensOut = updateTotalTokens(claimReward.tokensOut, tokensOut.split(',').map(token => saveCoinFromAttribute(claimRewardId, token)));
    // TODO: Missing fields
  }
  claimReward.save();
}
