import React, { useCallback, useContext, useEffect, useState } from "react";
import { MigrateBspHeader } from "./MigrateBspHeader";
import { Dropdown, Image, Radio } from "semantic-ui-react";
import {
  LanguageDict,
  LanguageDictEnum,
  VerifyMethodDict,
  VerifyMethodDictEnum,
} from "./types";
import uuid from "uuid";
import { Button } from "component/shared/Button/Button";
import styles from "./VerifyCode.module.css";
import { useTranslation } from "react-i18next";
import TickIcon from "../../../assets/images/icons/tick-circle-blue.svg";
import ErrorIcon from "../../../assets/images/x-circle-red.svg";
import { DigitsInput } from "./DigitsInput";
import { MigrateNumberContext } from "./MigrateNumberContext";
import { submitCodeRequest } from "api/CloudAPI/submitCodeRequest";
import { submitVerifiedCode } from "api/CloudAPI/submitVerifiedCode";
import moment from "moment";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { parseHttpError } from "api/apiRequest";
import { htmlEscape } from "../../../lib/utility/htmlEscape";
export const LOCAL_LAST_GET_CODE_TIME_STORAGE = "LAST_GET_CODE_TIME_STORAGE";

export const VerifyCode = (props: { onNextClick: () => void }) => {
  const { onNextClick } = props;
  const { t } = useTranslation();
  const migrateNumberContext = useContext(MigrateNumberContext);
  const [method, setMethod] = useState<VerifyMethodDictEnum>(
    VerifyMethodDict.sms
  );
  const [language, setLanguage] = useState<LanguageDictEnum>(
    LanguageDict.english
  );
  const flash = useFlashMessageChannel();
  const digitNumber = 6;
  const [isCodeError, setCodeError] = useState(false);
  const [invalidTime, setInvalidTime] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);

  const langOptionTranslationDict = {
    cantonese: t(
      "guideContainer.migrateNumber.verifyCode.language.options.cantonese"
    ),
    mainland: t(
      "guideContainer.migrateNumber.verifyCode.language.options.mainland"
    ),
    taiwan: t(
      "guideContainer.migrateNumber.verifyCode.language.options.taiwan"
    ),
    english: t(
      "guideContainer.migrateNumber.verifyCode.language.options.english"
    ),
  };
  const langOptions = Object.entries(LanguageDict).map(([key, value]) => ({
    key: uuid(),
    value: value,
    text: langOptionTranslationDict[key],
  }));

  const checkGetCodeTimeDiff = () => {
    const lastGetCodeTime = localStorage.getItem(
      LOCAL_LAST_GET_CODE_TIME_STORAGE
    );
    if (lastGetCodeTime) {
      if (moment().diff(moment(lastGetCodeTime), "hours", true) > 1) {
        setInvalidTime(false);
        localStorage.removeItem(LOCAL_LAST_GET_CODE_TIME_STORAGE);
      } else {
        setInvalidTime(true);
      }
    }
  };

  const handleClickGetCode = useCallback(async () => {
    try {
      setCodeLoading(true);
      const res = await submitCodeRequest({
        facebookWabaId: migrateNumberContext.facebookWabaId,
        facebookPhoneNumber: migrateNumberContext.facebookPhoneNumber,
        destinationPhoneNumberId: migrateNumberContext.destinationPhoneNumberId,
        codeMethod: method,
        language,
      });
      setInvalidTime(true);
      if (res.code_sent) {
        const now = new Date().toISOString();
        localStorage.setItem(LOCAL_LAST_GET_CODE_TIME_STORAGE, now);
      } else {
        console.error("code_sent fail", res.code_sent);
      }
    } catch (e) {
      console.error("handleClickGetCode e: ", e);
      const error = parseHttpError(e);
      flash(htmlEscape(`${error}`));
    } finally {
      setCodeLoading(false);
    }
  }, [
    migrateNumberContext.facebookWabaId,
    migrateNumberContext.facebookPhoneNumber,
    migrateNumberContext.destinationPhoneNumberId,
    method,
    language,
  ]);

  const handleVerifyFail = () => {
    migrateNumberContext.dispatch({
      type: "SET_VERIFY_FAIL",
    });
  };

  const verifyCode = async (props: {
    facebookWabaId: string;
    facebookPhoneNumber: string;
    destinationPhoneNumberId: string;
    code: string[];
  }) => {
    const {
      facebookWabaId,
      facebookPhoneNumber,
      destinationPhoneNumberId,
      code,
    } = props;
    try {
      migrateNumberContext.dispatch({
        type: "SET_LOADING",
        loading: true,
      });
      const res = await submitVerifiedCode({
        facebookWabaId,
        facebookPhoneNumber,
        destinationPhoneNumberId,
        code: code.join(""),
      });
      if (res.success) {
        migrateNumberContext.dispatch({
          type: "SET_DESTINATION_MESSAGING_HUB_INFO",
          destinationMessagingHubWabaId: res.messaging_hub_waba_id ?? "",
          destinationMessagingHubPhoneNumberId:
            res.messaging_hub_phone_number_id ?? "",
        });
        onNextClick();
      } else {
        setCodeError(true);
        handleVerifyFail();
      }
    } catch (e) {
      console.error("e: ", e);
      const error = parseHttpError(e);
      flash(htmlEscape(`${error}`));
      handleVerifyFail();
    } finally {
      migrateNumberContext.dispatch({
        type: "SET_LOADING",
        loading: false,
      });
    }
  };

  const initiateCode = () => {
    return Array(digitNumber).fill("");
  };

  const handleClickMethod = (method: VerifyMethodDictEnum) => {
    setMethod(method);
    migrateNumberContext.dispatch({
      type: "SET_VERIFIED_CODE",
      verifiedCode: initiateCode(),
    });
  };

  useEffect(() => {
    if (
      !migrateNumberContext.loading &&
      migrateNumberContext.isClicked &&
      migrateNumberContext.verifiedCode.length === 6
    ) {
      verifyCode({
        facebookWabaId: migrateNumberContext.facebookWabaId,
        facebookPhoneNumber: migrateNumberContext.facebookPhoneNumber,
        destinationPhoneNumberId: migrateNumberContext.destinationPhoneNumberId,
        code: migrateNumberContext.verifiedCode,
      });
    }
  }, [
    migrateNumberContext.isClicked,
    migrateNumberContext.facebookWabaId,
    migrateNumberContext.facebookPhoneNumber,
    migrateNumberContext.destinationPhoneNumberId,
    migrateNumberContext.verifiedCode,
    migrateNumberContext.loading,
  ]);

  useEffect(() => {
    migrateNumberContext.dispatch({
      type: "SET_VERIFIED_CODE",
      verifiedCode: initiateCode(),
    });
  }, [migrateNumberContext.dispatch]);

  useEffect(() => {
    checkGetCodeTimeDiff();
  }, []);

  return (
    <div className={styles.container}>
      <MigrateBspHeader
        title={t("guideContainer.migrateNumber.verifyCode.title")}
        description={t("guideContainer.migrateNumber.verifyCode.description")}
      />
      <div className={styles.titleContainer}>
        <Image src={TickIcon} alt="dropdown" className={styles.tick} />
        <label htmlFor="">
          {t("guideContainer.migrateNumber.verifyCode.method.label")}
        </label>
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.radioGroup}>
          <Button
            onClick={() => handleClickMethod(VerifyMethodDict.sms)}
            className={method === VerifyMethodDict.sms ? "active" : ""}
          >
            {t("guideContainer.migrateNumber.verifyCode.method.options.sms")}
          </Button>
          <Radio
            label="sms"
            value={VerifyMethodDict.sms}
            checked={method === VerifyMethodDict.sms}
          />
          <Button
            onClick={() => handleClickMethod(VerifyMethodDict.voice)}
            className={method === VerifyMethodDict.voice ? "active" : ""}
          >
            {t("guideContainer.migrateNumber.verifyCode.method.options.voice")}
          </Button>
          <Radio
            label="voice"
            value={VerifyMethodDict.voice}
            checked={method === VerifyMethodDict.voice}
          />
        </div>
        <div className={styles.languageContainer}>
          <label htmlFor="">
            {t("guideContainer.migrateNumber.verifyCode.language.label")}
          </label>
          <Dropdown
            selection
            options={langOptions}
            onChange={(e, data) => setLanguage(data.value as LanguageDictEnum)}
            value={language}
          />
        </div>
        <Button
          primary
          className={styles.getCode}
          loading={codeLoading}
          onClick={invalidTime ? undefined : handleClickGetCode}
          disabled={invalidTime}
        >
          {t("guideContainer.migrateNumber.verifyCode.button.getCode")}
        </Button>
        {invalidTime && (
          <div className={styles.invalidTime}>
            {t("guideContainer.migrateNumber.verifyCode.invalidTime")}
          </div>
        )}
      </div>
      <div className={styles.titleContainer}>
        <Image src={TickIcon} alt="dropdown" className={styles.tick} />
        <label htmlFor="">
          {method === VerifyMethodDict.sms
            ? t("guideContainer.migrateNumber.verifyCode.smsHint")
            : t("guideContainer.migrateNumber.verifyCode.voiceHint")}
        </label>
      </div>
      <div className={styles.digitInputContainer}>
        <DigitsInput
          digitNumber={digitNumber}
          isError={isCodeError}
          resetError={() => setCodeError(false)}
          setCode={(code) => {
            if (migrateNumberContext.isVerifyFail) {
              migrateNumberContext.dispatch({
                type: "SET_IS_VERIFY_CODE_FAIL",
                isVerifyFail: false,
              });
            }
            migrateNumberContext.dispatch({
              type: "SET_VERIFIED_CODE",
              verifiedCode: code,
            });
          }}
          code={migrateNumberContext.verifiedCode}
        />
      </div>
      {isCodeError && (
        <div className={styles.errorMsgContainer}>
          <Image src={ErrorIcon} className={styles.errorIcon} />
          <span>
            {t("guideContainer.migrateNumber.verifyCode.errorCodeMessage")}
          </span>
        </div>
      )}
    </div>
  );
};
