export declare function groupByCapacity<T>(items: T[], capacity: number): T[][];
export declare function groupBy<Item, Key extends string | number | symbol, Result>(items: Item[], groupFn: (item: Item) => [Key, Result]): Record<Key, Result[]>;
