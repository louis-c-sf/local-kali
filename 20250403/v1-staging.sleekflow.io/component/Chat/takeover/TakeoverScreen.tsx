import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { Button, Image } from "semantic-ui-react";
import { DeviceSessionType } from "../../../types/LoginType";
import LinuxIcon from "../assets/Linux.svg";
import MacIcon from "../assets/Mac.svg";
import WindowsIcon from "../assets/Windows.svg";
import MobileIcon from "../assets/Mobile.svg";
import React, { useContext, useEffect, useState } from "react";
import uuid from "uuid";
import {
  BROWSER_ID_STORAGE_KEY,
  registerSessionTakeover,
} from "../hooks/Labels/useLimitedInboxLogin";
import { SignalRContext } from "../../SignalR/SignalRObservable";
import mainStyles from "./TakeoverScreen.module.css";
import { equals } from "ramda";
import { useCurrentUtcOffset } from "../hooks/useCurrentUtcOffset";
import { AddUserFeature } from "../../Settings/AddUserModal/AddUserFeature";
import { useCompanyStaff } from "../../../api/User/useCompanyStaff";
import { PostLogin } from "../../Header";

export function TakeoverScreen(props: {}) {
  const sessions = useAppSelector(
    (s) =>
      s.session.takeover.sessionsActive.filter(
        (s) => s.sessionStatus === "Active"
      ),
    equals
  );

  const loginDispatch = useAppDispatch();
  const { connection } = useContext(SignalRContext);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [addUserVisible, setAddUserVisible] = useState(false);
  const isContinueBlocked = !Boolean(connection) || loading;
  const { refresh: refreshStaff } = useCompanyStaff();
  useEffect(() => {
    loginDispatch({
      type: "HIDE_INBOX_GUIDE",
    });
  }, []);

  async function forceLogin() {
    setLoading(true);
    const browserIdGenerated =
      window.localStorage.getItem(BROWSER_ID_STORAGE_KEY) ?? uuid();
    try {
      await registerSessionTakeover(browserIdGenerated, true);
      connection?.invoke("DeviceAddToGroup", browserIdGenerated);
      loginDispatch({ type: "INBOX.SESSION.TAKEOVER_UNLOCK" });
      window.localStorage.setItem("SF_BROWSER_ID", browserIdGenerated);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={"post-login"}>
      <PostLogin selectedItem={""} locked>
        <div className={mainStyles.splash}>
          <div className={mainStyles.body}>
            <div className={mainStyles.title}>
              {t("chat.takeover.splash.header")}
            </div>
            <p>{t("chat.takeover.splash.listIntro")}:</p>
            <div className={mainStyles.items}>
              {sessions.map((s) => (
                <DeviceItem session={s} key={`${s.deviceName}${s.createdAt}`} />
              ))}
            </div>
            <div className={mainStyles.footer}>
              <p>{t("chat.takeover.splash.continuePrompt")}</p>
              <Button
                primary
                disabled={isContinueBlocked}
                onClick={forceLogin}
                className={"button-small"}
              >
                {t("chat.takeover.splash.action.continue")}
              </Button>
            </div>
            <div className={mainStyles.appendix}>
              <div className={mainStyles.prompt}>
                {t("chat.takeover.splash.invite")}
              </div>
              <div className={mainStyles.actions}>
                <Button
                  className={"button-link"}
                  onClick={() => setAddUserVisible(true)}
                >
                  {t("chat.takeover.splash.action.invite")}
                  <i className={"ui icon arrow-right-action"} />
                </Button>
              </div>
            </div>
          </div>
          {addUserVisible && (
            <AddUserFeature
              hide={() => setAddUserVisible(false)}
              refreshStaff={refreshStaff}
            />
          )}
        </div>
      </PostLogin>
    </div>
  );
}

function DeviceItem(props: { session: DeviceSessionType }) {
  const { session } = props;
  const utcOffset = useCurrentUtcOffset();
  const imageMap = {
    linux: LinuxIcon,
    windows: WindowsIcon,
    macos: MacIcon,
    mobile: MobileIcon,
  };

  function dateWording(time: string) {
    const timeParsed = moment(time).utcOffset(utcOffset);
    return timeParsed.isValid()
      ? `${timeParsed.fromNow()}, ${timeParsed.format("dddd D MMMM, YYYY")}`
      : time;
  }

  const imageDisplay =
    session.deviceType.toLowerCase() === "mobile"
      ? imageMap["mobile"]
      : imageMap[session.deviceName.replace(/ /gi, "").toLowerCase()];
  return (
    <div className={mainStyles.item}>
      <div className={mainStyles.itemImage}>
        <Image src={imageDisplay ?? MacIcon} />
      </div>
      <div className={mainStyles.itemDetails}>
        <div className={mainStyles.deviceType}>{session.deviceType}</div>
        <div className={mainStyles.deviceDate}>
          {dateWording(session.updatedAt)}
        </div>
        <div className={mainStyles.deviceName}>{session.deviceName}</div>
      </div>
    </div>
  );
}
