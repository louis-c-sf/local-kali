import React from "react";
import { useTranslation } from "react-i18next";
import { Image } from "semantic-ui-react";
import styles from "./LearnFacebookOTNContent.module.css";
import PreviewImg from "../../../../../assets/images/inbox-facebook/otn-request-preview.png";
import { Button } from "component/shared/Button/Button";

const LearnFacebookOTNContent = (props: {
  handleOnClick?: () => void;
  hasButton?: boolean;
}) => {
  const { handleOnClick = () => {}, hasButton = true } = props;
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.title}>
        {t("chat.facebookOTN.modal.learnFeature.title")}
      </div>
      <div className={styles.description}>
        {t("chat.facebookOTN.modal.learnFeature.description")}
      </div>
      <div className={styles.stepContainer}>
        <div className={styles.subTitle}>
          {t("chat.facebookOTN.modal.learnFeature.subTitle")}
        </div>
        <div className={styles.request}>
          {t("chat.facebookOTN.modal.learnFeature.steps.request")}
        </div>
        <div className={styles.preview}>
          <Image src={PreviewImg} alt={"preview"} />
        </div>
        <div className={styles.ready}>
          {t("chat.facebookOTN.modal.learnFeature.steps.ready")}
        </div>
        {hasButton && (
          <Button
            customSize={"mid"}
            primary
            className={styles.readyButton}
            onClick={() => handleOnClick()}
          >
            {t("chat.facebookOTN.modal.learnFeature.button")}
          </Button>
        )}
      </div>
    </>
  );
};
export default LearnFacebookOTNContent;
