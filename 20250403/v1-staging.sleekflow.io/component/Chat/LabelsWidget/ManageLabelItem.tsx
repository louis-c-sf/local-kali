import { HashTagType } from "../../../types/ConversationType";
import {
  ManageLabelsPopupAction,
  ManageLabelsPopupState,
} from "./labelsManagementReducer";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHoverEffect } from "../../../lib/effects/useHoverEffect";
import { Button, Dropdown } from "semantic-ui-react";
import { ChatLabel } from "../ChatLabel";

export function ManageLabelItem(props: {
  index: number;
  tag: HashTagType;
  state: ManageLabelsPopupState;
  dispatch: React.Dispatch<ManageLabelsPopupAction>;
  onDelete: (tag: HashTagType) => void;
  onEditClick: (node: HTMLElement | null) => void;
  onMouseover: () => void;
  onMouseout: () => void;
  isHovered: boolean;
}) {
  const {
    dispatch,
    index,
    onDelete,
    state,
    tag,
    onMouseout,
    onMouseover,
    isHovered,
  } = props;
  const { t } = useTranslation();
  const [itemNode, setItemNode] = useState<HTMLElement | null>(null);

  const isNewTagEditing = tag.hashtag === state.editNewTag?.hashtag;
  const isTagEditing = tag.id === state.editTag?.id;
  const isTagDeleting = tag.id === state.deleteClickedId;

  let tagData: HashTagType;
  if (state.editTag && isTagEditing) {
    tagData = state.editTag;
  } else if (state.editNewTag && isNewTagEditing) {
    tagData = state.editNewTag;
  } else {
    tagData = state.updateProxies.find((p) => p.id === tag.id) ?? tag;
  }

  function handleEditClick() {
    props.onEditClick(itemNode);
  }

  const handleDeleteClick = () => {
    if (tag.id) {
      dispatch({ type: "MANAGE_LABELS.DELETE_CLICK", id: tag.id });
    }
  };

  useHoverEffect({
    node: itemNode,
    onEnter: onMouseover,
    onLeave: onMouseout,
  });

  return (
    <Dropdown.Item key={tag.id ?? index}>
      <div
        ref={setItemNode}
        className={`item-inner ${isHovered ? "hovered" : ""}`}
      >
        <ChatLabel tag={tagData} />
        {isTagDeleting && (
          <div className="buttons visible">
            <Button
              compact
              className={"danger"}
              content={t("form.button.confirm")}
              onClick={() => {
                dispatch({ type: "MANAGE_LABELS.DELETE_START", tag });
                onDelete(tag);
              }}
            />
          </div>
        )}
        {!(isTagDeleting || isTagEditing || isNewTagEditing) && (
          <div className={`buttons ${isHovered ? "visible" : ""}`}>
            <Button
              compact
              content={t("form.button.edit")}
              onClick={handleEditClick}
            />
            <Button
              compact
              content={t("form.button.delete")}
              onClick={handleDeleteClick}
            />
          </div>
        )}
      </div>
    </Dropdown.Item>
  );
}
