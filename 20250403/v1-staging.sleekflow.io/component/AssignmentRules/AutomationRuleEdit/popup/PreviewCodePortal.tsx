import React, { useEffect, useState } from "react";
import { Portal } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { usePopperPopup } from "../../../shared/popup/usePopperPopup";
import styles from "./PreviewCodePortal.module.css";
import CloseIcon from "../../../../assets/tsx/icons/CloseIcon";

const PreviewCodePortal = (props: {
  children: React.ReactNode;
  visible: boolean;
  previewCode: string;
  handleClose: () => void;
}) => {
  const { visible, previewCode, handleClose } = props;
  const [openPopup, setOpenPopup] = useState(false);
  const [triggerNode, setTriggerNode] = useState<HTMLElement | null>(null);
  const [popupNode, setPopupNode] = useState<HTMLElement | null>(null);
  const { t } = useTranslation();

  usePopperPopup(
    {
      popupRef: popupNode,
      anchorRef: triggerNode,
      placement: "bottom",
      offset: [0, 7],
      onClose: () => {
        setOpenPopup(false);
      },
      closeOnOutsideClick: false,
    },
    [openPopup, visible]
  );

  useEffect(() => {
    setOpenPopup(visible);
  }, [visible]);

  return (
    <div>
      <div className="buttonContainer" ref={setTriggerNode}>
        {props.children}
      </div>
      {visible && openPopup && (
        <Portal mountNode={document.body} open>
          <div
            className={`app ui basic popup dialog visible mini ${styles.portal}`}
            ref={setPopupNode}
          >
            <div className="ui static">
              <div className={styles.header}>
                <span className={styles.title}>
                  {t("automation.rule.popup.previewCode.title")}
                </span>
                <CloseIcon className={styles.closeIcon} onClick={handleClose} />
              </div>
              <p className={styles.content}>
                {t("automation.rule.popup.previewCode.content")}
              </p>
              <div className={styles.codeContainer}>
                <span>{previewCode}</span>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};
export default PreviewCodePortal;
