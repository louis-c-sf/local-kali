import { useAppDispatch } from "../../../AppRootContext";
import ConversationType, {
  HashTagCountedType,
  HashTagType,
  normalizeHashTag,
  TagColorBaseType,
} from "../../../types/ConversationType";
import { getWithExceptions, postWithExceptions } from "../../../api/apiRequest";
import {
  ADD_CONVERSATIONS_HASHTAGS,
  DELETE_CONVERSATIONS_HASHTAGS,
  GET_CONVERSATION_BY_PROFILE_ID,
} from "../../../api/apiPath";
import { ProfileType } from "../../../types/LoginType";
import { whereEq } from "ramda";
import React, { useReducer, useState } from "react";
import { matchingTag } from "../../../container/Chat/LabelsManagementContainer";
import {
  companyProxiesReducer,
  LabelsManagementAction,
  labelsManagementReducer,
  LabelsManagementState,
  manageLabelsPopupReducer,
} from "./labelsManagementReducer";
import { reduceReducers } from "../../../utility/reduce-reducers";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { useTranslation } from "react-i18next";
import { useCompanyHashTags } from "../../Settings/hooks/useCompanyHashTags";

type TagMapType = {
  tag: HashTagType;
  key: string;
  deleteHandler: (tag: HashTagType) => void;
};

export function useLabelsManagementFlow(props: {
  profile: ProfileType;
  tagsFilter?: boolean;
}) {
  const { profile, tagsFilter = true } = props;
  const loginDispatch = useAppDispatch();
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const [state, dispatch] = useReducer<
    React.Reducer<LabelsManagementState, LabelsManagementAction>
  >(
    reduceReducers(
      labelsManagementReducer,
      manageLabelsPopupReducer,
      companyProxiesReducer
    ),
    {
      deleteCompanyTagsProxy: [],
      newTagsProxy: [],
      newCompanyTagsProxy: [],
      deleteChatTagsProxy: [],
      editNewTag: null,
      editExistedTag: null,
      manageLabels: {
        deleteClickedId: null,
        editTag: null,
        updateProxies: [],
        editNewTag: null,
      },
    }
  );

  const { companyTags, getActualTagsOnly, refreshCompanyTags } =
    useCompanyHashTags();

  async function addOrUpdateProfileTag(tag: HashTagType) {
    try {
      dispatch({ type: "ADD_NEW_TAG_PROXY", tag });
      let conversationId = profile.conversationId;
      if (!conversationId) {
        const profileTmp: ConversationType = await getWithExceptions(
          GET_CONVERSATION_BY_PROFILE_ID.replace("{id}", profile.id),
          { param: {} }
        );
        conversationId = profileTmp.conversationId;
        loginDispatch({
          type: "PROFILE_UPDATED",
          profile: {
            ...profile,
            conversationId: profileTmp.conversationId,
          },
        });
      }
      const response: ProfileType = await postWithExceptions(
        ADD_CONVERSATIONS_HASHTAGS.replace("{id}", conversationId),
        {
          param: [normalizeHashTag(tag)],
        }
      );

      loginDispatch({
        type: "CHAT_UPDATE_TAGS",
        conversationId: response.conversationId,
        tags: response.conversationHashtags,
      });

      const tagExisted = companyTags.find(
        whereEq<HashTagType>({
          hashtag: tag.hashtag,
          hashTagColor: tag.hashTagColor,
        })
      );
      if (!tagExisted) {
        await refreshCompanyTags();
      }
      dispatch({ type: "REMOVE_NEW_TAG_PROXY", tag });
    } catch (e) {
      console.error("#addProfileTag", e, tag);
      flash(t("flash.common.unknownErrorTryLater"));
    }
  }

  async function deleteProfileTag(tag: HashTagType) {
    try {
      setIsDeleteLoading(true);
      dispatch({ type: "ADD_DELETE_TAG_PROXY", tag: tag });
      const response: ProfileType = await postWithExceptions(
        DELETE_CONVERSATIONS_HASHTAGS.replace("{id}", profile.conversationId),
        {
          param: [normalizeHashTag(tag)],
        }
      );
      loginDispatch({
        type: "CHAT_UPDATE_TAGS",
        conversationId: response.conversationId,
        tags: response.conversationHashtags,
      });
      dispatch({ type: "REMOVE_DELETE_TAG_PROXY", tag: tag });
    } catch (e) {
      console.error("#deleteProfileTag", e, tag);
      flash(t("flash.common.unknownErrorTryLater"));
    } finally {
      setIsDeleteLoading(false);
    }
  }

  function confirmNewTagColor() {
    if (!state.editNewTag) {
      console.error("confirmNewTagColor: missing state.editNewTag", state);
      return;
    }
    dispatch({ type: "STOP_EDIT_ADDED_TAG" });
    addOrUpdateProfileTag({ ...state.editNewTag });
  }

  const handleNewTagColorPick = (color: TagColorBaseType) => {
    dispatch({ type: "UPDATE_NEW_TAG_COLOR", color });
  };

  const profileTags = profile.conversationHashtags ?? [];
  const tagsVisible = getActualTagsOnly(profileTags)
    ?.filter((tag) => !state.deleteChatTagsProxy.some(matchingTag(tag)))
    .filter((tag) => companyTags.some(matchingTag(tag)));

  const tagProxiesVisible = state.newTagsProxy.filter(
    (p: HashTagType) => !profileTags.some(matchingTag(p))
  );

  if (
    state.editNewTag &&
    !tagProxiesVisible.some(matchingTag(state.editNewTag)) &&
    !tagsVisible.some(matchingTag(state.editNewTag))
  ) {
    tagProxiesVisible.unshift(state.editNewTag);
  }

  function getEditTagMatch(tag: HashTagType) {
    return state.editNewTag && tag.hashtag === state.editNewTag.hashtag
      ? state.editNewTag
      : null;
  }

  function handleDeleteTagClick(tag: HashTagType) {
    return () => {
      if (getEditTagMatch(tag)) {
        dispatch({ type: "STOP_EDIT_ADDED_TAG" });
      }
      deleteProfileTag(tag);
    };
  }

  function handleProfileTagAdded(tag: HashTagType, isNew: boolean) {
    if (isNew) {
      dispatch({ type: "START_EDIT_ADDED_TAG", tag });
    }
    addOrUpdateProfileTag(tag);
  }

  let availableTagsToAdd: HashTagCountedType[] = [];
  if (tagsFilter) {
    availableTagsToAdd = companyTags?.filter(
      (item) =>
        !profileTags.some(matchingTag(item)) &&
        !state.newTagsProxy.some(matchingTag(item))
    );
  } else {
    availableTagsToAdd = companyTags;
  }

  const tagsList = tagProxiesVisible
    .map<TagMapType>((tag, index) => {
      return {
        tag: tag,
        key: `${tag.hashtag}#${index}`,
        deleteHandler: () => deleteProfileTag(tag),
      };
    })
    .concat(
      tagsVisible.map<TagMapType>((tag, index) => {
        const proxyMatch = state.newTagsProxy.find(matchingTag(tag));
        const tagData = getEditTagMatch(tag) ?? proxyMatch ?? tag;
        return {
          tag: tagData,
          key: tag.id ?? `${tag.hashtag}#${index}`,
          deleteHandler: handleDeleteTagClick(tag),
        };
      })
    );

  return {
    handleNewTagColorPick,
    confirmNewTagColor,
    profileTagsVisible: tagsList,
    state,
    dispatch,
    handleProfileTagAdded,
    availableTagsToAdd,
    isDeleteLoading,
  };
}
