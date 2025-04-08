import React from "react";
import useRouteConfig from "../../../config/useRouteConfig";
import { ContactListType } from "../../../types/ContactType";
import styles from "./ContactListRow.module.css";
import { htmlEscape } from "../../../lib/utility/htmlEscape";
import { Icon } from "../../shared/Icon/Icon";

const ContactListRow = (props: {
  list: ContactListType;
  onRemove?: () => void;
  disabled?: boolean;
}) => {
  const { routeTo } = useRouteConfig();
  const { list } = props;

  return (
    <div className={`${styles.tagsContainer} ui button button-small`}>
      <a
        rel="noreferrer noopener"
        target="_blank"
        href={routeTo(`/contacts/lists/${list.id}`, true)}
      >
        <span className={`tag-text`} title={htmlEscape(list.listName)}>
          {list.listName}
        </span>
      </a>
      {props.onRemove && (
        <span
          className={`${styles.delete} ${
            props.disabled ? styles.disabled : ""
          }`}
          onClick={props.disabled ? undefined : props.onRemove}
        >
          <Icon type={"close"} />
        </span>
      )}
    </div>
  );
};
export default ContactListRow;
