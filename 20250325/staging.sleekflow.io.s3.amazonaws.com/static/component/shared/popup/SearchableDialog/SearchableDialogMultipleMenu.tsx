import React, {
  RefObject,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { Dropdown, Portal } from "semantic-ui-react";
import { Placement } from "@popperjs/core";
import { usePopperPopup } from "../usePopperPopup";
import { useTranslation } from "react-i18next";
import { FilterBottomChildrenItemType } from "../../../Chat/Messenger/types";
import { FilterPanes } from "./FilterPanes";

export function SearchableDialogMultipleMenu(props: {
  open: boolean;
  popperPlacement?: Placement;
  onSearch: (query: string, name: string) => void;
  onSearchClear: (inputName?: string) => void;
  onSearchKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  close: () => void;
  triggerRef: HTMLElement | null;
  mountElement?: HTMLElement;
  className?: string;
  searchLoading?: boolean;
  flowing?: boolean;
  small?: boolean;
  compact?: boolean;
  offset?: [number, number];
  showSearchIcon?: boolean;
  isAnyFilterApplied: boolean | "UnreadOnly" | "ReadOnly";
  resetAllFilters: () => void;
  topChildren: JSX.Element;
  bottomChildren: FilterBottomChildrenItemType[];
}) {
  const {
    onSearch,
    close,
    triggerRef,
    onSearchClear,
    searchLoading,
    mountElement,
    small = true,
    compact = false,
    showSearchIcon = true,
    onSearchKeyDown,
    isAnyFilterApplied,
    resetAllFilters,
    topChildren,
    bottomChildren,
  } = props;

  const { t } = useTranslation();
  const [popupNode, setPopupNode] = useState<HTMLElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchRef.current]);

  const { popper: popperInstance } = usePopperPopup(
    {
      popupRef: popupNode,
      anchorRef: triggerRef,
      onClose: close,
      placement: props.popperPlacement ?? "auto",
      offset: props.offset ?? [0, 0],
      closeOnOutsideClick: false,
    },
    [mountElement ?? document.body]
  );

  useLayoutEffect(() => {
    if (props.open && popperInstance) {
      popperInstance.update();
    }
  }, [popperInstance, props.open]);

  return (
    <Portal
      open
      onClose={close}
      mountNode={mountElement ?? document.body}
      triggerRef={{ current: props.triggerRef }}
      closeOnDocumentClick
    >
      <div
        ref={setPopupNode}
        className={`
          app ui popup searchable 
          ${props.open ? "visible static" : ""}
          dialog dropdown ${small ? "small" : ""}
          ${compact ? "compact" : ""}
          ${props.flowing ? "flowing" : ""}
          ${props.className ?? ""}
        `}
      >
        <div className={"filter menu visible transition"}>
          {isAnyFilterApplied && (
            <Dropdown.Item className={"action"} onClick={resetAllFilters}>
              {t("chat.filter.clearAll")}
            </Dropdown.Item>
          )}
          {topChildren}
          <Dropdown.Divider />
          <FilterPanes
            bottomChildren={bottomChildren}
            searchRef={searchRef}
            onSearch={onSearch}
            onSearchClear={onSearchClear}
            searchLoading={searchLoading}
            onSearchKeyDown={onSearchKeyDown}
            showSearchIcon={showSearchIcon}
          />
        </div>
      </div>
    </Portal>
  );
}
