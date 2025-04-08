export function baseName(path: string) {
  const matches = path.match(/\/?([^/]+)$/);
  if (matches !== null) {
    return matches[1];
  }
  return path;
}
