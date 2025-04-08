import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown, Loader } from "semantic-ui-react";
import { FieldError } from "../../../../../component/shared/form/FieldError";
import styles from "./AddTopicDropdown.module.css";
import produce from "immer";
import {
  SelectedTopicType,
  TopicResponseType,
} from "../../../models/FacebookOTNTypes";
import { fetchFacebookOTNTopics } from "../../../API/fetchFacebookOTNTopics";
import { FormikErrors } from "formik";

const AddTopicDropdown = (props: {
  pageId: string | undefined;
  setSelectedTopic: (topic: SelectedTopicType) => any;
  selectedTopic: SelectedTopicType;
  error:
    | string
    | string[]
    | never[]
    | undefined
    | FormikErrors<SelectedTopicType>;
}) => {
  const { pageId = "", setSelectedTopic, selectedTopic, error } = props;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<TopicResponseType[]>([]);
  const getTopics = useCallback(async () => {
    try {
      setLoading(true);
      const result: TopicResponseType[] = await fetchFacebookOTNTopics(pageId);
      const newItems = result.filter((topic) => topic.topicStatus === "Active");
      setItems(newItems);
    } catch (e) {
      console.error("getTopics e: ", e);
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    if (pageId) {
      getTopics();
    }
  }, [getTopics, pageId]);

  return (
    <div className={`ui form ${styles.addTopicDropdown}`}>
      {loading ? (
        <Loader />
      ) : (
        <div className="field">
          <Dropdown
            id="addItem"
            selection
            search
            selectOnBlur={false}
            options={items.map((item, k) => {
              return {
                value: item.topic,
                text: item.topic,
                key: k,
                content: item.topic,
              };
            })}
            onChange={(event, { value }) => {
              const found: TopicResponseType[] = items.filter(
                (item) => item.topic === value
              );
              setSelectedTopic({
                name: found.length > 0 ? found[0].topic : "",
                id: found.length > 0 ? (found[0].id as string) : "",
              });
            }}
            icon={"search"}
            className={"icon-left"}
            placeholder={t("form.addTopic.placeholder")}
            upward={false}
            allowAdditions
            additionLabel={t("form.addTopic.addAddition")}
            noResultsMessage={t("form.field.dropdown.noResults")}
            value={selectedTopic.name}
            onAddItem={(event, { value }) => {
              const newTopic: TopicResponseType = {
                pageId,
                topic: value as string,
                topicStatus: "Active",
              };
              setItems(
                produce(items, (draft) => {
                  draft.push(newTopic);
                })
              );
              setSelectedTopic({
                id: null,
                name: value as string,
              });
            }}
          />
          <FieldError text={error} className={styles.error} />
        </div>
      )}
    </div>
  );
};
export default AddTopicDropdown;
