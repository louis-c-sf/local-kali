import React, { useContext, useEffect, useState } from "react";
import { Dropdown, DropdownItemProps } from "semantic-ui-react";
import { useHistory } from "react-router";
import BroadcastContext from "./BroadcastContext";
import useImportedLists from "../../container/Contact/Imported/useImportedLists";
import { sumListsMembers } from "./ConfirmSend";
import { FieldError } from "../shared/form/FieldError";
import { Trans, useTranslation } from "react-i18next";
import { InfoTooltip } from "../shared/popup/InfoTooltip";
import { NavLink } from "react-router-dom";
import { UserProfileGroupType } from "../../container/Contact/Imported/UserProfileGroupType";
import useRouteConfig from "../../config/useRouteConfig";
import { useAppSelector } from "../../AppRootContext";
import ModalConfirm from "../shared/ModalConfirm";
import errorStyles from "../shared/form/FieldError.module.css";

export default ContactListSelection;

function ContactListSelection(props: { error?: string; disabled?: boolean }) {
  const [maxAutomationUsage, totalMessageSent] = useAppSelector((s) => [
    s.usage.maximumAutomatedMessages,
    s.usage.totalMessagesSentFromSleekflow,
  ]);
  const { disabled, error } = props;
  const { contactLists, broadcastDispatch } = useContext(BroadcastContext);
  const { loading, lists, refresh } = useImportedLists();
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    refresh();
  }, []);
  const options: DropdownItemProps[] = lists.map(
    (contactList: UserProfileGroupType) => ({
      value: contactList.id,
      text: contactList.importName,
    })
  );

  useEffect(() => {
    refresh();
  }, []);

  const totalRecipientsCount = sumListsMembers(
    lists.filter(
      (list: UserProfileGroupType) => contactLists?.includes(list.id) ?? false
    )
  );

  const resetMsgAmount = maxAutomationUsage - totalMessageSent;

  useEffect(() => {
    setShowModal(totalRecipientsCount > resetMsgAmount);
  }, [totalRecipientsCount, resetMsgAmount]);

  return (
    <>
      <label>{t("broadcast.edit.field.lists.label")}</label>
      <label className="secondary">
        {t("broadcast.edit.field.lists.counter", {
          count: totalRecipientsCount,
        })}
      </label>
      <FieldError text={error} position={"above"} />
      <InfoTooltip
        placement={"right"}
        hoverable
        children={
          <Trans i18nKey={"broadcast.tooltip.field.lists"}>
            You can
            <NavLink
              to={{
                pathname: routeTo("/contacts/lists"),
                search: "action=createList",
              }}
              target={"_blank"}
            >
              create a list
            </NavLink>
            on the contact page by applying filters or use automations.
          </Trans>
        }
        trigger={
          <Dropdown
            loading={loading}
            multiple
            search
            selection
            fluid
            upward={false}
            placeholder={t("broadcast.edit.field.lists.placeholder")}
            value={
              contactLists?.filter((id) =>
                lists.some((list) => list.id === id)
              ) ?? []
            }
            className={error ? errorStyles.hasError : ""}
            onChange={(event, data) => {
              broadcastDispatch({
                type: "UPDATE_CONTACT_LISTS",
                contactLists: data.value as number[],
              });
            }}
            options={options}
            disabled={disabled}
          />
        }
      />
      <ModalConfirm
        opened={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={() => {
          history.push(routeTo("/settings/plansubscription"));
        }}
        title={t("broadcast.modal.header")}
        confirmText={t("form.button.upgradeNow")}
        cancelText={t("form.button.cancel")}
      >
        <>
          <Trans
            i18nKey="broadcast.modal.content"
            values={{
              selectedAmount: totalRecipientsCount,
              resetMsgAmount: resetMsgAmount,
            }}
          >
            The number of contacts exceed your campaign message quota <br />
            selectedAmount Recipients / resetMsgAmount Remaining Campaign
            Messages Quota
            <br />
            You can upgrade you plan to send unlimited campaign & automated
            messages.
          </Trans>
        </>
      </ModalConfirm>
    </>
  );
}
