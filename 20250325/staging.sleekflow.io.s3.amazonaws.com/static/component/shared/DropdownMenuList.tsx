import React from "react";
import { Dropdown } from "semantic-ui-react";

export function DropdownMenuList(props: { children: any; className?: string }) {
  return (
    <div className={`ui dropdown static ${props.className ?? ""}`}>
      <Dropdown.Menu open>{props.children}</Dropdown.Menu>
    </div>
  );
}
