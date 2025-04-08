import React, { useLayoutEffect, useState } from "react";
import { Checkbox, CheckboxProps, Dropdown } from "semantic-ui-react";
import { post } from "../../api/apiRequest";
import { POST_COMPANY_STAFF_INFO } from "../../api/apiPath";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../shared/popup/InfoTooltip";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { ToggleInput } from "../shared/input/ToggleInput";

export function AgentNameToggle() {
  const loggedInUserDetail = useAppSelector((s) => s.loggedInUserDetail);
  const loginDispatch = useAppDispatch();
  const [isActive, setIsActive] = useState(false);

  useLayoutEffect(() => {
    setIsActive(loggedInUserDetail?.isShowName ?? false);
  }, [loggedInUserDetail]);

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
        { param: { isShowName: !isActive } }
      );
      loginDispatch({
        type: "UPDATE_LOGGEDIN_USER_DETAIL",
        loggedInUserDetail: {
          ...loggedInUserDetail,
          isShowName: !isActive,
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
      children={t("flash.agentName")}
      trigger={
        <Dropdown.Item key="agentName" value="agentName">
          <label className="with-tooltip">
            {t("chat.buttons.displayName")}
          </label>
          <ToggleInput on={isActive} onChange={onToggleChange} size={"large"} />
        </Dropdown.Item>
      }
    />
  );
}
