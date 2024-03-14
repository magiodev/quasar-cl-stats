import {Block, Coin} from "../../generated/schema";
import {BigInt, cosmos} from "@graphprotocol/graph-ts";

export function updateTotalTokens(existingTokens: string[], newTokens: string[]): string[] {
  // Convert token strings to a map for easy accumulation
  let tokenMap = new Map<string, bigint>();

  // Process existing tokens
  existingTokens.forEach(tokenStr => {
    const token = saveCoinFromAttribute("", tokenStr); // Assuming saveCoinFromAttribute returns "denom-amount"
    const [denom, amount] = token.split('-');
    tokenMap.set(denom, (tokenMap.get(denom) || BigInt(0)) + BigInt(amount));
  });

  // Process new tokens
  newTokens.forEach(tokenStr => {
    const token = saveCoinFromAttribute("", tokenStr); // Assuming the same about saveCoinFromAttribute
    const [denom, amount] = token.split('-');
    tokenMap.set(denom, (tokenMap.get(denom) || BigInt(0)) + BigInt(amount));
  });

  // Convert the map back to the expected string array format
  return Array.from(tokenMap.entries()).map(([denom, amount]) => `${denom}-${amount.toString()}`);
}

export function saveCoinFromAttribute(id: string, data: string): string {
  const coin = new Coin(id);

  // When assets are transferred through IBC, they lose their original denomination (i.e ATOM)
  // and obtain a new IBC denomination (i.e. ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2).
  // Check this page (https://docs.osmosis.zone/developing/assets/asset-info.html) for a full list of IBC denomination
  // Both amount and denomination come together in the message value (i.e. 123456uatom), so we need to separate them.
  let tokenDenomLength = data.includes('ibc') ? 68 : 5 // IBC denomination is 68 characters long, OSMO is 5 characters long.

  coin.denom = data.substring(data.length - tokenDenomLength, data.length);
  coin.amount = data.substring(0, data.length - tokenDenomLength);
  coin.save();

  return id;
}

export function extractAttributeValue(events: cosmos.Event[], eventType: string, attributeKey: string): string | null {
  for (let i = 0; i < events.length; i++) {
    if (events[i].eventType == eventType) {
      for (let j = 0; j < events[i].attributes.length; j++) {
        if (events[i].attributes[j].key == attributeKey) {
          return events[i].attributes[j].value;
        }
      }
    }
  }
  return null;
}

export function extractNumericPart(input: string): string {
  let result: string = "";
  for (let i = 0; i < input.length; i++) {
    if (input.charCodeAt(i) >= 48 && input.charCodeAt(i) <= 57) { // ASCII codes for 0-9
      result += input.charAt(i);
    } else {
      // Once you hit a non-numeric character, break out of the loop
      break;
    }
  }
  return result;
}