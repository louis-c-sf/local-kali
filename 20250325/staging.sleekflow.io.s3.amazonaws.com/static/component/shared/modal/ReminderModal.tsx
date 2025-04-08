import React, { useMemo, useState } from "react";
import { Button, Form, Icon, Modal } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import DatePickerUtcAware from "../DatePickerUTCAware";
import moment, { Moment } from "moment";
import { useCurrentUtcOffset } from "../../Chat/hooks/useCurrentUtcOffset";
import { toDatePickerDate } from "component/AssignmentRules/AutomationRuleEdit/fields/helpers";

function ReminderModal(props: {
  modalOpened: boolean;
  closeModal: () => void;
  onSubmit: (dateUntil: Date) => void;
}) {
  const { modalOpened, closeModal, onSubmit } = props;
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();

  const [loading, setLoading] = useState(false);
  const utcOffset = useCurrentUtcOffset();

  const minDateStamp = moment(toDatePickerDate(moment(), utcOffset));

  const minDate = useMemo(() => minDateStamp.toDate(), [minDateStamp.format()]);
  const [dateUntil, setDateUntil] = useState<Moment>(minDateStamp);
  function handleCloseModal() {
    closeModal();
    setDateUntil(minDateStamp);
  }
  function submitSnooze() {
    if (!dateUntil) {
      return;
    }
    setLoading(true);
    try {
      onSubmit(dateUntil.toDate());
      flash(
        t("flash.inbox.chat.snoozed", {
          time: dateUntil.utcOffset(utcOffset).format("LLL"),
        })
      );
      handleCloseModal();
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }
  return (
    <Modal
      open={modalOpened}
      size={"small"}
      className={"create-form minimal"}
      onClose={handleCloseModal}
    >
      <Modal.Content>
        <h3 className={"modal-header"}>
          {t("chat.modal.setReminder.header")}
          <Icon name={"delete"} className={"lg"} onClick={closeModal} />
        </h3>
        <div className="sub-header">
          {t("chat.modal.setReminder.subHeader")}
        </div>
        <Form>
          <div className={"ui field"}>
            <DatePickerUtcAware
              onChange={(date) => {
                setDateUntil(date ?? minDateStamp);
              }}
              minDate={minDate}
              selected={dateUntil}
              placeholderText={t("chat.form.input.datetime.placeholder")}
              dateFormat={"yyyy/MM/dd h:mm aa"}
              utcOffset={utcOffset}
              showTimeSelect
            />
          </div>
        </Form>
      </Modal.Content>
      <div className="actions">
        <Button
          primary
          loading={loading}
          disabled={loading || dateUntil === null}
          className={"button-small"}
          content={t("chat.modal.setReminder.buttons.submit")}
          onClick={submitSnooze}
        />
      </div>
    </Modal>
  );
}

export default ReminderModal;
