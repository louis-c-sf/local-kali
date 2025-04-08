import React, { useRef, useState } from "react";
import { Image, Progress } from "semantic-ui-react";
import CopyImg from "./assets/copy.svg";
import { copyToClipboard } from "../../utility/copyToClipboard";
import { useTranslation } from "react-i18next";

export function CopyField(props: {
  text: string | undefined;
  label: string;
  long: boolean;
  onCopy?: () => void;
  masked?: boolean;
}) {
  const { label, long, onCopy, text, masked = false } = props;
  const [isCopied, setIsCopied] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const copyText = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (text) {
      copyToClipboard(text);
      if (onCopy) {
        onCopy();
      } else {
        setIsCopied(true);
      }
    }
  };

  const visibleText = masked ? Array(text?.length).fill("*").join("") : text;

  return (
    <>
      <label>
        {label}{" "}
        {isCopied && (
          <span className="text-minor">{t("form.field.copy.copied")}</span>
        )}
      </label>
      <div
        className={`ui input formInput readonly ${long ? "long-input" : ""}`}
      >
        <div className="value" ref={textRef}>
          <div className="value-text">
            {text ? (
              <>{visibleText}</>
            ) : (
              <Progress indicating percent={100} color={"grey"} />
            )}
          </div>
          {text && (
            <div
              className="copy"
              onClick={text ? (e) => copyText(e) : undefined}
            >
              <Image src={CopyImg} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
