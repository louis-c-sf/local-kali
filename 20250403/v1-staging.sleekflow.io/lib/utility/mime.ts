export function isAudioMime(mime: string | undefined) {
  return mime ? /^audio/i.test(mime) : false;
}

export function isVideoMime(mime: string | undefined) {
  return mime ? /^video/i.test(mime) : false;
}

export function isImageMime(mime: string | undefined) {
  return mime ? /^image/i.test(mime) && !/.+dwg$/i.test(mime) : false;
}

export function isPdfMime(mime: string | undefined) {
  return mime === "application/pdf";
}
