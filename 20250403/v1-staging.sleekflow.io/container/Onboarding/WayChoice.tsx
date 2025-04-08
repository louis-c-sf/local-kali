import React from "react";
import styles from "./WayChoice.module.css";
import { Button } from "../../component/shared/Button/Button";
import { useTranslation } from "react-i18next";
import { TickedList } from "../../component/shared/content/TickedList";

export function WayChoice<I extends string>(props: {
  ways: Readonly<
    Array<{
      id: I;
      title: string;
      options?: string[];
      text?: string;
    }>
  >;
  selectedId: I;
  onSelect: (id: I) => void;
  nextAction: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.root}>
      <div className={styles.ways}>
        {props.ways.map((way) => (
          <div
            className={`
                ${styles.way} 
                ${way.id === props.selectedId ? styles.selected : ""}
              `}
            onClick={() => props.onSelect(way.id)}
            key={way.id}
          >
            <div className={styles.header}>{way.title}</div>
            {way.options && <TickedList items={way.options} />}
            {way.text && <div className={styles.text}>{way.text}</div>}
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        <Button
          onClick={props.nextAction}
          primary
          fluid
          content={t("form.button.next")}
          centerText
          customSize={"mid"}
        />
      </div>
    </div>
  );
}
