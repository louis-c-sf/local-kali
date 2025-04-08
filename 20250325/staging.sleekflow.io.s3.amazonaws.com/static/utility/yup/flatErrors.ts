import { isObject } from "lodash-es";

export function flatErrors(
  errors: undefined | string | object | Array<string | object>
): string[] {
  if (errors === undefined) {
    return [];
  }

  if (typeof errors === "string") {
    return [errors];
  }

  let errorsArray: Array<
    undefined | object | string[] | object[]
  > = Array.isArray(errors)
    ? errors
    : isObject(errors)
    ? Object.values(errors)
    : [];

  return errorsArray.reduce<string[]>((acc, err) => {
    return acc.concat(flatErrors(err));
  }, []);
}
