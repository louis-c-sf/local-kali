export function getPercentage(total: number, amount: number) {
  return total === 0 ? amount * 100 : amount / (total / 100);
}
