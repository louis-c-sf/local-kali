import { useState } from "react";
import { append, assoc, equals, reject } from "ramda";
import { useFlashMessageChannel } from "../../../../component/BannerMessage/flashBannerMessage";
import { useTranslation } from "react-i18next";
import { GetObjectUrlInterface } from "../../components/ObjectsGrid/ObjectsGridContextType";

export function useSalesforceObjectLink(props: {
  getLeadUrl: GetObjectUrlInterface;
}) {
  const { getLeadUrl } = props;
  const [loadingLinkIds, setLoadingLinkIds] = useState<string[]>([]);
  const [linksLoaded, setLinksLoaded] = useState<Record<string, string>>({});

  const flash = useFlashMessageChannel();
  const { t } = useTranslation();

  async function fetchLink(id: string) {
    if (linksLoaded[id]) {
      return linksLoaded[id];
    }
    setLoadingLinkIds(append(id));
    try {
      const url = await getLeadUrl(id);
      if (url) {
        setLinksLoaded(assoc(id, url));
        return url;
      } else {
        flash(t("flash.common.unknownErrorTryLater"));
      }
    } catch (e) {
      console.error(e);
      flash(t("flash.common.unknownErrorTryLater"));
    } finally {
      setLoadingLinkIds(reject(equals(id)));
    }
  }

  const openLink = async (id: string) => {
    const url = await fetchLink(id);
    if (url) {
      window.open(url, "_blank");
    }
  };

  return {
    openLink,
    fetchLink,
    isLoading(id: string) {
      return loadingLinkIds.includes(id);
    },
  };
}
