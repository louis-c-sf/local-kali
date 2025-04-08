import React, { useRef } from "react";
import { Dropdown } from "semantic-ui-react";
import SearchInput from "./SearchInput";
import { FilterBottomChildrenItemType } from "../../../Chat/Messenger/types";
import styles from "./FilterPanes.module.css";
import clsx from "clsx";

export const FilterPanes = (props: {
  bottomChildren: FilterBottomChildrenItemType[];
  searchRef: React.MutableRefObject<HTMLInputElement | null>;
  onSearch: (query: string, name: string) => void;
  onSearchClear: (inputName?: string | undefined) => void;
  searchLoading: boolean | undefined;
  onSearchKeyDown:
    | ((event: React.KeyboardEvent<HTMLInputElement>) => void)
    | undefined;
  showSearchIcon: boolean;
}) => {
  const {
    bottomChildren,
    searchRef,
    onSearch,
    onSearchClear,
    searchLoading,
    onSearchKeyDown,
    showSearchIcon,
  } = props;
  return (
    <div className={styles.panes}>
      {bottomChildren.map((block, index) => (
        <>
          <div
            className={clsx(
              styles.container,
              block.name === "channel"
                ? styles.channelContainer
                : styles.labelContainer
            )}
            key={`ch${index}`}
          >
            <div className={styles.stickyBlock} key={"stick"}>
              <Dropdown.Header>{block.header}</Dropdown.Header>
              <SearchInput
                className={styles.searchInput}
                searchRef={searchRef}
                onSearch={onSearch}
                onSearchClear={onSearchClear}
                searchLoading={searchLoading}
                onSearchKeyDown={onSearchKeyDown}
                showSearchIcon={showSearchIcon}
                placeholder={block.placeholder}
                inputName={block.name}
              />
            </div>
            <FilterPaneScrollableContent block={block} />
          </div>
          {index === 0 && <div className={styles.divider} key={`dv${index}`} />}
        </>
      ))}
    </div>
  );
};

function FilterPaneScrollableContent(props: {
  block: FilterBottomChildrenItemType;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const { block } = props;

  return (
    <div className={styles.scrollable} ref={scrollerRef}>
      {block.element}
    </div>
  );
}
