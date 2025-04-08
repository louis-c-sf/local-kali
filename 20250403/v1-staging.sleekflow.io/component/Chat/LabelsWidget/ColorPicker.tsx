import {
  HashTagType,
  TagColorBaseType,
  tagColorsBase,
} from "../../../types/ConversationType";
import React, { useState } from "react";
import { usePopperPopup } from "../../shared/popup/usePopperPopup";

export function ColorPicker(props: {
  tag: HashTagType;
  onPickColor: (color: TagColorBaseType) => void;
  onClose: () => void;
  anchor: HTMLElement | null;
  placement: "top" | "bottom";
}) {
  const { anchor, tag, onClose, onPickColor, placement } = props;
  const [pickerNode, setPickerNode] = useState<HTMLElement | null>(null);

  usePopperPopup(
    {
      anchorRef: anchor,
      popupRef: pickerNode,
      onClose: onClose,
      placement: placement,
      offset: [0, 0],
    },
    [JSON.stringify(tag)]
  );

  return (
    <div className={"color-picker-popup"} ref={setPickerNode}>
      <ColorPickerInput onPickColor={onPickColor} tag={tag} />
    </div>
  );
}

export function ColorPickerInput(props: {
  onPickColor: (color: TagColorBaseType) => void;
  tag: HashTagType;
}) {
  const { onPickColor, tag } = props;

  return (
    <div className={"color-picker-input"}>
      <div className="inner">
        {tagColorsBase.map((shade, index) => (
          <div
            className={`color of-${shade.toLowerCase()} ${
              shade === tag.hashTagColor ? "active" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onPickColor(shade);
            }}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}
