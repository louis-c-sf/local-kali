import { fetchWebVersion } from "../../../api/Setting/fetchWebVersion";
import { postWebVersion } from "../../../api/Setting/postWebVersion";
import { VersionType } from "../Profile/types";
import { useAppSelector } from "../../../AppRootContext";
import { equals } from "ramda";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { useTranslation } from "react-i18next";

export const useWebVersionRequest = (props: {
  isLoading: (isLoading: boolean) => void;
  selectedVersion: VersionType;
  setSelectedVersion: (version: VersionType) => void;
  originalWebVersionRef: React.MutableRefObject<VersionType>;
}) => {
  const {
    isLoading,
    selectedVersion,
    setSelectedVersion,
    originalWebVersionRef,
  } = props;
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();

  const getDefaultWebVersion = async (userId: string) => {
    try {
      isLoading(true);
      const result = await fetchWebVersion(userId);
      if (result.version) {
        setSelectedVersion(result.version as VersionType);
        originalWebVersionRef.current = result.version as VersionType;
      }
    } catch (e) {
      console.error("GET_WEB_VERSION error: ", e);
    } finally {
      isLoading(false);
    }
  };

  const saveWebVersion = async (userId: string) => {
    try {
      isLoading(true);
      await postWebVersion({
        userId,
        version: selectedVersion,
      });
      flash(t("flash.settings.account.updated"));
    } catch (e) {
      console.error("POST_WEB_VERSION error: ", e);
    } finally {
      isLoading(false);
    }
  };

  return {
    getDefaultWebVersion,
    saveWebVersion,
  };
};
