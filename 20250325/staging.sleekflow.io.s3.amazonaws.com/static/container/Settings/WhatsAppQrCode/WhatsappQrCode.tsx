import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Divider, Header, Tab } from "semantic-ui-react";
import {
  MainTabEnum,
  MsgType,
  QRCodeAutomationTriggerType,
  SubTabEnum,
} from "./types/WhatsAppQrCodeTypes";
import { Content } from "./components/Content";
import { postWithExceptions } from "../../../api/apiRequest";
import { POST_ASSIGNMENT_RULE } from "../../../api/apiPath";
import AssignmentResponseType from "../../../types/AssignmentRuleType";
import { useFlashMessageChannel } from "../../../component/BannerMessage/flashBannerMessage";
import { serializedMessage } from "../helper/convertMessageFormat";
import styles from "./WhatsappQrCode.module.css";
import panelStyles from "../Panels.module.css";
import settingStyles from "../Setting.module.css";
import { useLocation, useHistory } from "react-router-dom";
import useRouteConfig from "../../../config/useRouteConfig";

export const WhatsappQrCode = () => {
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();
  const { pathname } = useLocation();
  const subPath =
    pathname.split("/")?.[4] === "user" ? MainTabEnum.user : MainTabEnum.team;
  const [selectedItem, setSelectedItem] = useState<MainTabEnum>(subPath);
  const [isEdit, setIsEdit] = useState(false);
  const [id, setId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [enableAutoMsg, setEnableAutoMsg] = useState(false);
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const switchEnableAutoMsg = () => {
    setEnableAutoMsg((prev: boolean) => !prev);
  };
  const [firstMsg, setFirstMsg] = useState<MsgType>({
    top: "",
    bottom: "",
  });
  const [autoReplyMsg, setAutoReplyMsg] = useState<MsgType>({
    top: "",
    bottom: "",
  });
  const mainPanes = [
    {
      menuItem: t("settings.whatsappQrCode.activated.tab.main.team"),
      render: () => {
        return (
          <Tab.Pane
            attached={false}
            key={MainTabEnum.team}
            className={styles.paneContainer}
          >
            <Divider />
            <Content
              tab={MainTabEnum.team}
              setIsEdit={setIsEdit}
              firstMsg={firstMsg}
              setFirstMsg={setFirstMsg}
              autoReplyMsg={autoReplyMsg}
              setAutoReplyMsg={setAutoReplyMsg}
              setId={setId}
              enableAutoMsg={enableAutoMsg}
              setEnableAutoMsg={setEnableAutoMsg}
              switchEnableAutoMsg={switchEnableAutoMsg}
              isSaving={isLoading}
            />
          </Tab.Pane>
        );
      },
    },
    {
      menuItem: t("settings.whatsappQrCode.activated.tab.main.user"),
      render: () => {
        return (
          <Tab.Pane
            attached={false}
            key={MainTabEnum.user}
            className={styles.paneContainer}
          >
            <Divider />
            <Content
              tab={MainTabEnum.user}
              setIsEdit={setIsEdit}
              firstMsg={firstMsg}
              setFirstMsg={setFirstMsg}
              autoReplyMsg={autoReplyMsg}
              setAutoReplyMsg={setAutoReplyMsg}
              setId={setId}
              enableAutoMsg={enableAutoMsg}
              setEnableAutoMsg={setEnableAutoMsg}
              switchEnableAutoMsg={switchEnableAutoMsg}
              isSaving={isLoading}
            />
          </Tab.Pane>
        );
      },
    },
  ];
  const handleTabChange = (event: React.MouseEvent, data: Object): void => {
    setSelectedItem(data["activeIndex"]);
    history.replace(routeTo(`/settings/whatsappQrCode`));
  };

  const handleSave = async () => {
    const selectedTab = selectedItem;
    const requestParam = [
      {
        assignmentId: id,
        AssignmentRuleName:
          selectedTab === MainTabEnum.team
            ? "QRCode Mapping For Teams"
            : "QRcode mapping",
        AutomationType:
          selectedTab === MainTabEnum.team
            ? QRCodeAutomationTriggerType.team
            : QRCodeAutomationTriggerType.user,
        Conditions: [
          {
            FieldName: "Message",
            ConditionOperator: "RegexMatched",
            Values: [
              serializedMessage({
                msgType: SubTabEnum.first,
                topMsg: firstMsg.top,
                bottomMsg: firstMsg.bottom,
              }),
            ],
            NextOperator: "And",
          },
        ],
        AutomationActions:
          selectedTab === MainTabEnum.team
            ? [
                enableAutoMsg
                  ? {
                      AutomatedTriggerType: "SendMessage",
                      MessageContent: serializedMessage({
                        msgType: SubTabEnum.auto,
                        topMsg: autoReplyMsg.top,
                        bottomMsg: autoReplyMsg.bottom,
                      }),
                      MessageParams: ["@AssignedTeam"],
                    }
                  : {},
              ]
            : enableAutoMsg
            ? [
                {
                  AutomatedTriggerType: "Assignment",
                  AssignmentType: "AssignWithRegExValue",
                },
                {
                  AutomatedTriggerType: "SendMessage",
                  MessageContent: `${autoReplyMsg.top}{0}${autoReplyMsg.bottom}`,
                  MessageParams: ["@ContactOwner"],
                },
              ]
            : [
                {
                  AutomatedTriggerType: "Assignment",
                  AssignmentType: "AssignWithRegExValue",
                },
              ],
      },
    ];
    try {
      setIsLoading(true);
      const rulePrototype: AssignmentResponseType = await postWithExceptions(
        POST_ASSIGNMENT_RULE,
        {
          param: requestParam,
        }
      );
      if (rulePrototype) {
        flash(
          selectedTab === MainTabEnum.team
            ? t("settings.whatsappQrCode.activated.flashMsg.save.team")
            : t("settings.whatsappQrCode.activated.flashMsg.save.user")
        );
        setIsEdit(false);
      }
    } catch (e) {
      console.error("POST_ASSIGNMENT_RULE error: ", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={settingStyles.content}>
      <div className={settingStyles.hideScrollableTable}>
        <div className={settingStyles.container}>
          <div className={`${settingStyles.header} ${styles.header}`}>
            <Header as="h4" content={t("settings.whatsappQrCode.header")} />
            <Button
              primary
              size={"mini"}
              disabled={!isEdit}
              className={styles.saveButton}
              onClick={handleSave}
              loading={isLoading}
            >
              {t("settings.whatsappQrCode.activated.button.save")}
            </Button>
          </div>
          <div>
            <Tab
              className={panelStyles["panel-wrap"]}
              menu={{ secondary: true, pointing: true }}
              panes={mainPanes}
              onTabChange={handleTabChange}
              activeIndex={selectedItem}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
