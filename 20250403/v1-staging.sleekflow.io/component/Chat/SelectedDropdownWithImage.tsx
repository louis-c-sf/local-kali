import React, { ReactNode } from "react";
import { Image } from "semantic-ui-react";
import headerStyles from "./ChatHeader/HeaderDropdown.module.css";
import { htmlEscape } from "../../lib/utility/htmlEscape";

const SelectedDropdownWithImage = (props: {
  image?: string;
  imageNode?: ReactNode;
  text: string;
  count?: number;
  adaptive: boolean;
  hideText?: boolean;
}) => {
  const { image, imageNode, text, count, hideText } = props;

  return (
    <div
      className={`selected-dropdown ${image ? "" : "text-item"} 
        ${props.adaptive ? headerStyles.shrinkOnTablet : ""}
        ${hideText ? headerStyles.noText : ""}
        `}
      title={htmlEscape(text)}
    >
      {image && <Image src={image} size={"tiny"} />}
      {imageNode}
      <span className={`display-text ${headerStyles.text}`}>
        {hideText ? "" : text}
        {count ? <span className={"number-badge"}>{count}</span> : null}
      </span>
    </div>
  );
};

export default SelectedDropdownWithImage;
