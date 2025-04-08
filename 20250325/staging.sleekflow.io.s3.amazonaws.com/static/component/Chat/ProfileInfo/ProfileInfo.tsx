import React from "react";
import ProfileInfoDetail from "../ProfileInfoDetail";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../AppRootContext";
import styles from "./ProfileInfo.module.css";
import iconStyles from "../../shared/Icon/Icon.module.css";
import { equals } from "ramda";

interface ProfileInfoProps {
  conversationId?: string;
  setFieldValue: Function;
}

const ProfileInfo = (props: ProfileInfoProps) => {
  const { setFieldValue } = props;
  const searchActive = useAppSelector((s) => s.inbox.messageSearch.active);
  const profile = useAppSelector((s) => s.profile, equals);
  const { t } = useTranslation();

  return (
    <div className={`${styles.widget} ${searchActive ? styles.muted : ""}`}>
      <div className={styles.header}>
        <i className={`${styles.icon} ${iconStyles.icon}`} />
        <div className={styles.text}>{t("chat.widget.profileInfo.header")}</div>
      </div>

      <ProfileInfoDetail profile={profile} setFieldValue={setFieldValue} />
    </div>
  );
};
export default ProfileInfo;
