import React, { useEffect, useRef, useState } from "react";
import { Loader, Tab } from "semantic-ui-react";
import { Trans, useTranslation } from "react-i18next";
import RedirectIcon from "../../../../assets/tsx/icons/RedirectIcon";
import {
  MainTabEnum,
  MsgType,
  QRCodeAutomationTriggerType,
  SubTabEnum,
} from "../types/WhatsAppQrCodeTypes";
import { useHistory } from "react-router-dom";
import useRouteConfig from "../../../../config/useRouteConfig";
import { PreviewContent } from "../../../../component/shared/PreviewContent";
import { MessageTemplate } from "./MessageTemplate";
import useFetchAutomationRulesByTriggerType from "../../hooks/useFetchAutomationRulesByTriggerType";
import { messageUnserialized } from "../../helper/convertMessageFormat";
import styles from "./Content.module.css";
import panelStyles from "../../Panels.module.css";

export const Content = (props: {
  tab: MainTabEnum;
  setIsEdit: (isEdit: boolean) => void;
  firstMsg: MsgType;
  setFirstMsg: (firstMsg: MsgType) => void;
  autoReplyMsg: MsgType;
  setAutoReplyMsg: (autoReplyMsg: MsgType) => void;
  setId: (id: string) => void;
  enableAutoMsg: boolean;
  setEnableAutoMsg: (enableAutoMsg: boolean) => void;
  switchEnableAutoMsg: () => void;
  isSaving: boolean;
}) => {
  const {
    tab,
    setIsEdit,
    firstMsg,
    setFirstMsg,
    autoReplyMsg,
    setAutoReplyMsg,
    setId,
    enableAutoMsg,
    setEnableAutoMsg,
    switchEnableAutoMsg,
    isSaving,
  } = props;
  const { fetchAutomationRulesByTriggerType } =
    useFetchAutomationRulesByTriggerType();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const dataMapping = GetMappingData();
  const DefaultFirstFullMsg = useRef<string>("");
  const DefaultAutoFullMsg = useRef<string>("");
  const DefaultIsEnableAutoReply = useRef<boolean>(false);
  const isSettingDefaultPreviewTab = useRef<boolean>(false);

  const [selectedItem, setSelectedItem] = useState<SubTabEnum>(
    SubTabEnum.first
  );
  const [previewMsg, setPreviewMsg] = useState<string>("");

  const subPanes = [
    {
      menuItem: t("settings.whatsappQrCode.activated.tab.sub.first"),
    },
    {
      menuItem: t("settings.whatsappQrCode.activated.tab.sub.auto"),
    },
  ];
  const handleTabChange = (event: React.MouseEvent, data: Object): void => {
    setSelectedItem(
      data["activeIndex"] === 0 ? SubTabEnum.first : SubTabEnum.auto
    );
    setPreviewMsg(
      data["activeIndex"] === 0
        ? `${firstMsg.top} ${dataMapping[tab].msgContactName}${firstMsg.bottom}`
        : `${autoReplyMsg.top} ${dataMapping[tab].msgContactName}${autoReplyMsg.bottom}`
    );
  };
  const getContent = async () => {
    setIsLoading(true);
    try {
      const result = await fetchAutomationRulesByTriggerType(
        tab === MainTabEnum.team
          ? QRCodeAutomationTriggerType.team
          : QRCodeAutomationTriggerType.user
      );
      isSettingDefaultPreviewTab.current = true;
      if (result.length > 0) {
        DefaultIsEnableAutoReply.current =
          result[0].automationActions[
            tab === MainTabEnum.team ? 0 : 1
          ]?.hasOwnProperty("messageContent") ?? false;
        const { top: firstMsgTop, bottom: firstMsgBottom } =
          messageUnserialized({
            msgType: SubTabEnum.first,
            msg: result,
          });
        const { top: autoMsgTop, bottom: autoMsgBottom } = messageUnserialized({
          msgType: SubTabEnum.auto,
          msg: result,
          enableAutoReplyMsg: DefaultIsEnableAutoReply.current,
          currentTabIndex: tab === MainTabEnum.team ? 0 : 1,
          t,
        });
        DefaultFirstFullMsg.current = `${firstMsgTop}${firstMsgBottom}`;
        DefaultAutoFullMsg.current = `${autoMsgTop}${autoMsgBottom}`;
        setFirstMsg({
          top: firstMsgTop,
          bottom: firstMsgBottom,
        });
        setAutoReplyMsg({
          top: autoMsgTop,
          bottom: autoMsgBottom,
        });
        setEnableAutoMsg(DefaultIsEnableAutoReply.current);
        setId(result[0].assignmentId);
      } else {
        setFirstMsg({
          top: "",
          bottom: "",
        });
        setAutoReplyMsg({
          top: "",
          bottom: "",
        });
        setPreviewMsg(`${dataMapping[tab].msgContactName}`);
        setId("");
      }
      setSelectedItem(SubTabEnum.first);
    } catch (e) {
      console.error("fetchAutomationRulesByTriggerType error: ", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getContent();
  }, []);

  useEffect(() => {
    if (isSettingDefaultPreviewTab.current) {
      return;
    }
    if (enableAutoMsg) {
      setSelectedItem(SubTabEnum.auto);
      setPreviewMsg(
        `${autoReplyMsg.top} ${dataMapping[tab].msgContactName}${autoReplyMsg.bottom}`
      );
    } else {
      setSelectedItem(SubTabEnum.first);
      setPreviewMsg(
        `${firstMsg.top} ${dataMapping[tab].msgContactName}${firstMsg.bottom}`
      );
    }
  }, [enableAutoMsg]);

  useEffect(() => {
    if (DefaultFirstFullMsg.current !== firstMsg.top + firstMsg.bottom) {
      setIsEdit(true);
    } else {
      setIsEdit(false);
    }
  }, [firstMsg]);

  useEffect(() => {
    if (isSettingDefaultPreviewTab.current) {
      isSettingDefaultPreviewTab.current = false;
    }
  }, [selectedItem]);

  useEffect(() => {
    if (selectedItem === SubTabEnum.auto) {
      setPreviewMsg(
        `${autoReplyMsg.top} ${dataMapping[tab].msgContactName}${autoReplyMsg.bottom}`
      );
    } else if (selectedItem === SubTabEnum.first) {
      setPreviewMsg(
        `${firstMsg.top} ${dataMapping[tab].msgContactName}${firstMsg.bottom}`
      );
    }
  }, [selectedItem, firstMsg, autoReplyMsg]);

  useEffect(() => {
    if (DefaultAutoFullMsg.current !== autoReplyMsg.top + autoReplyMsg.bottom) {
      setIsEdit(true);
    } else {
      setIsEdit(false);
    }
  }, [autoReplyMsg]);

  useEffect(() => {
    if (DefaultIsEnableAutoReply.current !== enableAutoMsg) {
      setIsEdit(true);
    } else {
      setIsEdit(false);
    }
  }, [enableAutoMsg]);

  return (
    <div className={styles.contentContainer}>
      {isLoading ? (
        <Loader active />
      ) : (
        <>
          <div>
            <div className={styles.description}>
              {dataMapping[tab].description}
            </div>
            <MessageTemplate
              msg={firstMsg}
              setMsg={setFirstMsg}
              title={t(
                "settings.whatsappQrCode.activated.content.common.firstMsg.title"
              )}
              subTitle={t(
                "settings.whatsappQrCode.activated.content.common.firstMsg.subTitle",
                { contactName: dataMapping[tab].contactName }
              )}
              msgContactName={dataMapping[tab].msgContactName}
              isDisabled={isSaving}
            />
            <MessageTemplate
              hasCheckbox={true}
              enableAutoMsg={enableAutoMsg}
              switchEnableAutoMsg={switchEnableAutoMsg}
              msg={autoReplyMsg}
              setMsg={setAutoReplyMsg}
              title={t(
                "settings.whatsappQrCode.activated.content.common.autoReplyMsg.title"
              )}
              subTitle={t(
                "settings.whatsappQrCode.activated.content.common.autoReplyMsg.subTitle",
                { contactName: dataMapping[tab].contactName }
              )}
              msgContactName={dataMapping[tab].msgContactName}
              isDisabled={isSaving}
            />
          </div>
          <PreviewContent value={previewMsg}>
            {enableAutoMsg ? (
              <Tab
                className={panelStyles["panel-wrap"]}
                menu={{ secondary: true, pointing: true }}
                panes={subPanes}
                onTabChange={handleTabChange}
                activeIndex={selectedItem === SubTabEnum.first ? 0 : 1}
              />
            ) : (
              <></>
            )}
          </PreviewContent>
        </>
      )}
    </div>
  );
};

const GetMappingData = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();

  function handleRedirect(page: string) {
    history.push(routeTo("/settings/" + page));
  }

  return {
    [MainTabEnum.team]: {
      description: (
        <Trans
          i18nKey={"settings.whatsappQrCode.activated.content.team.description"}
        >
          To manage any team channels, conversation assignment, and codes
          download, go to
          <span
            className={styles.actionContainer}
            onClick={() => handleRedirect("teams")}
          >
            Teams
            <RedirectIcon className={styles.redirectIcon} />
          </span>
        </Trans>
      ),
      msgContactName: t(
        "settings.whatsappQrCode.activated.content.team.msgContactName"
      ),
      contactName: t(
        "settings.whatsappQrCode.activated.content.team.contactName"
      ),
    },
    [MainTabEnum.user]: {
      description: (
        <Trans
          i18nKey={"settings.whatsappQrCode.activated.content.user.description"}
        >
          To manage staff user channels, and codes download, go to
          <span
            className={styles.actionContainer}
            onClick={() => handleRedirect("usermanagement")}
          >
            User
            <RedirectIcon className={styles.redirectIcon} />
          </span>
        </Trans>
      ),
      msgContactName: t(
        "settings.whatsappQrCode.activated.content.user.msgContactName"
      ),
      contactName: t(
        "settings.whatsappQrCode.activated.content.user.contactName"
      ),
    },
  };
};
