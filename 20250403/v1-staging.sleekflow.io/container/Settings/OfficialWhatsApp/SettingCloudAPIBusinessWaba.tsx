import React from "react";
import styles from "./SettingCloudAPIBusinessWaba.module.css";
import WarningCircle from "../../../assets/images/icons/warning_circle.svg";
import { Image } from "semantic-ui-react";

function SettingCloudAPIBusinessWaba(props: {
  wabaId: string;
  wabaName: string;
  isLowerAmount: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const { wabaId, wabaName, isSelected, onSelect, isLowerAmount } = props;
  return (
    <div
      onClick={() => onSelect(wabaId)}
      className={`${styles.wabaName} ${isSelected ? styles.selected : ""}`}
    >
      <div className={styles.name}>{wabaName}</div>
      {isLowerAmount && <Image src={WarningCircle} />}
    </div>
  );
}
export default SettingCloudAPIBusinessWaba;
