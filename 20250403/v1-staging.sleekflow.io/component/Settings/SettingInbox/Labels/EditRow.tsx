import React, { useState } from "react";
import styles from "./EditRow.module.css";
import iconStyles from "../../../shared/Icon/Icon.module.css";
import { ChatLabel } from "../../../Chat/ChatLabel";
import { HashTagType } from "../../../../types/ConversationType";
import { Table } from "semantic-ui-react";

export function EditRow(props: {
  onEditTag: (node: HTMLElement) => void;
  onDeleteTag: (tag: HashTagType) => void;
  tag: HashTagType;
}) {
  const [rowNode, setRowNode] = useState<HTMLElement | null>(null);
  return (
    <Table.Row>
      <Table.Cell className={styles.labelCell}>
        <div className={styles.label}>
          <ChatLabel tag={props.tag} />
        </div>
      </Table.Cell>
      <Table.Cell className={styles.actionsCell}>
        <div className={styles.actions}>
          <div
            className={styles.action}
            onClick={rowNode ? () => props.onEditTag(rowNode) : undefined}
            ref={setRowNode}
          >
            <div className={`${styles.editIcon} ${iconStyles.icon}`} />
          </div>
          <div
            className={styles.action}
            onClick={() => props.onDeleteTag(props.tag)}
          >
            <div className={`${styles.deleteIcon} ${iconStyles.icon}`} />
          </div>
        </div>
      </Table.Cell>
    </Table.Row>
  );
}
