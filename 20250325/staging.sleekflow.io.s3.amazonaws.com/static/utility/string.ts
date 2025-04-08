import i18n from "i18n";
import { deburr } from "lodash-es";

export function n(number: number, singular: string, plural: string) {
  return `${number} ${plur(number, singular, plural)}`;
}

export function plur(number: number, singular: string, plural: string) {
  return number <= 1 ? singular : plural;
}

export function toFloat(input: string) {
  const number = parseFloat(input);
  return isNaN(number) ? null : number;
}

export function formatNumber(
  number: number,
  options?: Intl.NumberFormatOptions
) {
  if (window.Intl == undefined) {
    return number.toFixed(2);
  }
  return window.Intl.NumberFormat(i18n.language, options).format(number);
}

export function formatCurrency(amount: number, currency?: string) {
  let options: Intl.NumberFormatOptions = {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    minimumSignificantDigits: 3,
  };
  if (currency) {
    options = { ...options, style: "currency", currency };
  }
  return formatNumber(Number(amount.toFixed(2)), {
    ...options,
  });
}

export function getSearchParts(
  search: string,
  input: string
): [string, string, string] | undefined {
  const regex = new RegExp(
    deburr(search.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&")),
    "ig"
  );
  // const regex = `/${deburr(search)}/ig`;
  const matchPos = deburr(input).search(regex);
  if (matchPos !== -1) {
    const textBefore = input.substring(0, matchPos);
    const textFound = input.substr(matchPos, search.length);
    const textAfter = input.substring(matchPos + search.length);
    return [textBefore, textFound, textAfter];
  }
}
