import { useAppDispatch } from "AppRootContext";
import { useWhatsappTemplates } from "container/Settings/OfficialWhatsApp/useWhatsappTemplates";
import { useState } from "react";

export function useWhatsapp360Template() {
  const { refresh360Templates } = useWhatsappTemplates();
  const loginDispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  async function refresh(configId?: string) {
    const configIdParsed = Number(configId) || null;
    if (configIdParsed === null || !Number.isFinite(configIdParsed)) {
      return;
    }
    setLoading(true);
    try {
      const templateResponse = await refresh360Templates(configIdParsed);
      if (!templateResponse) {
        return;
      }
      loginDispatch({
        type: "INBOX.WHATSAPP_360TEMPLATE.LOADED",
        templates: templateResponse,
      });
    } catch (e) {
      console.error(`refresh360Templates error:${e}`);
    } finally {
      setLoading(false);
    }
  }
  return {
    refresh,
    loading,
  };
}
