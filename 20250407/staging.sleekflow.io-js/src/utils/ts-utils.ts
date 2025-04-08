import { AjaxError } from 'rxjs/ajax';

// Utility to get Array element type from array type
export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

// source: https://stackoverflow.com/questions/48230773/how-to-create-a-partial-like-that-requires-a-single-property-to-be-set/48244432#48244432
// Utility to make sure user satisfies 1 condition or the other
export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];

export function notEmpty<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  return value !== null && value !== undefined;
}

// Readonly to Mutable types
export type Mutable<Type> = {
  -readonly [Key in keyof Type]: Type[Key];
};

export type ObjectEntries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export function exhaustiveGuard(_value: never, message: string): never {
  throw new Error(message);
}

export function isAjaxError(error: unknown): error is AjaxError {
  return error instanceof Error && error.name === 'AjaxError';
}

export type NonNullableProperties<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};
