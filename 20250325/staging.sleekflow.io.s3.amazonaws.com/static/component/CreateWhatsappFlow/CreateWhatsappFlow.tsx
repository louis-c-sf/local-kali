import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router";
import { useAppSelector } from "../../AppRootContext";
import styles from "./CreateWhatsappFlow.module.css";
import { BackLink } from "../shared/nav/BackLink";
import {
  ApiAccessScenarioType,
  ChooseTwilioScenario,
} from "./ChooseTwilioScenario";
import { useMachine } from "@xstate/react/lib";
import {
  WhatsappOnboardingContextType,
  WhatsappOnboardingEvent,
  whatsappOnboardingMachine,
} from "./whatsappOnboardingMachine";
import { WhatsappOnboardingContextProvider } from "../../container/Onboarding/assets/WhatsappOnboardingContext";
import WhatsappOfficialVideo from "../WhatsappOfficialVideo/WhatsappOfficialVideo";
import { MigrateTo360Dialog } from "./MigrateTo360Dialog";
import {
  Create360DialogAccount,
  LOCALSTORAGE_PUBLIC_API_KEY,
} from "./Create360DialogAccount";
import { MigrateTo360DialogPreflight } from "./MigrateTo360DialogPreflight";
import { ConfirmationSplash } from "./steps/ConfirmationSplash";
import useRouteConfig from "../../config/useRouteConfig";
import CompleteOfficialVerification from "./CompleteOfficialVerification/CompleteOfficialVerification";
import { Create360DialogChannelResponseType } from "../../api/Channel/submitCreate360DialogChannel";
import { equals } from "ramda";
import { SetChannelName } from "./SetChannelName";
import { AllSet } from "./AllSet";
import { NewNumberInfoType } from "./types";
import { ChooseOfficialWhatsappScenario } from "./ChooseOfficialWhatsappScenario";
import useFetchCompany from "api/Company/useFetchCompany";
import { ConnectContainer } from "./ConnectNewNumber/ConnectContainer";
import { SetAutoTopUp } from "./SetAutoTopUp";
import useCompanyChannels from "component/Chat/hooks/useCompanyChannels";
import { getCloudAPIConfig } from "container/Onboarding/cloudAPI/CheckCloudAPIAccess";

interface SignupInfoType {
  firstname: string;
  lastname: string;
  email: string;
  companyname: string;
  phoneNumber: string;
}

export type SignupRegisterInfoType = Omit<SignupInfoType, "increaseStep">;
export const MIGRATE_TO_360DIALOG_URL =
  "https://hub.360dialog.com/lp/migrate/7KFk99PA";
export const CONNECT_TO_360DIALOG_URL =
  "https://hub.360dialog.com/lp/whatsapp/7KFk99PA";

