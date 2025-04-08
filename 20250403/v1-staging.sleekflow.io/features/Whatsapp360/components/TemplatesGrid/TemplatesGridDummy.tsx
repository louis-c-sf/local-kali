import React from "react";
import styles from "./TemplatesGrid.module.css";
import cardStyles from "./TemplateCard.module.css";
import { Placeholder } from "semantic-ui-react";

export function TemplatesGridDummy(props: { number: number }) {
  return (
    <div className={styles.strip}>
      {Array.from(Array(props.number).keys()).map((n) => (
        <div className={`${cardStyles.card} ${cardStyles.dummy}`} key={n}>
          <div className={cardStyles.header}>
            <Placeholder.Header>
              <Placeholder.Line />
            </Placeholder.Header>
          </div>
          <div className={cardStyles.body}>
            <Placeholder>
              <Placeholder.Paragraph>
                <Placeholder.Line length={"long"} />
                <Placeholder.Line length={"medium"} />
                <Placeholder.Line length={"long"} />
              </Placeholder.Paragraph>
            </Placeholder>
          </div>
          <div className={cardStyles.buttons}></div>
        </div>
      ))}
    </div>
  );
}
