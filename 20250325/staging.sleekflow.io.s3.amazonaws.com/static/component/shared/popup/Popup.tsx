import React, { ReactNode } from "react";
import styles from "./Popup.module.css";
import { Popup as SemanticPopup } from "semantic-ui-react";
import { PopupProps } from "semantic-ui-react/dist/commonjs/modules/Popup/Popup";

type PopupParams = {
  bottomControls?: ReactNode;
};

export function Popup(props: PopupParams & PopupProps) {
  const { className, children, bottomControls, ...restProps } = props;
  const classNames = [className ?? "", styles.popup];

  return (
    <SemanticPopup className={classNames.join(" ")} {...restProps}>
      {children}
      {bottomControls && (
        <div className={styles.controls}>{bottomControls}</div>
      )}
    </SemanticPopup>
  );
}
