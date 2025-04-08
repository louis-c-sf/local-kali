export function tryEncodeURL(
  jsonObject: Record<string, unknown> | Record<string, unknown>[],
) {
  if (jsonObject) {
    try {
      return encodeToBinary(JSON.stringify(jsonObject));
    } catch (e) {
      console.warn(e);
      return '';
    }
  }
  return '';
}

export function safeJSONParse<TReturn>(jsonString: string) {
  if (jsonString) {
    try {
      const o = JSON.parse(jsonString);
      // Handle non-exception-throwing cases:
      // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
      // but... JSON.parse(null) returns null, and typeof null === "object",
      // so we must check for that, too. Thankfully, null is falsey, so this suffices:
      if (o && typeof o === 'object') {
        return o as TReturn;
      }
      return false;
    } catch (e) {
      console.warn(e);
      return false;
    }
  }
  return false;
}

export function tryParseEncodedURL<TReturn>(jsonString: string | null) {
  if (jsonString) {
    return safeJSONParse<TReturn>(decodeFromBinary(jsonString));
  }
  return false;
}

// Copied from Tanstack Router
// https://tanstack.com/router/v1/docs/guide/custom-search-param-serialization
export function decodeFromBinary(str: string): string {
  return decodeURIComponent(
    Array.prototype.map
      .call(window.atob(str), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );
}

export function encodeToBinary(str: string): string {
  return window.btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    }),
  );
}

export function base64UrlEncode(data: string) {
  // Convert string data to Base64
  let base64 = btoa(data);

  // Modify Base64 to make it URL-friendly
  base64 = base64.replace('+', '-');
  base64 = base64.replace('/', '_');
  base64 = base64.replace(/=+$/, '');

  return base64;
}