export default function CreateWhatsappFlow() {
  const location = useLocation<{
    haveTwilio: boolean;
    isDisplayPhoneNumberList: boolean;
    status: string;
    afterSettingAutoTopUp: boolean;
    phoneNumber: string;
  }>();
  const stripeStatus = location.state?.status;
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const user = useAppSelector((s) => s.user, equals);
  const companyName = useAppSelector((s) => s.company?.companyName);
  const migrate360UrlWithQueryParams = `?email=${user.email}&fullName=${user.firstName}+${user.lastName}&companyName=${companyName}`;
  const params = new URLSearchParams(location.search);
  const isCloudAPI = params.get("isCloudAPI") === "true";
  const { t } = useTranslation();
  const { refreshCompany } = useFetchCompany();
  const [officialScenario, setOfficialScenario] =
    useState<ApiAccessScenarioType>("newNumber");
  const [channelCreated, setChannelCreated] =
    useState<Create360DialogChannelResponseType>();
  const [selectedNewNumber, setSelectedNewNumber] = useState<
    NewNumberInfoType | undefined
  >();
  const [showConnectionFee, setShowConnectionFee] = useState(true);
  const channels = useCompanyChannels();
  const company = useAppSelector((s) => s.company, equals);

  const [machine, machineSend] = useMachine<
    WhatsappOnboardingContextType,
    WhatsappOnboardingEvent
  >(whatsappOnboardingMachine, {
    context: {
      newUser: !user?.id, //todo
      whatsappOfficialChannelsExisted: false, //todo
      migrateFrom: undefined,
      haveTwilio: location?.state?.haveTwilio,
    },
  });

  useEffect(() => {
    if (machine.matches("idle")) {
      if (location?.state?.haveTwilio) {
        machineSend({ type: "START_TWILIO" });
      } else if (location?.state?.isDisplayPhoneNumberList) {
        machineSend({ type: "START_OFFIICAL_NEW_NUMBER" });
      } else if (
        location?.state?.afterSettingAutoTopUp &&
        location?.state?.phoneNumber
      ) {
        if (channels.length > 0) {
          const whatsappChannelConfig = getCloudAPIConfig(
            channels,
            location.state.phoneNumber
          );

          setSelectedNewNumber(whatsappChannelConfig);
          machineSend({ type: "COMPLETE_WHATSAPP_CLOUD_API" });
        }
      } else {
        machineSend({ type: "START_OFFICIAL" });
      }
    }
  }, [
    location?.state?.haveTwilio,
    location?.state?.isDisplayPhoneNumberList,
    location?.state?.afterSettingAutoTopUp,
    location?.state?.phoneNumber,
    machine.matches("idle"),
    company?.whatsappCloudApiConfigs?.length,
  ]);

  function stepContent() {
    switch (true) {
      case machine.matches("official.intro"):
        localStorage.removeItem(LOCALSTORAGE_PUBLIC_API_KEY);
        return (
          <WhatsappOfficialVideo
            isCloudAPI={isCloudAPI}
            onSubmit={() =>
              machineSend(
                isCloudAPI
                  ? { type: "SUBMIT" }
                  : { type: "WHATSAPP_360DIALOG_SUBMIT" }
              )
            }
            showConnectionFee={showConnectionFee}
            setShowConnectionFee={setShowConnectionFee}
            stripeStatus={stripeStatus}
          />
        );
      case machine.matches("official.chooseScenario"):
        return (
          <ChooseOfficialWhatsappScenario
            onScenarioChange={setOfficialScenario}
            scenario={officialScenario}
          />
        );
      // case machine.matches("signup.form"):
      //   return <SignupPassword {...registerInfo} />;
      //
      // case machine.matches("signup.success"):
      //   return <CompleteSignUp/>;

      case machine.matches("haveTwilio.migrate.preflight"):
      case machine.matches("official.migrate.preflight"):
        return <MigrateTo360DialogPreflight />;

      case machine.matches("haveTwilio.migrate.switchNumber"):
      case machine.matches("official.migrate.switchNumber"):
        return (
          <MigrateTo360Dialog
            migrateTo360DialogUrl={`${MIGRATE_TO_360DIALOG_URL}${migrate360UrlWithQueryParams}`}
            onSuccess={() => machineSend({ type: "SUBMIT" })}
          />
        );

      case machine.matches("haveTwilio.migrate.sleekflowMigrationRequested"):
      case machine.matches("official.migrate.sleekflowMigrationRequested"):
        return (
          <ConfirmationSplash
            onDone={() => history.push(routeTo("/channels"))}
            header={t("form.createWhatsapp.splash.migrationRequested.header")}
            subheader={t(
              "form.createWhatsapp.splash.migrationRequested.subheader"
            )}
          />
        );
      case machine.matches("official.newNumber"):
        return isCloudAPI ? (
          <ConnectContainer
            selectedNewNumber={selectedNewNumber}
            setSelectedNewNumber={setSelectedNewNumber}
            onSubmit={() => machineSend({ type: "SUBMIT" })}
            showConnectionFee={showConnectionFee}
          />
        ) : (
          <Create360DialogAccount
            migrateTo360DialogUrl={`${CONNECT_TO_360DIALOG_URL}${migrate360UrlWithQueryParams}`}
            onSuccess={(channelCreated) => {
              setChannelCreated(channelCreated);
              machineSend({ type: "SUBMIT" });
            }}
          />
        );
      case machine.matches("official.setChannelName"):
        return (
          <SetChannelName
            selectedNewNumber={selectedNewNumber}
            setSelectedNewNumber={setSelectedNewNumber}
            onSubmit={() => machineSend({ type: "SUBMIT" })}
            skipAutoTopUp={() => machineSend({ type: "SKIP_AUTO_TOP_UP" })}
          />
        );
      case machine.matches("official.setAutoTopUp"):
        return (
          <SetAutoTopUp
            selectedNewNumber={selectedNewNumber}
            onSubmit={() => machineSend({ type: "SUBMIT" })}
          />
        );
      case machine.matches("official.allSet"):
        return <AllSet selectedNewNumber={selectedNewNumber} hasTopUp={true} />;
      case machine.matches("haveTwilio.connectTwilio"):
        // case machine.matches("haveTwilio"):
        history.push({
          pathname: routeTo("/channels"),
          state: { channelName: "twilio_whatsapp" },
        });
        break;
      case machine.matches("haveTwilio"):
        return (
          <ChooseTwilioScenario
            onScenarioChange={setOfficialScenario}
            scenario={officialScenario}
          />
        );
      case machine.matches("completed"):
        if (channelCreated) {
          return (
            <CompleteOfficialVerification
              accessLevel={channelCreated.accessLevel}
              phone={channelCreated.whatsAppPhoneNumber}
              channelName={channelCreated.channelName}
              channelId={channelCreated.id}
            />
          );
        } else {
          refreshCompany();
          //todo flash?
          history.push(routeTo("/channels"));
          return null;
        }
      default:
        console.error("Missing state handle", machine);
        return null;
    }
  }

  const goBack = () => {
    const result = machineSend({ type: "BACK" });
    if (result.matches("idle")) {
      history.push("/guide/whatsapp-comparison/cloudAPI");
      return;
    }
    return result;
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        {user?.id && machine.nextEvents.includes("BACK") && !machine.done && (
          <div className="back">
            <BackLink onClick={goBack}>{t("nav.backShort")}</BackLink>
          </div>
        )}
      </div>
      <div className={`create-form`}>
        <div className={styles.wrapper}>
          <WhatsappOnboardingContextProvider
            machineState={machine}
            machineSend={machineSend}
          >
            {
              //{userId ? stepContent() :}
              stepContent()
            }
          </WhatsappOnboardingContextProvider>
        </div>
      </div>
    </div>
  );
}
