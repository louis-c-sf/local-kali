import React, { ReactNode } from "react";
import { Button } from "../shared/Button/Button";
import { TFunction } from "i18next";
import { Dispatch } from "redux";
import { Action } from "../../types/LoginType";
import styles from "./ProfileDetails.module.css";

export function ProfileDetailView(props: {
  name: string;
  value: ReactNode;
  t: TFunction;
  isEditButtonEnabled: boolean;
  loginDispatch: Dispatch<Action>;
}) {
  const { isEditButtonEnabled, loginDispatch, name, t, value } = props;

  const openEditForm = (name: string) => () =>
    loginDispatch({ type: "INBOX.CONTACT_FORM.SHOW", field: name });
  return (
    <div className={styles.detail}>
      <span className={styles.name}>{name}</span>
      <span className={styles.value}>{value}</span>
      {isEditButtonEnabled && (
        <Button customSize={"sm"} onClick={openEditForm(name)}>
          {t("form.button.edit")}
        </Button>
      )}
    </div>
  );
}
