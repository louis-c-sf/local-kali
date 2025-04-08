import React, {
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  useLayoutEffect,
} from "react";
import { Button, Portal } from "semantic-ui-react";
import { Placement } from "@popperjs/core";
import { usePopperPopup } from "../../shared/popup/usePopperPopup";
import SearchInput from "../../shared/popup/SearchableDialog/SearchInput";
import { ConditionCheckboxBlock } from "../../shared/condition/ConditionCheckboxBlock";
import styles from "./TagsListsFilterDialog.module.css";
import {
  ContactsContext,
  DefaultOperatorValue,
} from "../../../container/Contact/hooks/ContactsStateType";
import { useTranslation } from "react-i18next";
import { ConditionNameType } from "../../../config/ProfileFieldMapping";

export function TagsListsFilterDialog<TItem>(props: {
  opened: boolean;
  popperPlacement?: Placement;
  onSearch: (query: string) => void;
  onSearchClear: () => void;
  onSearchKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  close: () => void;
  children: ReactNode;
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
  name: "list" | "hashtag";
  onFilterApplied: (operator: ConditionNameType) => void;
  setCheckedItemFiltersLocal: React.Dispatch<React.SetStateAction<TItem[]>>;
  values: TItem[];
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
    small = true,
    compact = false,
    showSearchIcon = true,
    onSearchKeyDown,
    name = "list",
    onFilterApplied = () => {},
    setCheckedItemFiltersLocal,
    values,
  } = props;
  const { t } = useTranslation();
  const [popupNode, setPopupNode] = useState<HTMLElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const { scopeState } = useContext(ContactsContext);
  const tagOperator = scopeState.default.tagOperator;
  const listOperator = scopeState.default.listOperator;
  const defaultOperator =
    values.length === 0
      ? DefaultOperatorValue
      : name === "hashtag"
      ? tagOperator
      : listOperator;
  const [operatorLocal, setOperatorLocal] =
    useState<ConditionNameType>(defaultOperator);

  useEffect(() => {
    setCheckedItemFiltersLocal(values);
    setOperatorLocal(defaultOperator);
  }, [values, defaultOperator]);

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
    []
  );

  useLayoutEffect(() => {
    if (props.opened && popperInstance) {
      popperInstance.update();
    }
  }, [props.opened, popperInstance]);

  return (
    <Portal
      open
      onClose={close}
      mountNode={mountElement ?? document.body}
      triggerRef={{ current: props.triggerRef }}
      closeOnDocumentClick={true}
    >
      <div
        ref={setPopupNode}
        className={`
          app ui popup searchable
          ${props.opened ? "visible dialog" : ""}
          ${small ? "small" : ""}
          ${compact ? "compact" : ""}
          ${props.flowing ? "flowing" : ""}
          ${props.className ?? ""}
          ${styles.labelPopup}
        `}
      >
        <div className={styles.contentContainer}>
          <div className={styles.conditionContainer}>
            <ConditionCheckboxBlock
              labelType={name}
              operatorLocal={operatorLocal}
              setOperatorLocal={setOperatorLocal}
            />
          </div>
          <div className={styles.labelListContainer}>
            <SearchInput
              {...{
                searchRef,
                onSearch,
                onSearchClear,
                searchLoading,
                onSearchKeyDown,
                showSearchIcon,
                placeholder: placeholder,
              }}
            />
            <div className={"body segment"}>{children}</div>
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <Button
            content={t("profile.form.filter.action.apply")}
            className={"button-small"}
            primary
            onClick={() => {
              onFilterApplied(operatorLocal);
            }}
          />
        </div>
      </div>
    </Portal>
  );
}
