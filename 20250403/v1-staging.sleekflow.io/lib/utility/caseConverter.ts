import { camelCase, snakeCase, transform, isObject } from "lodash-es";

export type CaseConverterParamsType = Record<string, unknown>;

export const snakelize = (obj: CaseConverterParamsType) =>
  transform(
    obj,
    (result: CaseConverterParamsType, value: unknown, key: string, target) => {
      const camelKey = Array.isArray(target) ? key : snakeCase(key);
      result[camelKey] = isObject(value)
        ? snakelize(value as CaseConverterParamsType)
        : value;
    }
  );

export const camelize = (obj: CaseConverterParamsType) =>
  transform(
    obj,
    (result: CaseConverterParamsType, value: unknown, key: string, target) => {
      const camelKey = Array.isArray(target) ? key : camelCase(key);
      result[camelKey] = isObject(value)
        ? camelize(value as CaseConverterParamsType)
        : value;
    }
  );
