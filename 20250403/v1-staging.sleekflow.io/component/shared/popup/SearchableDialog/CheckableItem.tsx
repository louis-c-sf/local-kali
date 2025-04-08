import React, { ReactNode, useState } from "react";
import { Checkbox } from "semantic-ui-react";

export default function CheckableItem<TItem extends any>(props: {
  item: TItem;
  active: boolean;
  onChange: (itemChecked: boolean, item: TItem) => void;
  label: string;
  renderLabel?: (item: TItem, clickHandler: () => void) => ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const clickHandler = () => props.onChange(!props.active, props.item);
  return (
    <div
      className={`item ${hovered ? "active" : ""}`}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
    >
      <Checkbox
        checked={props.active}
        onChange={(_, data) => {
          props.onChange(Boolean(data.checked), props.item);
        }}
      />
      {props.renderLabel ? (
        props.renderLabel(props.item, clickHandler)
      ) : (
        <label className={"checkbox-label"} onClick={clickHandler}>
          {props.label}
        </label>
      )}
    </div>
  );
}
