import { useLayoutEffect, useRef, useState } from "react";

export function useImagePlaceholder(src: string | undefined) {
  const [loadingSrc, setLoadingSrc] = useState<string>();
  const [loadedSrc, setLoadedSrc] = useState<string>();
  const [failed, setFailed] = useState(false);
  const imgLoader = useRef<HTMLImageElement | null>();

  const loaded = loadedSrc === src;
  const loading = loadingSrc === src;

  useLayoutEffect(() => {
    if (src === undefined) {
      return;
    }
    if (loading || loaded) {
      return;
    }
    setLoadingSrc(src);
    setLoadedSrc(undefined);
    setFailed(false);
    imgLoader.current = new Image();

    function endLoading(this: HTMLImageElement) {
      setLoadedSrc(src);
      setLoadingSrc(undefined);
      this.removeEventListener("load", endLoading);
      this.removeEventListener("error", rollbackError);
      setFailed(false);
    }

    function rollbackError(e: any) {
      console.error("useImagePlaceholder load", e);
      setLoadedSrc(undefined);
      setLoadingSrc(undefined);
      setFailed(true);
    }

    imgLoader.current.addEventListener("load", endLoading);
    imgLoader.current.addEventListener("error", rollbackError);
    imgLoader.current.src = src;
  }, [src, loading, loaded]);

  return {
    loaded: loaded,
    loading: loading,
    failed,
  };
}
