import React, { useCallback, useEffect, useRef, useState } from "react";
import { CheckboxProps, Dropdown, Loader } from "semantic-ui-react";
import { Trans, useTranslation } from "react-i18next";
import { FormikHelpers, FormikState } from "formik";
import {
  AssignmentRuleFormType,
  AssignmentRuleType,
  AutomationTypeEnum,
} from "../../../../../types/AssignmentRuleType";
import produce from "immer";
import ScrollLoader from "../../../../shared/ScrollLoader";
import {
  FbPostComment,
  PostsOffsetLimit,
  PostTypeEnum,
  PostTypeType,
  SinglePostType,
} from "./PostCommentTypes";
import { GET_FB_POSTS, GET_IG_POSTS } from "../../../../../api/apiPath";
import { getWithExceptions } from "../../../../../api/apiRequest";
import styles from "./PostList.module.css";
import { Post } from "./Post";

const PostList = (props: {
  automationType: AutomationTypeEnum;
  selectedPageId: string;
  selectedPostId: string;
  form: FormikState<AssignmentRuleFormType> & FormikHelpers<AssignmentRuleType>;
}) => {
  const { automationType, selectedPageId, selectedPostId, form } = props;
  const postIdRef = useRef(selectedPostId);
  const { t } = useTranslation();

  const allOption = [
    {
      text: t("automation.rule.field.conditions.postComment.post.options.all"),
      value: PostTypeEnum.All,
    },
  ];
  const hasAllOption = form.values.postCommentConditionFields?.noPosts
    ? form.values.postCommentConditionFields?.postId ===
      PostTypeEnum.All.toLowerCase()
      ? allOption
      : []
    : allOption;
  const postTypeChoices = [
    {
      text: t(
        "automation.rule.field.conditions.postComment.post.options.specific"
      ),
      value: PostTypeEnum.Specific,
    },
    ...hasAllOption,
  ];
  const [selectedPostType, setSelectedPostType] = useState<PostTypeType>(
    (selectedPostId === PostTypeEnum.All.toLowerCase()
      ? PostTypeEnum.All
      : PostTypeEnum.Specific) as PostTypeType
  );
  const [posts, setPosts] = useState<SinglePostType[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isFetchEnd, setIsFetchEnd] = useState(false);
  const offset = useRef(PostsOffsetLimit);
  const currentPage = useRef(0);
  const initiatedPostInfo = useRef(false);

  const getPosts = useCallback(async () => {
    if (!selectedPageId) return;
    setIsFetching(true);
    try {
      const result = await getWithExceptions(
        (automationType === FbPostComment
          ? GET_FB_POSTS
          : GET_IG_POSTS
        ).replace("{pageId}", selectedPageId),
        {
          param: {
            offset: offset.current * currentPage.current,
            limit: PostsOffsetLimit,
          },
        }
      );
      const postsKey =
        automationType === FbPostComment ? "facebookPosts" : "instagramMedias";
      if (result[postsKey].length < PostsOffsetLimit) {
        setIsFetchEnd(true);
      } else {
        setIsFetchEnd(false);
        currentPage.current += 1;
      }

      setPosts((prev) => {
        return [...prev, ...result[postsKey]];
      });
      if (!initiatedPostInfo.current) {
        const noPosts = result[postsKey].length === 0;
        if (form.values.postCommentConditionFields?.postId === "") {
          form.setFieldValue(
            "postCommentConditionFields",
            produce(form.values.postCommentConditionFields, (draft) => {
              if (draft) {
                draft.postId = noPosts ? "" : result[postsKey][0].id;
                draft.noPosts = noPosts;
              }
            })
          );
        }
        initiatedPostInfo.current = true;
      }
    } catch (e) {
    } finally {
      setIsFetching(false);
    }
  }, [selectedPageId]);

  const resetPostList = useCallback(() => {
    initiatedPostInfo.current = false;
    currentPage.current = 0;
    setPosts([]);
    getPosts();
  }, [selectedPageId]);

  useEffect(() => {
    if (selectedPostType === PostTypeEnum.Specific) {
      resetPostList();
    }
  }, [selectedPageId]);

  useEffect(() => {
    if (postIdRef.current === selectedPostType) {
      return;
    }
    if (
      selectedPostType.toLowerCase() ===
      PostTypeEnum.All.toString().toLowerCase()
    ) {
      form.setFieldValue(
        "postCommentConditionFields",
        produce(form.values.postCommentConditionFields, (draft) => {
          if (draft) {
            draft.postId = PostTypeEnum.All;
          }
        })
      );
    } else {
      resetPostList();
    }
  }, [selectedPostType]);

  return (
    <div className={styles.postList}>
      <label>
        {t("automation.rule.field.conditions.postComment.post.label")}
      </label>
      <Dropdown
        fluid
        selection
        options={postTypeChoices}
        value={selectedPostType}
        onChange={(_, { value }) => setSelectedPostType(value as PostTypeType)}
      />
      {selectedPostType === PostTypeEnum.Specific && (
        <div
          className={`${styles.postsWrapper} ${
            posts.length === 0 ? "noPost" : ""
          }`}
        >
          <>
            {posts.length === 0 ? (
              isFetching ? (
                <Loader active />
              ) : (
                <div className={styles.noPost}>
                  <Trans i18nKey="automation.rule.field.conditions.postComment.post.notPost">
                    You don't have any post in this account yet. <br />
                    Please create a post to continue.
                  </Trans>
                </div>
              )
            ) : (
              <ScrollLoader
                callback={getPosts}
                isFetchEnd={isFetchEnd}
                isFetching={isFetching}
              >
                <div className={styles.postsContainer}>
                  {posts.map((post, index) => (
                    <Post
                      key={`fbig_post_${index}`}
                      post={post}
                      selectedPostId={selectedPostId}
                      setSelectedPostId={(
                        e: React.FormEvent,
                        data: CheckboxProps
                      ) => {
                        e.stopPropagation();
                        const id = data.value as string;
                        form.setFieldValue(
                          "postCommentConditionFields",
                          produce(
                            form.values.postCommentConditionFields,
                            (draft) => {
                              if (draft) {
                                draft.postId = id;
                              }
                            }
                          )
                        );
                      }}
                    />
                  ))}
                </div>
              </ScrollLoader>
            )}
          </>
        </div>
      )}
    </div>
  );
};
export default PostList;
