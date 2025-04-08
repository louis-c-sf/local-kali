import moment, { Moment } from "moment";
import React, { useEffect, useState } from "react";
import { DropdownProps, Modal } from "semantic-ui-react";
import { useCurrentUtcOffset } from "../../Chat/hooks/useCurrentUtcOffset";
import { toDatePickerDate } from "../../AssignmentRules/AutomationRuleEdit/fields/helpers";
import { parseHttpError, postWithExceptions } from "../../../api/apiRequest";
import {
  POST_WHATSAPP_SCHEDULED_SYNC,
  POST_WHATSAPP_SYNC,
} from "../../../api/apiPath";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { useTranslation } from "react-i18next";
import { fetchCompany } from "../../../api/Company/fetchCompany";
import { useAppDispatch } from "../../../AppRootContext";
import SyncWhatsappHistorylModalView from "./SyncWhatsappHistorylModalView";
import { WhatsAppScheduleOptionsType } from "./types";
import styles from "./SyncWhatsappHistorylModalView.module.css";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

interface SyncWhatsappHistoryModalProps {
  open: boolean;
  instanceId?: string;
  onDismiss: () => void;
}

export default function SyncWhatsappHistoryModal(
  props: SyncWhatsappHistoryModalProps
) {
  const { onDismiss, instanceId } = props;
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] =
    useState<WhatsAppScheduleOptionsType>("scheduled");
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [step, setStep] = useState(0);
  const utcOffset = useCurrentUtcOffset();
  const loginDispatch = useAppDispatch();
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();

  const UTC_OFFSET_HK = 8;

  function handleDropDownOnChange(
    event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps
  ) {
    if (data.value) {
      const value = data.value as string;
      if (value === "scheduled") {
        setScheduledDateTime(
          moment().utcOffset(utcOffset).add(1, "day").startOf("day").format()
        );
      }
      setSelectedType(data.value as typeof selectedType);
    }
  }

  useEffect(() => {
    setScheduledDateTime(
      moment().utcOffset(utcOffset).add(1, "day").startOf("day").format()
    );
  }, [utcOffset]);

  async function onSubmit() {
    if (!instanceId) {
      return;
    }
    setLoading(true);
    try {
      if (selectedType === "immediately") {
        await postWithExceptions(
          POST_WHATSAPP_SYNC.replace("{instanceId}", instanceId),
          { param: {} }
        );
        flash(t("flash.channels.sync.inProgress"));
        const result = await fetchCompany();
        loginDispatch({
          type: "ADD_COMPANY",
          company: result,
        });
        handleDismiss();
      } else {
        await postWithExceptions(POST_WHATSAPP_SCHEDULED_SYNC, {
          param: {
            instanceId: instanceId,
            scheduledAtHKT: moment(scheduledDateTime)
              .utcOffset(UTC_OFFSET_HK, false)
              .format("YYYY-MM-DDTHH:mm:ss"),
          },
        });
      }
      //setStep reset ?
      handleDismiss();
    } catch (e) {
      console.error(`onSubmit error`, e);
      const error = parseHttpError(e);
      let errorMsg = t("channels.history.error.unable");
      if (typeof error === "string") {
        errorMsg = error;
      } else if (error.message) {
        errorMsg = error.message;
      }
      flash(t("flash.common.error.general", { error: htmlEscape(errorMsg) }));
    } finally {
      setLoading(false);
    }
  }

  function onNextClick(): void {
    setStep((prevStep) => (prevStep += 1));
  }

  function handleDateTimeChange(date: Moment | undefined) {
    setScheduledDateTime(date?.toISOString() ?? "");
  }

  let dateValue = undefined;
  if (scheduledDateTime) {
    const date = moment(scheduledDateTime);
    dateValue = date.isValid() ? toDatePickerDate(date, utcOffset) : undefined;
  }

  const handleDismiss = () => {
    setStep(0);
    onDismiss();
  };

  return (
    <Modal open={props.open} className={`sync-history-modal ${styles.modal}`}>
      <SyncWhatsappHistorylModalView
        {...{
          step,
          onDismiss: handleDismiss,
          onNextClick,
          onSubmit,
          loading,
          selectedType,
          handleDropDownOnChange,
          dateValue,
          handleDateTimeChange,
        }}
      />
    </Modal>
  );
}
