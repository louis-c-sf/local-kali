import React, { useEffect, useState } from "react";
import { Dropdown, DropdownItemProps, DropdownProps } from "semantic-ui-react";
import mainStyles from "./StripeOnboardingScreen.module.css";
import styles from "./StripeOnboardingSteps.module.css";
import StripeCircleIcon from "./StripeCircleIcon";
import TickIcon from "assets/tsx/icons/TickIcon";
import { Button } from "component/shared/Button/Button";
import { useStripeOnboardingStep } from "./StripeOnboardingStepProvider";
import {
  fetchSleekPayConnect,
  SleekPayConnectResponseType,
} from "api/StripePayment/fetchSleekPayConnect";
import { fetchSleekPaySupportedCurrencies } from "api/StripePayment/fetchSleekPaySupportedCurrencies";
import { Trans, useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { getCurrencyMapping } from "config/localizable/useCountryCodeCurrencyMapping";

interface CountryOptionsType extends DropdownItemProps {
  paymentfee: string;
  setupfee: string;
}

export const defaultCountryOpts: (t: TFunction) => CountryOptionsType[] = (
  t: TFunction
) => [
  {
    text: t("onboarding.stripe.createAccount.location.hongKong"),
    value: "HK",
    setupfee: `${getCurrencyMapping("HKD")}779`,
    paymentfee: `${getCurrencyMapping("HKD")}2.8 + 3.4%`,
  },
  {
    text: t("onboarding.stripe.createAccount.location.singapore"),
    value: "SG",
    setupfee: `${getCurrencyMapping("SGD")}139`,
    paymentfee: `${getCurrencyMapping("SGD")}0.58 + 3.4%`,
  },
  // TODO: NOT Supported by our stripe now, will wait for stripe update for this
  {
    text: t("onboarding.stripe.createAccount.location.malaysia"),
    value: "MY",
    setupfee: "MYR$439",
    paymentfee: "MYR$1.73 + 3.4%",
  },
  {
    text: t("onboarding.stripe.createAccount.location.unitedKingdom"),
    value: "GB",
    setupfee: `${getCurrencyMapping("GBP")}89`,
    paymentfee: `${getCurrencyMapping("GBP")}0.29 + 3.4%`,
  },
];

function useFetchSleekPayConnect(props: {
  onConnected: (data: SleekPayConnectResponseType) => void;
  onError: (error: { response: { message: string } }) => void;
}) {
  const { onConnected, onError } = props;
  const [data, setData] = useState<SleekPayConnectResponseType>();
  const [loading, setLoading] = useState(false);

  const fetchConnect = (countryCode: string) => {
    setLoading(true);
    fetchSleekPayConnect(countryCode)
      .then((response) => {
        setData(response);
        onConnected(response);
      })
      .catch((err) => {
        onError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return {
    data,
    loading,
    refreshConnect: fetchConnect,
  };
}

export default function StripeCreateAccountStep() {
  const { t } = useTranslation();
  const { goToNextStep, setTrackingUrl, country, setCountry } =
    useStripeOnboardingStep();
  const flash = useFlashMessageChannel();
  const [trackingError, setTrackingError] = useState(false);
  const { loading, refreshConnect } = useFetchSleekPayConnect({
    onConnected: (data) => {
      if (data?.trackingUrl) {
        setTrackingUrl(data?.trackingUrl);
        goToNextStep();
      }
    },
    onError: (error) => {
      if (error?.response?.message === "Registered") {
        flash(t("onboarding.stripe.createAccount.error.registeredErr"));
      } else {
        setTrackingError(true);
      }
    },
  });
  const [countryOpts, setCountryOpts] = useState<CountryOptionsType[]>([]);

  const updateRegisterDropdown = (
    e: React.SyntheticEvent,
    data: DropdownProps
  ) => {
    setCountry(data.value as string);
  };

  function handleNextStep() {
    if (!country) {
      return;
    }
    refreshConnect(country);
  }

  useEffect(() => {
    const getSupportedCurrencies = async () => {
      const { stripeSupportedCurrenciesMappings: supportedCurrencies } =
        await fetchSleekPaySupportedCurrencies();
      const unsupportedCurrencies = defaultCountryOpts(t).filter(
        (country) =>
          !supportedCurrencies.some(
            (supported) => supported.platformCountry === country.value
          )
      );
      setCountryOpts(unsupportedCurrencies);
    };
    getSupportedCurrencies();
  }, []);

  return trackingError ? (
    <div className={mainStyles.contentContainer}>{t("somethingWentWrong")}</div>
  ) : (
    <>
      <div className={mainStyles.contentContainer}>
        <div className={styles.titleSection}>
          <StripeCircleIcon />
          <div>
            <h1>{t("channelPrototype.stripe.title")}</h1>
            <p>{t("channelPrototype.stripe.titleContent")}</p>
          </div>
        </div>
        <p className={styles.createAccountDescription}>
          {t("onboarding.stripe.createAccount.longDescription")}
        </p>
        <p className={styles.selectCountryTitle}>
          {t("onboarding.stripe.createAccount.selectLocation")}
        </p>
        <p className={styles.selectCountryDescription}>
          {t("onboarding.stripe.createAccount.locationDescription")}
        </p>
        <div className={`${styles.selectCountryDropdown} ui form`}>
          <Dropdown
            selectOnBlur={false}
            options={countryOpts}
            upward={false}
            value={country}
            placeholder={t("onboarding.stripe.createAccount.placeholder")}
            onChange={updateRegisterDropdown}
          />
        </div>
        <p className={mainStyles.listTitle}>
          {t("onboarding.stripe.createAccount.reminderCard.required.header")}
        </p>
        <ul className={mainStyles.checkList}>
          <li>
            <TickIcon />
            <span>
              {t(
                "onboarding.stripe.createAccount.reminderCard.required.bankAccount"
              )}
            </span>
          </li>
        </ul>

        <Button
          primary
          className="fluid"
          onClick={handleNextStep}
          loading={loading}
          disabled={!country}
        >
          {t("onboarding.stripe.createAccount.nextButton")}
        </Button>
        <p className={styles.actionMessage}>
          {t("onboarding.stripe.createAccount.actionMessage")}
        </p>
      </div>
      <p className={styles.guideText}>
        <Trans i18nKey="onboarding.stripe.createAccount.guideText">
          Not sure about what to do? View our step-by-step guide
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.sleekflow.io/app-integrations/stripe"
          >
            here
          </a>
          .
        </Trans>
      </p>
    </>
  );
}
