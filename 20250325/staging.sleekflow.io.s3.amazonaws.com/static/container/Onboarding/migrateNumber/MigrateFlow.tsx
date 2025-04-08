import React, { useReducer, useState } from "react";
import { PostLogin } from "component/Header";
import Wizard from "container/Contact/Import/Wizard";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import { SelectWaba } from "./SelectWaba";
import { GetStarted } from "./GetStarted";
import {
  migrateNumberReducer,
  MigrateNumberType,
} from "./reducer/migrateReducer";
import useRouteConfig from "../../../config/useRouteConfig";
import styles from "./MigrateFlow.module.css";
import {
  NextButtonInfoType,
  ReviewDataType,
  SceneTypeDict,
  SceneTypeDictEnum,
  StepsDict,
} from "./types";
import {
  defaultContextState,
  MigrateNumberContext,
  MigrateNumberContextType,
} from "./MigrateNumberContext";
import { DropdownList } from "./DropdownList";
import { VerifyCode } from "./VerifyCode";
import { AllSet } from "component/CreateWhatsappFlow/AllSet";
import { SetChannelName } from "./SetChannelName";

const MigrateFlow = () => {
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const [migrateState, dispatch] = useReducer(
    migrateNumberReducer,
    defaultContextState
  );
  const [scene, setScene] = useState<SceneTypeDictEnum>(migrateState.scene);
  const selectedData: ReviewDataType = {
    businessAccount: migrateState.reviewData.facebookWabaName,
    phoneNumber: migrateState.reviewData.whatsappPhoneNumber,
    displayName: migrateState.reviewData.whatsappDisplayName,
    channelName: migrateState.reviewData.channelName,
    facebookWabaBusinessName: migrateState.reviewData.facebookWabaBusinessName,
    businessVerificationStatus:
      migrateState.reviewData.facebookWabaBusinessVerificationStatus,
    whatsappNameStatus: migrateState.reviewData.facebookPhoneNumberNameStatus,
    messagingLimit:
      migrateState.reviewData.facebookPhoneNumberMessagingLimitTier,
    facebookPhoneNumberId: "",
    facebookWabaBusinessId: migrateState.reviewData.facebookWabaBusinessId,
  };
  const pageTitle = t("onboarding.whatsappComparison.migrateNumber");
  const nextButtonDict = [
    {
      step: 1,
      showButton: true,
      text: t("form.button.next"),
    },
    {
      step: 2,
      showButton: false,
    },
    {
      step: 3,
      showButton: true,
      text: t("form.button.next"),
    },
    {
      step: 4,
      showButton: true,
      text: t("guideContainer.migrateNumber.verifyCode.button.verify"),
    },
  ] as NextButtonInfoType[];

  const getIsAllowedNext = (state: MigrateNumberType) => {
    let allow = false;
    if (state.currentStep === StepsDict.info) {
      allow = state.isCompleted;
    } else {
      if (state.facebookAccessToken === "") {
        allow = false;
      } else if (state.currentStep === StepsDict.dropdowns) {
        allow =
          state.businessId !== "" &&
          state.facebookWabaId !== "" &&
          state.facebookPhoneNumber !== "";
      } else if (state.currentStep === StepsDict.verifyCode) {
        allow =
          state.verifiedCode.length === 6 &&
          state.verifiedCode.join("") !== "" &&
          !state.isVerifyFail;
      }
    }
    return allow;
  };

  const handleNextClick = () => {
    if (migrateState.currentStep === StepsDict.info) {
      dispatch({ type: "NEXT_STEP" });
      return;
    }
    if (migrateState.facebookAccessToken === "") {
      console.error("missing facebookAccessToken");
      return;
    }
    if (
      migrateState.currentStep === StepsDict.dropdowns ||
      (migrateState.currentStep === StepsDict.verifyCode &&
        migrateState.verifiedCode.length !== 0)
    ) {
      dispatch({ type: "SET_CLICKED_NEXT_BUTTON", isClicked: true });
    }
  };

  const handlePrevClick = () => {
    if (migrateState.currentStep > 1) {
      dispatch({
        type: "RESET_STEP",
        step: migrateState.currentStep - 1,
      });
      dispatch({ type: "PREV_STEP" });
    }
  };
  return (
    <div className={`post-login channel-selection ${styles.flowWrapper}`}>
      <PostLogin selectedItem={""} />
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
      <MigrateNumberContext.Provider
        value={{
          ...migrateState,
          verifiedCode: [...migrateState.verifiedCode],
          dispatch,
        }}
      >
        {scene === "steps" ? (
          <Wizard
            stepNumber={migrateState.currentStep}
            stepsTotal={migrateState.stepsTotal}
            onPrevClick={handlePrevClick}
            onNextClick={handleNextClick}
            allowPrev={true}
            allowNext={getIsAllowedNext(
              migrateState as MigrateNumberContextType
            )}
            hasBackPrevPage={true}
            prevPageLink={routeTo("/request-whatsapp?isCloudAPI=true")}
            nextButtonInfo={nextButtonDict[migrateState.currentStep - 1]}
            loading={migrateState.loading}
          >
            {migrateState.currentStep === 1 && <GetStarted />}
            {migrateState.currentStep === 2 && <SelectWaba />}
            {migrateState.currentStep === 3 && <DropdownList />}
            {migrateState.currentStep === 4 && (
              <VerifyCode
                onNextClick={() => setScene(SceneTypeDict.channelName)}
              />
            )}
          </Wizard>
        ) : scene === "channelName" ? (
          <SetChannelName
            channelName={migrateState.channelName}
            updateChannelName={(channelName) =>
              dispatch({ type: "UPDATE_CHANNEL_NAME", channelName })
            }
            onSubmit={() => setScene(SceneTypeDict.final)}
          />
        ) : (
          <AllSet selectedNewNumber={selectedData} hasTopUp />
        )}
      </MigrateNumberContext.Provider>
    </div>
  );
};

export default MigrateFlow;
