import React from "react";
import QrCodeIcon from "../../../assets/tsx/QrCodeIcon";
import qrCodeStyles from "../../Settings/Setting.module.css";
import { Button } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../AppRootContext";

const HeaderPrependActions = (props: {
  selectedItemsCount: number;
  optionChanged: boolean;
  handleClickSave: () => void;
  isLoading: boolean;
  handleSelectedDownload: () => void;
  hasSaveButton: boolean;
  hasDownloadButton: boolean;
}) => {
  const {
    selectedItemsCount,
    optionChanged,
    handleClickSave,
    isLoading,
    handleSelectedDownload,
    hasSaveButton,
    hasDownloadButton,
  } = props;
  const { t } = useTranslation();
  const isQRCodeMappingEnabled = useAppSelector(
    (s) => s.company?.isQRCodeMappingEnabled
  );
  const showDownload = selectedItemsCount > 0;

  return (
    <>
      {isQRCodeMappingEnabled && hasDownloadButton && showDownload ? (
        <Button
          className={qrCodeStyles.downloadAll}
          onClick={handleSelectedDownload}
        >
          <QrCodeIcon className={qrCodeStyles.qrCodeIcon} />
          {t("form.button.downloadCount", { count: selectedItemsCount })}
        </Button>
      ) : (
        hasSaveButton && (
          <Button
            disabled={!optionChanged}
            onClick={handleClickSave}
            loading={isLoading}
            className={qrCodeStyles.saveButton}
          >
            {t("form.button.save")}
          </Button>
        )
      )}
    </>
  );
};
export default HeaderPrependActions;
