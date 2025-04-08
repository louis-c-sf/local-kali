import React from "react";
import { Image } from "semantic-ui-react";
import Up from "assets/images/ui/sort-up.svg";
import Down from "assets/images/ui/sort-down.svg";
import styles from "./SortControl.module.css";

const SortControl: React.FC<{
  index: number;
  onSort: (from: number, to: number) => void;
  totalItems: number;
}> = ({ index, onSort, totalItems }) => {
  const canSortUp = index > 0;
  const canSortDown = index < totalItems - 1;

  const sortUp = () => {
    if (canSortUp) {
      onSort(index, index - 1);
    }
  };

  const sortDown = () => {
    if (canSortDown) {
      onSort(index, index + 1);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div
        onClick={sortUp}
        className={`${styles.control} ${!canSortUp ? styles.disabled : ""}`}
      >
        <Image src={Up} alt="sort-up" />
      </div>
      <div
        onClick={sortDown}
        className={`${styles.control} ${!canSortDown ? styles.disabled : ""}`}
      >
        <Image src={Down} alt="sort-down" />
      </div>
    </div>
  );
};

export default SortControl;
