import { TaskType } from "./TaskType";
import connectSplash from "../../assets/images/getting-started/splash-apps.svg";
import chatSplash from "../../assets/images/getting-started/splash-preview.svg";
import TrackingCodeScript from "../TrackingCodeScript";
import React from "react";
import { Trans, useTranslation } from "react-i18next";

export function useOnboardingTasksLocalized() {
  const { t } = useTranslation();

  const tasks: TaskType[] = [
    {
      name: t("onboarding.task.connect.name"), //'',
      apiName: "isMessagingChannelAdded",
      body: (
        <Trans i18nKey={"onboarding.task.connect.body"}>
          <p>
            Manage conversations in one place and accelerate team workflow on
            all your messaging apps. Our powerful integrations allow you to take
            control of all past conversation history and customer data in one
            platform.
          </p>
        </Trans>
      ),
      completed: false,
      buttonText: t("onboarding.task.connect.button"), //
      buttonUrl: "/channels",
      splash: connectSplash,
      timeToComplete: t("onboarding.task.connect.time"), //
      mightBeMarkedAsComplete: false,
      storedInCompanyCustomFields: false,
      dependsOnSubtasks: false,
    },
    {
      name: t("onboarding.task.messenger.name"), //'',
      apiName: "isWebWidgetAdded",
      body: (
        <Trans i18nKey={"onboarding.task.messenger.body"}>
          <p>
            Your Website Messenger is the key way you’ll communicate with your
            customers. It lets anyone start a conversation with you from your
            website, and continue the conversations with the messaging apps you
            have just connected.
          </p>
          <p>
            In this step, you’ll customize your Messenger to fit your brand, and
            add a friendly intro to make people feel welcome.
          </p>
        </Trans>
      ),
      completed: false,
      buttonText: t("onboarding.task.messenger.button"), //'',
      buttonUrl: "/settings/livechatwidget",
      splash: chatSplash,
      timeToComplete: t("onboarding.task.messenger.time"), //"",
      mightBeMarkedAsComplete: false,
      storedInCompanyCustomFields: false,
      dependsOnSubtasks: false,
      subtasks: [
        {
          name: t("onboarding.task.messenger.task.preview.name"), //'',
          body: (
            <Trans i18nKey={"onboarding.task.messenger.task.preview.body"}>
              <p>
                Your SleekFlow Website Messenger makes it easy for your business
                to chat with your customers. It’s also an easy way for prospects
                or customers to ask your team questions or give feedback.
              </p>
              <p>
                In this step, you’ll put yourself in your customers’ shoes and
                see what it’s like to start a conversation through the
                Messenger.
              </p>
            </Trans>
          ),
          buttonText: t("onboarding.task.messenger.task.preview.button"), //'',
          buttonUrl: `https://preview.sleekflow.io/?companyId={companyId}`,
        },
        {
          name: t("onboarding.task.messenger.task.website.name"), //'',
          body: (
            <Trans i18nKey={"onboarding.task.messenger.task.website.body"}>
              <p>
                Finally, you can now set up the SleekFlow Messenger to go live
                and chat with people when they’re on your website. Copy the code
                below and add to your site footer.
              </p>
              <TrackingCodeScript
                bgColor={"#E7EFFF"}
                fontColor={"#0F103D"}
                showHeader={false}
                showActionBtn={true}
              />
            </Trans>
          ),
        },
      ],
    },
    {
      name: t("onboarding.task.inviteTeam.name"), //'',
      apiName: "isInvitedTeammate",
      body: (
        <Trans i18nKey={"onboarding.task.inviteTeam.body"}>
          <p>
            Now that you’re talking with customers, it’s time to bring in the
            rest of your team to help. Start by inviting your teammates — you
            can always add more later too.
          </p>
        </Trans>
      ),
      completed: false,
      buttonText: t("onboarding.task.inviteTeam.button"), //'',
      buttonUrl: "/settings/usermanagement",
      timeToComplete: t("onboarding.task.inviteTeam.time"), //"",
      mightBeMarkedAsComplete: false,
      storedInCompanyCustomFields: false,
      dependsOnSubtasks: false,
    },
    {
      name: t("onboarding.task.inbox.name"), //'',
      body: (
        <Trans i18nKey={"onboarding.task.inbox.body"}>
          <p>
            Congratulations! Your team inbox is now ready to use with all the
            messaging channels connected in one place. You’ll be able to learn
            some basic functions by following the tutorials below. Let’s start
            with sending messages and internal notes with the teams!
          </p>
        </Trans>
      ),
      apiName: "isTeamInboxUsed",
      completed: false,
      buttonText: t("onboarding.task.inbox.button"), //'',
      buttonUrl: "/inbox",
      timeToComplete: t("onboarding.task.inbox.time"), //"",
      mightBeMarkedAsComplete: true,
      storedInCompanyCustomFields: true,
      dependsOnSubtasks: false,
      subtasks: [
        {
          name: t("onboarding.task.inbox.task.assign.name"), //'',
          body: (
            <Trans i18nKey={"onboarding.task.inbox.task.assign.body"}>
              <p>
                You could assign certain conversations to your teammates, or
                mention them in internal notes to tag them into the
                conversations when you need help from others!
              </p>
            </Trans>
          ),
          buttonText: t("onboarding.task.inbox.task.assign.button"), //'',
          buttonUrl:
            "https://docs.sleekflow.io/using-the-platform/inbox#assign-conversations",
        },
        {
          name: t("onboarding.task.inbox.task.mention.name"), // '',
          body: (
            <Trans i18nKey={"onboarding.task.inbox.task.mention.body"}>
              <p>
                You can send internal notes between teammates and mention them
                to the conversations, without sending messages to the customers.
                It is incredibly useful for facilitating team collaborations.
              </p>
            </Trans>
          ),
          buttonText: t("onboarding.task.inbox.task.mention.button"), //'',
          buttonUrl:
            "https://docs.sleekflow.io/using-the-platform/inbox#mention-and-add-internal-notes",
        },
        {
          name: t("onboarding.task.inbox.task.manageStatus.name"), //'',
          body: (
            <Trans i18nKey={"onboarding.task.inbox.task.manageStatus.body"}>
              <p>
                You can toggle a conversation status to open, snoozed or closed,
                to help you better arrange your communication workflow. We make
                sure you can take care the most important customers anytime.
              </p>
            </Trans>
          ),
          buttonText: t("onboarding.task.inbox.task.manageStatus.button"), //'',
          buttonUrl:
            "https://docs.sleekflow.io/using-the-platform/inbox#status",
        },
      ],
    },
    {
      name: t("onboarding.task.automation.name"), //'',
      apiName: "isAssignmentRuleAdded",
      body: (
        <Trans i18nKey={"onboarding.task.automation.body"}>
          <p>
            Try to set automated assignment rules to assign conversations to
            your staff by channel or by queue. You can make sure all
            conversations have contact owners to manage and will not be lost.
          </p>
        </Trans>
      ),
      completed: false,
      buttonText: t("onboarding.task.automation.button"), //'',
      buttonUrl: "/automations",
      timeToComplete: t("onboarding.task.automation.time"), //"",
      mightBeMarkedAsComplete: false,
      storedInCompanyCustomFields: false,
      dependsOnSubtasks: false,
    },
    {
      name: t("onboarding.task.contacts.name"), //'',
      body: (
        <Trans i18nKey={"onboarding.task.contacts.body"}>
          <p>
            All contact profile who you had conversations with will be saved
            automatically to the Contact tab. Get an overview of your customers
            across all messaging channels.
          </p>
        </Trans>
      ),
      apiName: "isContactsAdded",
      completed: false,
      buttonText: t("onboarding.task.contacts.button"), //'',
      buttonUrl: "/contacts",
      timeToComplete: t("onboarding.task.contacts.time"), //"",
      mightBeMarkedAsComplete: true,
      storedInCompanyCustomFields: true,
      dependsOnSubtasks: false,
      subtasks: [
        {
          name: t("onboarding.task.contacts.task.filter.name"), //'',
          body: (
            <Trans i18nKey={"onboarding.task.contacts.task.filter.body"}>
              <p>
                See the ones that matter. Apply multiple filters on all your
                customised data fields.
              </p>
            </Trans>
          ),
          buttonText: t("onboarding.task.contacts.task.filter.button"), //'',
          buttonUrl:
            "https://docs.sleekflow.io/using-the-platform/contacts/filter-contacts",
        },
        {
          name: t("onboarding.task.contacts.task.import.name"), //'',
          body: (
            <Trans i18nKey={"onboarding.task.contacts.task.import.body"}>
              <p>
                You can prepare a CSV file to import your existing contacts as a
                list, and broadcast messages to the targeted accounts.
              </p>
            </Trans>
          ),
          buttonText: t("onboarding.task.contacts.task.import.button"), //'',
          buttonUrl:
            "https://docs.sleekflow.io/using-the-platform/contacts/imports",
        },
      ],
    },
    {
      name: t("onboarding.task.broadcast.name"), //'',
      apiName: "isBroadcastMessageSent",
      body: (
        <Trans i18nKey={"onboarding.task.broadcast.body"}>
          <p>
            Send broadcast messages to all channels in one click with customised
            parameters and segmentations. Try to make your message neat and
            short. Use it as a way to generate leads instead of feeding all the
            information in one go.
          </p>
        </Trans>
      ),
      completed: false,
      buttonText: t("onboarding.task.broadcast.button"), //'',
      buttonUrl: "/campaigns",
      timeToComplete: t("onboarding.task.broadcast.time"), //"",
      mightBeMarkedAsComplete: false,
      dependsOnSubtasks: false,
      storedInCompanyCustomFields: false,
    },
  ];

  return {
    tasks,
  };
}
