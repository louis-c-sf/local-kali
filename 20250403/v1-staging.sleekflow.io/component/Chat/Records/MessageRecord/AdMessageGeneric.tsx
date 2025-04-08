import React from "react";
import styles from "./AdMessageGeneric.module.css";
import { useTranslation } from "react-i18next";
import { Button } from "component/shared/Button/Button";
import Linkify from "linkify-react";

export function AdMessageGeneric(props: {
  title: string;
  body: string | null;
  sourceId: string;
  url: string;
}): JSX.Element | null {
  const { t } = useTranslation();

  const componentDecorator = (href: string, text: string, key: number) => (
    <a
      className={styles.link}
      href={href}
      key={key}
      target="_blank"
      rel={"noopener noreferrer"}
    >
      {text}
    </a>
  );
  return (
    <div className={styles.root}>
      <div className={styles.title}>{props.title}</div>
      {props.body && (
        <div className={styles.body}>
          <Linkify componentDecorator={componentDecorator}>
            {props.body}
          </Linkify>
        </div>
      )}
      <div className={styles.id}>
        {t("chat.message.ad.sourceId", { id: props.sourceId })}
      </div>
      <div className={styles.actions}>
        <Button
          content={t("chat.message.ad.seeDetail")}
          as={"a"}
          href={props.url}
          target={"_blank"}
        />
      </div>
    </div>
  );
}
