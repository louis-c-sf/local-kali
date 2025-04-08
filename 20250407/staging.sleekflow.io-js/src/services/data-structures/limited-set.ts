export class LimitedSet<T> {
  private readonly limit: number;
  private set: Set<T>;
  private keyOrder: T[];

  constructor(limit = 1000) {
    this.limit = limit;
    this.set = new Set<T>();
    this.keyOrder = [];
  }

  add(key: T): void {
    if (!this.set.has(key)) {
      if (this.set.size >= this.limit) {
        const oldestKey = this.keyOrder.shift();
        this.set.delete(oldestKey!);
      }
      this.set.add(key);
      this.keyOrder.push(key);
    }
  }

  has(key: T): boolean {
    return this.set.has(key);
  }

  delete(key: T): void {
    if (this.set.has(key)) {
      this.set.delete(key);
      const index = this.keyOrder.indexOf(key);
      if (index !== -1) {
        this.keyOrder.splice(index, 1);
      }
    }
  }

  clear(): void {
    this.set.clear();
    this.keyOrder = [];
  }

  get size(): number {
    return this.set.size;
  }
}
