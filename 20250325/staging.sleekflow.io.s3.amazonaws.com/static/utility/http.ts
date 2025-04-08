import queryString from "query-string";

export function getHttpQueryParam(name: string): string | undefined {
  if (!window.location.search) {
    return;
  }
  const parsed = queryString.parse(window.location.search);
  const parsedValue = parsed[name];

  return typeof parsedValue === "string" ? parsedValue : undefined;
}
