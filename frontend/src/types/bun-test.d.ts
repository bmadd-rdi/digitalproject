declare module "bun:test" {
  export function test(name: string, callback: () => unknown | Promise<unknown>): void;
  export function expect<T>(value: T): {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
    toHaveLength(expected: number): void;
    not: {
      toHaveProperty(property: string): void;
    };
  };
}
