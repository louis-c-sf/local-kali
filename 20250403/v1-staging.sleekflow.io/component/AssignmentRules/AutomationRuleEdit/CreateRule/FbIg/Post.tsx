import React from "react";
import { CheckboxProps, Image, Radio } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { toUserUtcDate } from "../../fields/helpers";
import moment from "moment";
import { useCurrentUtcOffset } from "../../../../Chat/hooks/useCurrentUtcOffset";
import { ContentType, MediaType, SinglePostType } from "./PostCommentTypes";
import styles from "./PostList.module.css";

export const Post = (props: {
  post: SinglePostType;
  selectedPostId: string;
  setSelectedPostId: (e: React.FormEvent, data: CheckboxProps) => void;
}) => {
  const { post, selectedPostId, setSelectedPostId } = props;
  const { t } = useTranslation();
  const utcOffset = useCurrentUtcOffset();

  const isMediaUrlInMediaType = (x: any): x is MediaType => {
    return x.mediaUrl !== undefined;
  };
  const isContentInContentType = (x: any): x is ContentType => {
    return x.content !== undefined;
  };
  const createdAt = toUserUtcDate(
    moment(post.createdAt).toDate(),
    utcOffset
  ).format("DD MMM HH:mm");

  return (
    <div className={styles.post}>
      <div className={styles.imageWrapper}>
        <Radio
          checked={post.id === selectedPostId}
          onChange={setSelectedPostId}
          value={post.id}
        />
        {isMediaUrlInMediaType(post) ? (
          post.mediaUrl.includes("video") ? (
            <video controls preload={"video"} src={post.mediaUrl} />
          ) : (
            <Image className={styles.imageBox} src={post.mediaUrl} />
          )
        ) : (
          <div className={styles.imageBox}>
            {t("automation.rule.field.conditions.postComment.post.noImg")}
          </div>
        )}
      </div>
      <div className={styles.content}>
        {isContentInContentType(post) ? post.content : ""}
      </div>
      <div className={styles.timestamp}>{createdAt}</div>
    </div>
  );
};
