const IGNORE_SEARCH_MESSAGE_ENDPOINT_BACKEND_CACHE_LOCAL_STORAGE_KEY =
  'ignoreSearchMessageEndpointBackendCache';

export const ignoreSearchMessageEndpointBackendCacheForOneMinute = () => {
  localStorage.setItem(
    IGNORE_SEARCH_MESSAGE_ENDPOINT_BACKEND_CACHE_LOCAL_STORAGE_KEY,
    new Date(Date.now() + 60_000).toISOString(),
  );
};

export const shouldIgnoreSearchMessageEndpointBackendCache = () => {
  const ignoreUntil = localStorage.getItem(
    IGNORE_SEARCH_MESSAGE_ENDPOINT_BACKEND_CACHE_LOCAL_STORAGE_KEY,
  );

  if (!ignoreUntil) {
    return false;
  }

  const now = new Date();
  const prevDate = new Date(ignoreUntil);

  if (prevDate < now) {
    localStorage.removeItem(
      IGNORE_SEARCH_MESSAGE_ENDPOINT_BACKEND_CACHE_LOCAL_STORAGE_KEY,
    );
    return false;
  }

  return prevDate > now;
};
