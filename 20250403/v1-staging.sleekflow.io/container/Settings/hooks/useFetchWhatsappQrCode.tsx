import { useCallback } from "react";
import { getWithExceptions } from "../../../api/apiRequest";
import { QrCodeInfoType } from "../../../component/shared/QrCodeInfoType";

export const useFetchWhatsappQrCode = () => {
  const fetchQrCodeInfo = useCallback(async (path: string): Promise<
    QrCodeInfoType | undefined
  > => {
    try {
      const result = await getWithExceptions(path, { param: {} });
      if (result) {
        return {
          qrcodeBase64: `data:image/png;base64, ${result.qrcodeBase64}`,
          qrcodeUrl: result.qrcodeUrl,
          url: result.url,
        };
      }
    } catch (e) {
      console.error("e: ", e);
    }
  }, []);

  return {
    fetchQrCodeInfo,
  };
};
