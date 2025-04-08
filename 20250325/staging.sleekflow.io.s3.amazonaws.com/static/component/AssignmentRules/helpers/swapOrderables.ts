export function swapOrderables<T extends { order: number }>(
  items: T[],
  indexFrom: number,
  indexTo: number
) {
  let newItems = moveItem(items, indexFrom, indexTo);

  return newItems.reduce<T[]>((acc, item, i) => {
    return [...acc, { ...item, order: item.order = i + 1 }];
  }, []);
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  const moveResult = [...items];
  const moved = items[from];
  moveResult.splice(from, 1);
  moveResult.splice(to, 0, moved);
  return moveResult;
}
