import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useAppSelector } from "../../../../AppRootContext";
import { post } from "../../../../api/apiRequest";
import { POST_COMPANY_FIELD } from "../../../../api/apiPath";
import { Popup } from "../../../shared/popup/Popup";
import { Button } from "../../../shared/Button/Button";

export default function TemplateBookmarkSettingsGuidePopup(props: {
  bookmarkedCount: number;
}) {
  const { bookmarkedCount } = props;
  const isGuidePopupClosed = useAppSelector(
    (s) =>
      s.company?.companyCustomFields?.find(
        (field) => field.fieldName === "TemplateBookmarkSettingGuide"
      )?.value
  );
  const [showPopup, setShowPopup] = useState(isGuidePopupClosed === undefined);
  const { t } = useTranslation();

  const closeButtonClick = () => {
    try {
      post(POST_COMPANY_FIELD, {
        param: [
          {
            category: "Banner",
            fieldName: "TemplateBookmarkSettingGuide",
            companyCustomFieldFieldLinguals: [],
            type: "Boolean",
            isEditable: true,
            isVisible: true,
            value: true,
          },
        ],
      });
    } catch (e) {
      console.error(`create companyCustomField ${e}`);
    } finally {
      setShowPopup(false);
    }
  };

  return (
    <Popup
      open={showPopup}
      position={"bottom center"}
      inverted
      trigger={
        <span>
          {t("settings.templates.grid.header.bookmark", {
            count: bookmarkedCount,
          })}
        </span>
      }
      bottomControls={
        <Button
          primary
          inverseBackground
          customSize={"sm"}
          onClick={closeButtonClick}
          content={t("settings.templates.grid.header.bookmarkOk")}
        />
      }
    ></Popup>
  );
}
