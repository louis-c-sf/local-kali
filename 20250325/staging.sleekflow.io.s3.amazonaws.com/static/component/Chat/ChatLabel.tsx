import { Icon, Label } from "semantic-ui-react";
import React from "react";
import { HashTagType } from "../../types/ConversationType";
import styles from "./ChatLabel.module.css";
import ShopifyImg from "../../assets/images/onboarding/shopify.png";
import { htmlEscape } from "../../lib/utility/htmlEscape";

export function ChatLabel(props: {
  tag: HashTagType;
  collapsible?: boolean;
  onClick?: () => void;
  onDismiss?: (...args: any[]) => void;
  className?: string;
  size?: "big" | "normal";
  children?: React.ReactElement;
}) {
  const {
    onClick,
    tag,
    onDismiss,
    collapsible,
    className = "",
    size = "normal",
  } = props;

  const { hashTagType } = tag;

  if (hashTagType === "Shopify") {
    return (
      <div
        className={`
          ui label
          hashtag 
          ${collapsible ? "collapsible" : ""}
          ${onClick ? "clickable" : ""}
          ${className}
          shopify
         `}
      >
        <img src={ShopifyImg} alt="shopify" />
        <span className={`tag-text`} title={htmlEscape(tag.hashtag)}>
          {tag.hashtag}
        </span>
        {onDismiss && <Icon name={"close"} onClick={onDismiss} />}
      </div>
    );
  }

  return (
    <div
      className={`
      ui label
      hashtag 
      color-${tag.hashTagColor.toLowerCase()}
      ${collapsible ? "collapsible" : ""}
      ${onClick ? "clickable" : ""}
      ${className}
      ${size === "big" ? styles.big : ""}
      
     `}
    >
      {props.children}
      <span
        className={`tag-text`}
        title={htmlEscape(tag.hashtag)}
        onClick={onClick}
      >
        {tag.hashtag}
      </span>
      {onDismiss && <Icon name={"close"} onClick={onDismiss} />}
    </div>
  );
}
