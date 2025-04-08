import React, { useState } from "react";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { Button, Icon, Message, Modal } from "semantic-ui-react";
import { submitCreateList } from "../../../api/Contacts/submitCreateList";
import { useTranslation } from "react-i18next";
import useImportedLists from "../../../container/Contact/Imported/useImportedLists";

interface CreateListPopupProps {
  onComplete: (id: number) => void;
  setShowModal: (showModal: boolean) => void;
  showModal: boolean;
}

export function CreateListPopup(props: CreateListPopupProps) {
  const { showModal, setShowModal } = props;
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();
  const { refresh } = useImportedLists();

  async function createList() {
    setPending(true);
    try {
      setError(``);
      const result = await submitCreateList(name, []);
      flash(t("flash.lists.created"));
      refresh();
      props.onComplete(result.id);
      setShowModal(false);
    } catch (e) {
      setError(t("system.error.unknown"));
    } finally {
      setPending(false);
    }
  }

  function closeModal() {
    setShowModal(false);
    setError("");
    setName("");
  }

  let nameFilledOut = name.trim().length > 0;

  return (
    <>
      <Button onClick={() => setShowModal(true)} primary>
        {t("profile.lists.createPopup.trigger")}
      </Button>
      <Modal
        open={showModal}
        size={"small"}
        className={"create-form create-contacts-form"}
      >
        <Modal.Header>
          {t("profile.lists.createPopup.header")}
          <Icon name={"delete"} className={"lg"} onClick={closeModal} />
        </Modal.Header>
        <Modal.Content>
          <div className="ui form">
            <div className="field">
              <label>{t("form.list.field.name.label")}</label>
              <input
                type={"text"}
                value={name}
                placeholder={t("form.list.field.name.placeholder")}
                onInput={(event) => setName(event.currentTarget.value)}
              />
              {error && <Message error content={error} />}
            </div>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={nameFilledOut ? () => createList() : undefined}
            disabled={!nameFilledOut}
            loading={pending}
            primary
          >
            {t("form.button.create")}
          </Button>
          <Button onClick={closeModal}>{t("form.button.cancel")}</Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}
