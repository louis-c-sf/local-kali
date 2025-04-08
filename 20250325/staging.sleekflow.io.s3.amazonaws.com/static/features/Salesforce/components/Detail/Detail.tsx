import React, { ReactNode, useState } from "react";
import styles from "./Detail.module.css";
import { Modal } from "semantic-ui-react";
import { CloseIcon } from "component/shared/modal/CloseIcon";
import { Header } from "./Header";
import { Body } from "./Body";
import { LeadNormalizedType } from "../../API/Leads/fetchLeads";
import { FieldIterator } from "../../API/Objects/FieldReader/FieldIterator";
import { CreateListNameModal } from "./CreateListNameModal";

export function Detail(props: {
  close: () => void;
  data: LeadNormalizedType;
  fieldIterator: FieldIterator;
  statusText: ReactNode;
  name: string;
  headerButtons?: ReactNode;
  renderFieldCustom?: (fieldName: string) => ReactNode;
  hasAddToContactListButton?: boolean;
}) {
  const {
    close,
    data,
    fieldIterator,
    hasAddToContactListButton = false,
  } = props;
  const [openCreateListNameModule, setOpenCreateListNameModule] =
    useState(false);

  return (
    <Modal open className={styles.modal} onClose={close}>
      <CloseIcon onClick={close} />
      <Modal.Content>
        <div className={styles.contents}>
          <div className={styles.header}>
            <Header
              data={data}
              statusText={props.statusText}
              name={props.name}
              buttons={props.headerButtons}
              openCreateListNameModule={() => setOpenCreateListNameModule(true)}
              hasAddToContactListButton={hasAddToContactListButton}
            />
          </div>
          <div className={styles.body}>
            <Body
              data={data}
              fieldIterator={fieldIterator}
              renderCustom={props.renderFieldCustom}
            />
          </div>
        </div>
      </Modal.Content>
      {openCreateListNameModule && (
        <CreateListNameModal
          data={data}
          mainModalClose={close}
          subModalClose={() => setOpenCreateListNameModule(false)}
        />
      )}
    </Modal>
  );
}
