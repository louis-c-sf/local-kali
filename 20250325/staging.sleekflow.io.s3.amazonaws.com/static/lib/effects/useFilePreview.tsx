import { useEffect, useState } from "react";

export default useFilePreview;

function useFilePreview(file: File | undefined) {
  const [src, setSrc] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (file === undefined) {
      setSrc(undefined);
      setLoading(false);
      return;
    }
    setLoading(true);
    let reader = new FileReader();

    const completeLoad = () => {
      setSrc(reader.result as string);
      setLoading(false);
    };

    try {
      reader.addEventListener("load", completeLoad);
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e, { file, reader });
      setLoading(false);
    }
    return () => {
      reader.removeEventListener("load", completeLoad);
    };
  }, [file?.name]);

  return { src, loading };
}
