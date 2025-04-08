import { useAppDispatch } from "AppRootContext";
import { useWhatsappTemplates } from "container/Settings/OfficialWhatsApp/useWhatsappTemplates";
import { useState } from "react";

export function useWhatsappCloudApiTemplate() {
  const [loading, setLoading] = useState(false);
  const loginDispatch = useAppDispatch();
  const { fetchCloudApiTemplates } = useWhatsappTemplates();

  async function refresh(wabaId?: string, configId?: number) {
    if (!(wabaId && configId)) {
      return;
    }
    setLoading(true);
    try {
      const result = await fetchCloudApiTemplates(wabaId, false);
      loginDispatch({
        type: "INBOX.WHATSAPP_CLOUDAPI.LOADED",
        channelId: configId,
        templates: result,
      });
    } catch (e) {
      console.error(`refreshCloudApi error ${e}`);
    } finally {
      setLoading(false);
    }
  }

  return {
    refresh,
    loading,
  };
}
