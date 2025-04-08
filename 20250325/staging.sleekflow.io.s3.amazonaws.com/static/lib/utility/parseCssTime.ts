export function parseCssTime(time: string) {
  const parts = time.match(/([\d.]+)(s|ms)?/);
  if (!parts) {
    return;
  }
  const num = +parts[1];
  if (!num) {
    return;
  }
  switch (parts[2]) {
    case "s":
      return num * 1000;
    case "ms":
      return num;
    default:
      return num;
  }
}
