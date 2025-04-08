import React from "react";
import { Image } from "semantic-ui-react";
export interface WarningContentType {
  content: JSX.Element;
  title: string;
  className?: string;
  img?: string;
}

export default function ReminderGuide(props: {
  header: string;
  warningContent: WarningContentType[];
  button: JSX.Element;
  link: JSX.Element;
  agreement?: JSX.Element;
  className?: string;
  extraTag?: JSX.Element;
}) {
  const { header, warningContent, button, link, className } = props;
  return (
    <div className={`whatsapp-container ${className}`}>
      <div className="header">{header}</div>
      <div className="content">
        {warningContent.map((content) => (
          <div className={`column ${content.className}`}>
            {props.extraTag}
            {content.img && (
              <div className="image-container animate__animated animate__faster animate__fadeIn">
                <Image src={content.img} />
              </div>
            )}
            <div className="title animate__animated animate__fast animate__fadeIn">
              {content.title}
            </div>
            <div className="content animate__animated animate__fast animate__fadeIn">
              {content.content}
            </div>
          </div>
        ))}
      </div>
      <div className="action">
        {props.agreement}
        {button}
        {link}
      </div>
    </div>
  );
}
