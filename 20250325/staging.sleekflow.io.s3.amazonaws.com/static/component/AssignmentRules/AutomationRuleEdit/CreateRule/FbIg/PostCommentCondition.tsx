import React from "react";
import { useTranslation } from "react-i18next";
import produce from "immer";
import { AutomationFormType } from "../../../../../types/AutomationActionType";
import { FbPostComment, PostCommentAutomationType } from "./PostCommentTypes";
import PagesDropdown from "./PagesDropdown";
import PostList from "./PostList";
import { Keywords } from "./Keywords";
import styles from "./PostCommentCondition.module.css";

const PostCommentCondition = (props: {
  form: AutomationFormType;
  automationType: PostCommentAutomationType;
}) => {
  const { t } = useTranslation();
  const { form, automationType } = props;

  return (
    <div className="ui form section-panel">
      <div className="field edit-field section-content-item section-conditions">
        <label>{t("automation.rule.field.conditions.postComment.label")}</label>
        <div className="field-note">
          {automationType.includes(FbPostComment)
            ? t("automation.rule.field.conditions.postComment.hint.facebook")
            : t("automation.rule.field.conditions.postComment.hint.instagram")}
        </div>
        <PagesDropdown
          automationType={automationType}
          setSelectedPageId={(id) =>
            form.setFieldValue(
              "postCommentConditionFields",
              produce(form.values.postCommentConditionFields, (draft) => {
                if (draft) {
                  draft.pageId = id;
                }
              })
            )
          }
          selectedPageId={form.values.postCommentConditionFields?.pageId ?? ""}
        />
        <PostList
          automationType={automationType}
          selectedPageId={form.values.postCommentConditionFields?.pageId ?? ""}
          selectedPostId={form.values.postCommentConditionFields?.postId ?? ""}
          form={form}
        />
        <div className={styles.hr} />
        <Keywords
          keywords={form.values.postCommentConditionFields?.keywords ?? []}
          setKeywords={(keywords) =>
            form.setFieldValue(
              "postCommentConditionFields",
              produce(form.values.postCommentConditionFields, (draft) => {
                if (draft) {
                  draft.keywords = keywords;
                }
              })
            )
          }
        />
      </div>
    </div>
  );
};
export default PostCommentCondition;
