import React from "react";
import { TFunction } from "i18next";
import {
  Button,
  Dropdown,
  DropdownProps,
  Form,
  Image,
  Modal,
} from "semantic-ui-react";
import { Trans, useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import { Moment } from "moment";
import { toUserUtcDate } from "../../AssignmentRules/AutomationRuleEdit/fields/helpers";
import { useCurrentUtcOffset } from "../../Chat/hooks/useCurrentUtcOffset";
import { WhatsAppScheduleOptionsType } from "./types";
import { CloseButton } from "../../shared/CloseButton";
import ProgressDots from "../../shared/ProgressDots/ProgressDots";
import WhatsappSyncImg from "../../../assets/images/whatsapp-sync.svg";
import step1ImgCN from "../../../assets/images/syncWhatsapp_step1_ch.jpg";
import step1ImgHK from "../../../assets/images/syncWhatsapp_step1_hk.jpg";
import step1ImgEN from "../../../assets/images/syncWhatsapp_step1_en.jpg";
import step2ImgCN from "../../../assets/images/syncWhatsapp_step2_ch.jpg";
import step2ImgHK from "../../../assets/images/syncWhatsapp_step2_hk.jpg";
import step2ImgEN from "../../../assets/images/syncWhatsapp_step2_en.jpg";
import CheckIcon from "../../../assets/tsx/icons/CheckIcon";
import TipIcon from "../../../assets/images/tips.svg";
import styles from "./SyncWhatsappHistorylModalView.module.css";

const steps = {
  first: 0,
  second: 1,
  final: 2,
};

const Contents = (props: { step: number }) => {
  const { step } = props;
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const imageMapping = {
    "en-US": {
      step1: step1ImgEN,
      step2: step2ImgEN,
    },
    "zh-CN": {
      step1: step1ImgCN,
      step2: step2ImgCN,
    },
    "zh-HK": {
      step1: step1ImgHK,
      step2: step2ImgHK,
    },
  };

  const subHeaderMapping = [
    t("channels.history.step1.subHeader"),
    t("channels.history.step2.subHeader"),
  ];

  const checkList = (t: TFunction, step: number) => {
    return step === steps.first
      ? [
          <>{t("channels.history.step1.list1")}</>,
          <>{t("channels.history.step1.list2")}</>,
        ]
      : [
          <Trans i18nKey={"channels.history.step2.list"}>
            New messages from these contacts will be assigned
            <br />
            according to assignment rules
          </Trans>,
        ];
  };

  return (
    <>
      <Image fluid src={imageMapping[lang][`step${step + 1}`]} />
      <h3>{subHeaderMapping[step]}</h3>
      <ul>
        {checkList(t, step).map((row) => (
          <div className={styles.listRow}>
            <CheckIcon />
            <li>{row}</li>
          </div>
        ))}
      </ul>
      {step === steps.second && (
        <div className={styles.tipContainer}>
          <span className={styles.tipTitle}>
            <span>{t("channels.history.step2.tip.title")}</span>
            <Image src={TipIcon} size="mini" />
          </span>
          <span>{t("channels.history.step2.tip.content")}</span>
        </div>
      )}
    </>
  );
};

const ContentStep3 = (props: {
  selectedType: WhatsAppScheduleOptionsType;
  handleDropDownOnChange: (
    event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps
  ) => void;
  dateValue: any;
  handleDateTimeChange: (date: Moment | undefined) => void;
}) => {
  const { t } = useTranslation();
  const utcOffset = useCurrentUtcOffset();

  const {
    selectedType,
    handleDropDownOnChange,
    dateValue,
    handleDateTimeChange,
  } = props;
  const scheduleOptions = [
    {
      id: 1,
      value: "immediately",
      text: t("channels.history.step3.option.immediately"),
    },
    {
      id: 2,
      value: "scheduled",
      text: t("channels.history.step3.option.date"),
    },
  ];

  return (
    <>
      <Image fluid src={WhatsappSyncImg} />
      <div className="content">
        <Trans i18nKey={"channels.history.step3.content"}>
          <br />
          <br />
        </Trans>
        <Form className="form">
          <Form.Field>
            <label htmlFor="schedule">
              {t("channels.history.step3.field.schedule.label")}
            </label>
            <Dropdown
              options={scheduleOptions}
              selectOnBlur={false}
              value={selectedType}
              onChange={handleDropDownOnChange}
            />
          </Form.Field>
          {selectedType === "scheduled" && (
            <Form.Field>
              <label>{t("channels.history.step3.field.date.label")}</label>
              <DatePicker
                selected={dateValue}
                showTimeSelect
                minDate={new Date()}
                onChange={(date, e) =>
                  handleDateTimeChange(
                    date ? toUserUtcDate(date, utcOffset) : undefined
                  )
                }
                placeholderText={t(
                  "channels.history.step3.field.date.placeholder"
                )}
                dateFormat={"yyyy/MM/dd h:mm aa"}
              />
            </Form.Field>
          )}
        </Form>
      </div>
    </>
  );
};

const SyncWhatsappHistoryModalWrapper = (props: {
  onDismiss: () => void;
  step: number;
  title: React.ReactElement | string;
  handleOnClick: () => void;
  loading: boolean;
  children: JSX.Element;
}) => {
  const { onDismiss, step, loading, title, handleOnClick, children } = props;
  const { t } = useTranslation();

  return (
    <Modal.Content>
      <CloseButton onClick={onDismiss} />
      <div className="header">{title}</div>
      {children}
      <Button
        primary
        loading={step === steps.final && loading}
        onClick={
          step === steps.final
            ? loading
              ? undefined
              : () => handleOnClick()
            : () => handleOnClick()
        }
        content={
          step === steps.final
            ? t("channels.history.step3.buttons.schedule")
            : t("channels.history.common.buttons.next")
        }
      />
      <ProgressDots currentStep={step} stepsTotal={Object.keys(steps).length} />
    </Modal.Content>
  );
};

const SyncWhatsappHistorylModalView = (props: {
  step: number;
  onDismiss: () => void;
  onNextClick: () => void;
  onSubmit: () => Promise<void>;
  loading: boolean;
  selectedType: WhatsAppScheduleOptionsType;
  handleDropDownOnChange: (
    event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps
  ) => void;
  dateValue: any;
  handleDateTimeChange: (date: Moment | undefined) => void;
}) => {
  const {
    step,
    onDismiss,
    onNextClick,
    onSubmit,
    loading,
    selectedType,
    handleDropDownOnChange,
    dateValue,
    handleDateTimeChange,
  } = props;
  const { t } = useTranslation();

  return (
    <>
      {step === steps.first ? (
        <SyncWhatsappHistoryModalWrapper
          {...{
            onDismiss,
            title: t("channels.history.step1.header"),
            step,
            handleOnClick: onNextClick,
            loading: false,
          }}
        >
          <Contents step={step} />
        </SyncWhatsappHistoryModalWrapper>
      ) : step === steps.second ? (
        <SyncWhatsappHistoryModalWrapper
          {...{
            onDismiss,
            title: t("channels.history.step2.header"),
            step,
            handleOnClick: onNextClick,
            loading: false,
          }}
        >
          <Contents step={step} />
        </SyncWhatsappHistoryModalWrapper>
      ) : (
        <SyncWhatsappHistoryModalWrapper
          {...{
            title: (
              <Trans i18nKey={"channels.history.step3.header"}>
                <br />
              </Trans>
            ),
            step,
            onDismiss,
            handleOnClick: onSubmit,
            loading,
          }}
        >
          <ContentStep3
            {...{
              selectedType,
              handleDropDownOnChange,
              dateValue,
              handleDateTimeChange,
            }}
          />
        </SyncWhatsappHistoryModalWrapper>
      )}
    </>
  );
};
export default SyncWhatsappHistorylModalView;
