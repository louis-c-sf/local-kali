export function downloadFromUrl(url, options) {
  const anchorElement = document.createElement('a');
  anchorElement.href = url;
  anchorElement.download = options.fileName !== null && options.fileName !== void 0 ? options.fileName : '';
  anchorElement.click();
  anchorElement.remove();
}
export function downloadFromBytes(content, options) {
  const contentType = options.contentType || 'application/octet-stream';
  const base64String = btoa(String.fromCharCode(...content));
  const url = `data:${contentType}";base64,${base64String}`;
  downloadFromUrl(url, { fileName: options.fileName });
}
export function downloadFromText(content, options) {
  const utf8Encode = new TextEncoder();
  const bytes = utf8Encode.encode(content);
  downloadFromBytes(bytes, options);
}
export function downloadFromBlob(content, options) {
  const url = window.URL.createObjectURL(content);
  downloadFromUrl(url, options);
}
