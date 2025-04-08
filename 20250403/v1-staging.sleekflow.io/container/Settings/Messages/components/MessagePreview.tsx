import styles from "./MessagePreview.module.css";
import DummyProductPreview from "./DummyProductPreview";
import React from "react";
import Linkify from "linkify-react";

export function MessagePreview(props: {
  showImage: boolean;
  messageBody: string;
}) {
  const componentDecorator = (href: string, text: string, key: number) => (
    <span className={styles.link} key={key}>
      {text}
    </span>
  );

  return (
    <div className={styles.content}>
      <div className={styles.messageContent}>
        {props.showImage && <DummyProductPreview />}
        {props.messageBody.split("\n").map((message) => {
          if (!message) {
            return <br />;
          }
          return (
            <div className={styles.paragraph}>
              <Linkify componentDecorator={componentDecorator}>
                {message}
              </Linkify>
            </div>
          );
        })}
      </div>
    </div>
  );
}
