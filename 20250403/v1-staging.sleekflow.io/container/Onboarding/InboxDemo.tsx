import React, { useEffect, useReducer } from "react";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import { PostLogin } from "../../component/Header";
import DemoModeBorder from "../../component/Onboarding/GetStarted/components/DemoModeBorder";
import DemoStart from "../../component/Onboarding/GetStarted/InboxDemo/DemoStart";
import SentMessage from "../../component/Onboarding/GetStarted/InboxDemo/SentMessage";
import MockInbox from "../../component/Onboarding/GetStarted/InboxDemo/MockInbox";
import {
  defaultState,
  inboxDemoActionType,
  inboxDemoReducer,
  inboxDemoStateType,
} from "../../component/Onboarding/GetStarted/InboxDemo/inboxDemoReducer";
import InboxDemoContext from "../../component/Onboarding/GetStarted/InboxDemo/inboxDemoContext";
import submitGenerateInboxDemo from "../../api/Onboarding/submitGenerateInboxDemo";
import { useAppSelector } from "AppRootContext";

function InboxDemo() {
  const { t } = useTranslation();
  const userId = useAppSelector((s) => s.user.id);
  const [state, demoDispatch] = useReducer<
    React.Reducer<inboxDemoStateType, inboxDemoActionType>
  >(inboxDemoReducer, defaultState);

  useEffect(() => {
    async function fetchConversations() {
      const conversations = await submitGenerateInboxDemo(userId);
      demoDispatch({ type: "CONVERSATION_LOAD_COMPLETE", conversations });
    }

    demoDispatch({ type: "CONVERSATION_LOAD_START" });
    fetchConversations();
  }, [userId]);

  const steps = [<DemoStart />, <SentMessage />, <MockInbox />];
  return (
    <InboxDemoContext.Provider
      value={{
        ...state,
        demoDispatch,
      }}
    >
      <div className="post-login">
        <PostLogin selectedItem={""} />
        <Helmet
          title={t("nav.common.title", {
            page: t("onboarding.inboxDemo.pageTitle"),
          })}
        />
        <DemoModeBorder>{steps[state.step]}</DemoModeBorder>
      </div>
    </InboxDemoContext.Provider>
  );
}

export default InboxDemo;
