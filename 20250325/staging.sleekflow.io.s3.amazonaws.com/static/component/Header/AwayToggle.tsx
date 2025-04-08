import React, { useLayoutEffect, useState } from "react";
import { Checkbox, CheckboxProps, Dropdown } from "semantic-ui-react";
import { post } from "../../api/apiRequest";
import { POST_COMPANY_STAFF_INFO } from "../../api/apiPath";
import { Trans, useTranslation } from "react-i18next";
import { InfoTooltip } from "../shared/popup/InfoTooltip";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { ToggleInput } from "../shared/input/ToggleInput";

export function checkActiveStatus(status: string) {
  return status.toLowerCase() === "active";
}

export function AwayToggle() {
  const loggedInUserDetail = useAppSelector((s) => s.loggedInUserDetail);
  const loginDispatch = useAppDispatch();
  const [isActive, setIsActive] = useState(false);

  useLayoutEffect(() => {
    if (!loggedInUserDetail) {
      return;
    }
    setIsActive(checkActiveStatus(loggedInUserDetail.status));
  }, [loggedInUserDetail?.status]);

  const { t } = useTranslation();

  async function onToggleChange() {
    if (!loggedInUserDetail) {
      return;
    }
    try {
      await post(
        POST_COMPANY_STAFF_INFO.replace(
          "{staffId}",
          loggedInUserDetail.userInfo.id ?? ""
        ),
        { param: { status: isActive ? "Away" : "Active" } }
      );
      loginDispatch({
        type: "UPDATE_LOGGEDIN_USER_DETAIL",
        loggedInUserDetail: {
          ...loggedInUserDetail,
          status: isActive ? "away" : "active",
        },
      });
      setIsActive(!isActive);
    } catch (e) {
      console.error(`update user status error ${e}`);
    }
  }

  return (
    <InfoTooltip
      placement={"left"}
      trigger={
        <Dropdown.Item key="status" value="status">
          <label className="with-tooltip">
            {isActive
              ? t("chat.buttons.status.active")
              : t("chat.buttons.status.away")}
          </label>
          <ToggleInput on={isActive} onChange={onToggleChange} size={"large"} />
        </Dropdown.Item>
      }
    >
      {isActive ? (
        <Trans i18nKey={"flash.away.enabled"} />
      ) : (
        <Trans i18nKey={"flash.away.disabled"} />
      )}
    </InfoTooltip>
  );
}
