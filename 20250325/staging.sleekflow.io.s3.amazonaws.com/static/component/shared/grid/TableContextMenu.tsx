import React, { useState } from "react";
import { Dropdown, Icon, Portal } from "semantic-ui-react";
import { usePopperPopup } from "../popup/usePopperPopup";
import { InfoTooltip } from "../popup/InfoTooltip";
import { useTranslation } from "react-i18next";

export function TableContextMenu(props: {
  children: (close: () => void) => React.ReactChild;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownRef, setDropdownRef] = useState<HTMLElement | null>(null);
  const [triggerRef, setTriggerRef] = useState<HTMLElement | null>(null);
  const { t } = useTranslation();

  function handleClose() {
    setMenuOpen(false);
  }

  usePopperPopup(
    {
      anchorRef: triggerRef,
      popupRef: dropdownRef,
      onClose: handleClose,
      closeOnOutsideClick: true,
      placement: "left-start",
      offset: [10, 10],
    },
    [menuOpen]
  );

  return (
    <>
      <InfoTooltip
        placement={"left"}
        children={t("tooltip.grid.actions")}
        trigger={
          <span
            className={"context-menu-trigger"}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            ref={setTriggerRef}
          >
            <Icon className={"button-dots"} />
          </span>
        }
      />
      {menuOpen && (
        <Portal
          mountNode={document.getElementById("root")}
          open
          onClose={handleClose}
          closeOnDocumentClick={false}
        >
          <div className={`indicator context-menu visible`}>
            <div
              className={"ui dropdown dropdown-menu-overlay"}
              ref={setDropdownRef}
            >
              <Dropdown.Menu open>{props.children(handleClose)}</Dropdown.Menu>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
