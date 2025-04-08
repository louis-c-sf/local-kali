import { Link } from "react-router-dom";
import { Image } from "semantic-ui-react";
import LockIcon from "../../../../assets/images/permission-lock.svg";
import React, { useCallback } from "react";
import { MenuItemType } from "../MenuLeftLoggedIn";
import styles from "./InboxMenuItem.module.css";
import { useAppDispatch } from "../../../../AppRootContext";

export function InboxMenuItem(props: {
  handleLinkClick: (e: React.MouseEvent, value: string) => void;
  item: MenuItemType;
  isLocked: boolean;
  userId: string;
  counter: number;
}) {
  const { handleLinkClick, isLocked, item, userId, counter } = props;
  const loginDispatch = useAppDispatch();
  const resetInboxState = useCallback(
    (e: React.MouseEvent, value: string) => {
      loginDispatch({
        type: "RESET_PROFILE",
      });
      handleLinkClick(e, value);
    },
    [props.handleLinkClick, loginDispatch]
  );
  return (
    <BaseMenuItem
      handleLinkClick={resetInboxState}
      isLocked={isLocked}
      item={item}
      path={`/${userId}`}
      search={`selectedStatus=open&selectedChannel=all`}
      extras={counter > 0 ? <span className="update-marker" /> : undefined}
    />
  );
}

export function BaseMenuItem(props: {
  handleLinkClick: (e: React.MouseEvent, value: string) => void;
  item: MenuItemType;
  isLocked: boolean;
  isBeta?: boolean;
  extras?: React.ReactNode;
  path?: string;
  search?: string;
}) {
  const { handleLinkClick, isLocked, item, extras, path, search } = props;

  return (
    <Link
      onClick={(e) => handleLinkClick(e as React.MouseEvent, item.name)}
      to={{
        pathname: path ?? item.path,
        search: search ?? "",
      }}
    >
      <div>
        <span>{item.title}</span>
        {extras}
        {isLocked && <Image src={LockIcon} className="" />}
        {props.isBeta && <div className={styles.beta}>BETA</div>}
      </div>
    </Link>
  );
}
