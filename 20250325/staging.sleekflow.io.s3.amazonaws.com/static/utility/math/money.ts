import Decimal, { Numeric } from "decimal.js-light";

export function money(amount: Numeric) {
  return new Decimal(amount).toDecimalPlaces(2);
}
