import { fetchCurrenciesSupported } from "api/SleekPay/fetchCurrenciesSupported";
import { submitExportPayment } from "api/Stripe/submitExportPayment";
import { Button } from "component/shared/Button/Button";
import moment, { Moment } from "moment";
import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Image, Input, Modal } from "semantic-ui-react";
import styles from "./ExportModal.module.css";
import { DateRangePicker, FocusedInputShape } from "react-dates";
import SuccessfulIcon from "../../../features/Stripe/usecases/Refund/components/SuccessStep/assets/tick-circle.svg";
import { object, string } from "yup";
import { FieldError } from "container/SignIn";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { useAppSelector } from "AppRootContext";
import { equals } from "ramda";

const SceneDict = {
  fill: "fill",
  success: "success",
} as const;
type SceneType = keyof typeof SceneDict;
export const ExportModal = (props: {
  showModal: boolean;
  onClose: () => void;
  startDate: Moment | undefined;
  endDate: Moment | undefined;
}) => {
  const { showModal, onClose } = props;
  const user = useAppSelector((s) => s.user, equals);

  const flash = useFlashMessageChannel();
  const [scene, setScene] = useState<SceneType>(SceneDict.fill);
  const maxDate = moment().subtract(4, "days");
  const [startDate, setStartDate] = useState<Moment | undefined>(
    moment().subtract(34, "days")
  );
  const [endDate, setEndDate] = useState<Moment | undefined>(maxDate);
  const [focusedDatepicker, setFocusedDatepicker] =
    useState<FocusedInputShape | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(user?.email || "");
  const { t } = useTranslation();
  const formValidator = object().shape({
    email: string()
      .trim()
      .required(t("form.forgotPwd.field.email.rule.required"))
      .email(t("form.forgotPwd.field.email.rule.email")),
  });
  const [errorMsg, setErrorMsg] = useState("");

  function setDateRange(value: {
    startDate: Moment | null;
    endDate: Moment | null;
  }) {
    const { startDate, endDate } = value;
    if (startDate) {
      setStartDate(startDate);
    }
    if (endDate) {
      setEndDate(endDate);
    }
  }
  const handleExport = async () => {
    try {
      setLoading(true);
      await formValidator.validate({
        email,
      });

      let platformCountry = "";
      const currencies = await fetchCurrenciesSupported();
      if (currencies.stripeSupportedCurrenciesMappings) {
        platformCountry =
          currencies.stripeSupportedCurrenciesMappings[0].platformCountry;
      }
      await submitExportPayment({
        receiverEmailAddress: email,
        startDate: startDate?.format("YYYY-MM-DD") || "",
        endDate: endDate?.format("YYYY-MM-DD 23:59:59") || "",
        platformCountry,
      });
      setScene(SceneDict.success);
    } catch (e) {
      console.error(e);
      if (e.errors && e.errors.length > 0) {
        setErrorMsg(e.errors[0]);
      } else {
        flash(t("flash.common.unknownErrorTryLater"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={showModal}
      closeOnDimmerClick={false}
      dimmer={"inverted"}
      size={"small"}
      onClose={onClose}
      className={styles.modal}
    >
      <Modal.Header>
        {t("settings.paymentLink.order.export.modal.title")}
      </Modal.Header>
      <Modal.Content>
        {scene === SceneDict.fill ? (
          <>
            <div className={styles.description}>
              {t("settings.paymentLink.order.export.modal.description")}
            </div>
            <div className={styles.dateRange}>
              <label>
                {t("settings.paymentLink.order.export.modal.dateRange")}
              </label>
              <DateRangePicker
                isOutsideRange={(date) => date.isAfter(maxDate, "day")}
                disabled={loading}
                startDate={startDate || null}
                startDateId="1"
                endDate={endDate || null}
                endDateId="2"
                hideKeyboardShortcutsPanel={true}
                focusedInput={focusedDatepicker}
                onFocusChange={setFocusedDatepicker}
                onDatesChange={setDateRange}
              />
            </div>
            <div className={styles.email}>
              <label>
                {t("settings.paymentLink.order.export.modal.email")}
              </label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder={"user@domain.com"}
              />
              <FieldError text={errorMsg} />
            </div>
          </>
        ) : (
          <div className={styles.submittedContent}>
            <Image src={SuccessfulIcon} />
            <div className={styles.title}>
              {t("settings.paymentLink.order.export.modal.submitted")}
            </div>
            <div className={styles.description}>
              <Trans
                i18nKey="settings.paymentLink.order.export.modal.submittedDescription"
                values={{
                  email,
                }}
              >
                We have received your request and it will take up to 15 minutes
                to complete your request.
                <br />
                Your report will be sent to {email} once it is ready. Please
                check your email to download the report.
              </Trans>
            </div>
          </div>
        )}
      </Modal.Content>
      <Modal.Actions>
        {scene === SceneDict.fill ? (
          <>
            <Button onClick={loading ? undefined : onClose} disabled={loading}>
              {t("form.button.cancel")}
            </Button>
            <Button
              primary
              onClick={handleExport}
              disabled={email === "" || loading}
              loading={loading}
            >
              {t("form.button.request")}
            </Button>
          </>
        ) : (
          <Button primary onClick={onClose}>
            {t("form.button.done")}
          </Button>
        )}
      </Modal.Actions>
    </Modal>
  );
};
