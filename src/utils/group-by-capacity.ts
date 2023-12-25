export function groupByCapacity<T>(items: T[], capacity: number) {
  return items.reduce(
    (acc, item) => {
      const index = acc.length - 1;
      const group = acc[index];
      if (group.length < capacity) {
        group.push(item);
      } else {
        acc.push([item]);
      }
      return acc;
    },
    [[]] as T[][]
  );
}

export function groupBy<Item, Key extends string | number | symbol, Result>(
  items: Item[],
  groupFn: (item: Item) => [Key, Result]
) {
  return items.reduce(
    (acc, item) => {
      const [key, group] = groupFn(item);

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(group);

      return acc;
    },
    {} as Record<Key, Result[]>
  );
}
