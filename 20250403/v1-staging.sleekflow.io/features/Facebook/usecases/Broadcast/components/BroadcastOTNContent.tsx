import React, { useCallback, useContext, useEffect, useState } from "react";
import StatusAlert from "component/shared/StatusAlert";
import ArrowRightIcon from "../../../../../assets/images/icons/arrow-right-action.svg";
import { Dropdown, DropdownProps, Image, Loader } from "semantic-ui-react";
import styles from "./FacebookOTNBroadcastTypeSelection.module.css";
import { useTranslation } from "react-i18next";
import { fetchFacebookOTNTopics } from "../../../API/fetchFacebookOTNTopics";
import BroadcastContext from "../../../../../component/Broadcast/BroadcastContext";
import { TopicResponseType } from "../../../models/FacebookOTNTypes";
import { fetchFacebookAvailableRecipients } from "../../../API/fetchFacebookAvailableRecipients";
import TickIcon from "assets/tsx/icons/TickIcon";
import WarningIcon from "../../../../../assets/images/icons/warning.svg";
import { FieldError } from "../../../../../component/shared/form/FieldError";

type OptionType = {
  key: string;
  value: string;
  text: string;
};

type AvailableRecipientsType = {
  otnAvailableRecipients: number;
  totalRecipients: number;
};
const BroadcastOTNContent = (props: {
  onClick: () => void;
  setOption: (value: string) => void;
  setRecipient: (value: number) => void;
  selectedRecipient: number;
  selectedOption: string;
  errorMessage: string;
  disabled: boolean;
}) => {
  const { t } = useTranslation();
  const {
    setOption,
    setRecipient,
    selectedOption,
    selectedRecipient,
    onClick,
    errorMessage,
    disabled,
  } = props;
  const [topics, setTopics] = useState<OptionType[]>([]);
  const { channelsWithIds } = useContext(BroadcastContext);
  const [recipientsLoader, setRecipientsLoader] = useState(true);
  const [topicsLoader, setTopicsLoader] = useState(true);

  const getTopics = useCallback(async () => {
    if (channelsWithIds.length === 0) {
      return;
    }
    try {
      setTopicsLoader(true);
      const ids = channelsWithIds.find(
        (chl) => chl.channel === "facebook"
      )?.ids;
      if (!ids) return;
      const results = await Promise.all(
        ids.map((pageId) => fetchFacebookOTNTopics(pageId))
      );
      const activeTopics: TopicResponseType[] = results.reduce((acc, curr) => {
        const valid = curr.filter(
          (topic: TopicResponseType) => topic.topicStatus === "Active"
        );
        return [...acc, ...valid];
      }, []);

      const newItems: OptionType[] = activeTopics.map((item) => ({
        key: item.id ?? "",
        value: item.id ?? "",
        text: item.topic,
      }));
      setTopics(newItems);
    } catch (e) {
      console.error("getTopics e: ", e);
    } finally {
      setTopicsLoader(false);
    }
  }, [channelsWithIds]);

  const getTopicRecipients = useCallback(async () => {
    if (!selectedOption) {
      return;
    }
    try {
      setRecipientsLoader(true);
      const result: AvailableRecipientsType =
        await fetchFacebookAvailableRecipients(selectedOption);
      setRecipient(result.otnAvailableRecipients);
    } catch (e) {
      console.error("getTopicRecipients e: ", e);
    } finally {
      setRecipientsLoader(false);
    }
  }, [selectedOption, setRecipient]);

  useEffect(() => {
    getTopics();
  }, [getTopics]);

  useEffect(() => {
    getTopicRecipients();
  }, []);

  return (
    <div className={styles.facebookOTNContainer}>
      <StatusAlert type="info" className={styles.info}>
        <>
          <div className={styles.activated}>
            {t("broadcast.broadcastTypeSelection.facebookOTN.info.activated")}
          </div>
          <div className={styles.recipientsAccept}>
            {t(
              "broadcast.broadcastTypeSelection.facebookOTN.info.recipientsAccept"
            )}
          </div>
          <div className={styles.learnMore} onClick={onClick}>
            {t("broadcast.broadcastTypeSelection.facebookOTN.info.learnMore")}
            <Image src={ArrowRightIcon} size="mini" />
          </div>
        </>
      </StatusAlert>
      <div className={styles.dropdownContainer}>
        <label htmlFor="otn">
          {t("broadcast.broadcastTypeSelection.facebookOTN.dropdown.label")}
        </label>
        <FieldError text={errorMessage} />
        <Dropdown
          id="otn"
          onChange={(_, data: DropdownProps) => {
            setOption(data.value as string);
          }}
          value={selectedOption as string}
          options={topics}
          placeholder={t(
            "broadcast.broadcastTypeSelection.facebookOTN.dropdown.placeholder"
          )}
          selection
          search
          selectOnBlur={false}
          loading={topicsLoader}
          noResultsMessage={t(
            "broadcast.broadcastTypeSelection.facebookOTN.dropdown.noResult"
          )}
          disabled={disabled}
        />
        <div
          className={`${selectedOption ? styles.recipientsTokenStatus : ""}`}
        >
          {recipientsLoader ? (
            <Loader />
          ) : (
            selectedOption &&
            (selectedRecipient > 0 ? (
              <>
                <TickIcon className={styles.successIcon} />
                <span className={styles.success}>
                  {t(
                    "broadcast.broadcastTypeSelection.facebookOTN.dropdown.status.success",
                    {
                      number: selectedRecipient,
                    }
                  )}
                </span>
              </>
            ) : (
              <>
                <Image src={WarningIcon} size="mini" />
                <span className={styles.failed}>
                  {t(
                    "broadcast.broadcastTypeSelection.facebookOTN.dropdown.status.failed"
                  )}
                </span>
              </>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default BroadcastOTNContent;
