import React from "react";
import styles from "./MessageTypeModal.module.css";
import { OptionType } from "../../../../models/FacebookOTNTypes";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import { MessageTypeSelectedType } from "features/Facebook/models/facebookReducer";

export const Selection = (props: {
  subTitle: string;
  options: OptionType[];
  setDetail: (detail: { isFacebookOTN: boolean; option: OptionType }) => void;
}) => {
  const { subTitle, options, setDetail } = props;
  const { value: selected } = useAppSelector(
    (s) => s.inbox.facebook.messageType
  );
  const dispatch = useAppDispatch();

  return (
    <>
      <div className={styles.subTitle}>{subTitle}</div>
      <ul>
        {options.map((option, index) => {
          const isActive = selected === option.value;
          const selectedType: MessageTypeSelectedType = option.hasOwnProperty(
            "number"
          )
            ? "facebookOTN"
            : "messageTag";
          return (
            <li
              onClick={() =>
                dispatch({
                  type: "INBOX.FACEBOOK.MESSAGE_TYPE.UPDATE",
                  selectedType,
                  value: option.value,
                  selectedOption: option,
                })
              }
              onMouseEnter={() => {
                setDetail({
                  isFacebookOTN: option.hasOwnProperty("number"),
                  option,
                });
              }}
              key={option.value + index}
              className={`${option.number ? "hasNumber" : ""} ${
                isActive ? "active" : ""
              }`}
            >
              {option.name}
              {option.number && (
                <span className={styles.tokenNumber}>{option.number}</span>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
};
