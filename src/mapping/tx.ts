import {extractAttributeValue} from "./helpers";
import {cosmos} from "@graphprotocol/graph-ts";
import {handleVaultClaimRewards, handleVaultDeposit, handleVaultRedeem} from "./tx/vault";

export function handleTxMsgExecuteContract(id: string, data: cosmos.TransactionData): void {
  const block = data.block
  const events = data.tx.result.events

  // Exact Deposit Condition
  if (events.some(e => e.eventType == 'wasm' &&
    e.attributes.some(a => a.key == 'method' && a.value == 'exact_deposit') &&
    e.attributes.some(a => a.key == 'action' && a.value == 'exact_deposit'))) {
    const sender = extractAttributeValue(events, 'message', 'sender')!
    const vault = extractAttributeValue(events, 'wasm', '_contract_address')!

    // Get effective deposit amounts (here we lose track of denoms strings, we will just save them as amount0 and amount1)
    const amount0 = extractAttributeValue(events, 'wasm', 'amount0') != null ? extractAttributeValue(events, 'wasm', 'amount0')! : "0"
    const amount1 = extractAttributeValue(events, 'wasm', 'amount1') != null ? extractAttributeValue(events, 'wasm', 'amount1')! : "0"
    const refund0 = extractAttributeValue(events, 'wasm', 'refund0') != null ? extractAttributeValue(events, 'wasm', 'refund0')! : "0"
    const refund1 = extractAttributeValue(events, 'wasm', 'refund1') != null ? extractAttributeValue(events, 'wasm', 'refund1')! : "0"

    const sharesMinted = extractAttributeValue(events, 'tf_mint', 'amount')!

    handleVaultDeposit(id, block, sender, vault, [amount0, amount1], [refund0, refund1], sharesMinted);
  }

  // Withdraw Condition
  if (events.some(e => e.eventType == 'wasm' &&
    e.attributes.some(a => a.key == 'method' && a.value == 'withdraw') &&
    e.attributes.some(a => a.key == 'action' && a.value == 'withdraw') &&
    e.attributes.some(a => a.key == 'liquidity_amount') &&
    e.attributes.some(a => a.key == 'share_amount'))) {
    const sender = extractAttributeValue(events, 'message', 'sender')!
    const vault = extractAttributeValue(events, 'wasm', '_contract_address')!
    const tokensOut = extractAttributeValue(events, 'coin_spent', 'amount')!
    const sharesBurned = extractAttributeValue(events, 'tf_burn', 'amount')!

    handleVaultRedeem(id, block, sender, vault, tokensOut, sharesBurned);
  }

  // Claim User Rewards Condition
  if (events.some(e => e.eventType == 'wasm' &&
    e.attributes.some(a => a.key == 'action' && a.value == 'claim_user_rewards') &&
    e.attributes.some(a => a.key == 'result' && a.value == 'success') &&
    e.attributes.some(a => a.key == 'recipient'))) {
    const sender = extractAttributeValue(events, 'message', 'sender')!
    const vault = extractAttributeValue(events, 'wasm', '_contract_address')!
    const tokensOut = extractAttributeValue(events, 'transfer', 'amount')!

    handleVaultClaimRewards(id, block, sender, vault, tokensOut);
  }
}