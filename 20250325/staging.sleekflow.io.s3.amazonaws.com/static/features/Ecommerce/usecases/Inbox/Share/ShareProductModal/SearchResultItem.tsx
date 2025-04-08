import React from "react";
import styles from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal.module.css";

export default function SearchResultItem(props: {
  currentIndex: number;
  value: RegExpMatchArray;
  title: string;
  nextIndex?: number;
}) {
  const { currentIndex, value, title, nextIndex } = props;
  if (value.index !== undefined) {
    return (
      <div className={styles.searchResult}>
        {currentIndex === 0 && <span>{title.substring(0, value.index)}</span>}
        <span className={styles.matched}>{value}</span>
        <span>
          {title.substring(
            value.index + value[0].length,
            nextIndex ?? title.length
          )}
        </span>
      </div>
    );
  }
  return <>{title}</>;
}
