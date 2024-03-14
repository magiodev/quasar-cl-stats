import {cosmos, BigInt} from "@graphprotocol/graph-ts";

// Schema imports
import {Block} from "../generated/schema";

// Mapping imports
import {handleTxMsgExecuteContract} from "./mapping/tx";

/*
 * @blockHandlers
 */

export function handleBlock(bl: cosmos.Block): void {
  const hash = bl.header.hash.toHexString();
  const height = BigInt.fromString(bl.header.height.toString());
  const block = new Block(hash);

  block.height = height;

  block.timestamp = BigInt.fromString(bl.header.time.seconds.toString());

  block.save();
}

/*
 * @transactionHandlers
 */

export function handleTx(data: cosmos.TransactionData): void {
  const id = `${data.block.header.hash.toHexString()}-${data.tx.index}`;
  const messages = data.tx.tx.body.messages;

  for (let i = 0; i < messages.length; i++) {
    if (messages[i].typeUrl == "/cosmwasm.wasm.v1.MsgExecuteContract") handleTxMsgExecuteContract(`${id}-${i}`, data)
  }
}
