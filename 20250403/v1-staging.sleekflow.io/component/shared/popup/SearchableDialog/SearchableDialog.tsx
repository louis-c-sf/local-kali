import React, { RefObject, useEffect, useRef, useState } from "react";
import { InputOnChangeData, Portal } from "semantic-ui-react";
import { Placement } from "@popperjs/core";
import { usePopperPopup } from "../usePopperPopup";
import { isRef } from "../../../../utility/isRef";
import SearchInput from "./SearchInput";

export function SearchableDialog(props: {
  popperPlacement?: Placement;
  onSearch: (query: string) => void;
  onSearchClear: () => void;
  onSearchKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  close: () => void;
  children: (
    searchRef: React.RefObject<HTMLInputElement | null>
  ) => JSX.Element;
  triggerRef: React.RefObject<HTMLElement | null> | HTMLElement | null;
  mountElement?: HTMLElement;
  className?: string;
  searchLoading?: boolean;
  placeholder?: string;
  flowing?: boolean;
  small?: boolean;
  compact?: boolean;
  offset?: [number, number];
  showSearchIcon?: boolean;
  ignoreOutsideClickNodes?: Array<RefObject<Element | null> | Element | null>;
  closeOnDocumentClick?: boolean;
  subtitle?: string;
  key?: string;
}) {
  const {
    onSearch,
    close,
    triggerRef,
    onSearchClear,
    searchLoading,
    children,
    placeholder,
    mountElement,
    ignoreOutsideClickNodes = [],
    closeOnDocumentClick = true,
    small = true,
    compact = false,
    showSearchIcon = true,
    subtitle,
    onSearchKeyDown,
  } = props;

  const [popupNode, setPopupNode] = useState<HTMLElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const triggerRefInner = useRef<HTMLElement | null>(null);
  let passTriggerRef = null;

  if (triggerRef !== null) {
    if (!isRef(triggerRef)) {
      passTriggerRef = triggerRefInner;
      triggerRefInner.current = props.triggerRef as HTMLElement | null;
    } else {
      passTriggerRef = triggerRef;
    }
  }

  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchRef.current]);

  usePopperPopup(
    {
      popupRef: popupNode,
      anchorRef: triggerRef,
      onClose: close,
      placement: props.popperPlacement ?? "auto",
      offset: props.offset ?? [0, 0],
      ignoreOutsideClickNodes,
      closeOnOutsideClick: closeOnDocumentClick,
    },
    []
  );

  return (
    <Portal
      open
      onClose={close}
      mountNode={mountElement ?? document.body}
      triggerRef={passTriggerRef}
      closeOnDocumentClick={closeOnDocumentClick}
    >
      <div
        ref={setPopupNode}
        className={`app ui popup searchable visible dialog
          ${small ? "small" : ""}
          ${compact ? "compact" : ""}
          ${props.flowing ? "flowing" : ""}
          ${props.className ?? ""}`}
      >
        {subtitle && <div className="subtitle segment">{subtitle}</div>}
        <SearchInput
          {...{
            searchRef,
            onSearch,
            onSearchClear,
            searchLoading,
            placeholder,
            onSearchKeyDown,
            showSearchIcon,
          }}
        />
        <div className={"body segment"}>{children(searchRef)}</div>
      </div>
    </Portal>
  );
}
