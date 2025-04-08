import React, { useState } from "react";
import { Icon, Input, Loader, InputOnChangeData } from "semantic-ui-react";

const SearchInput = (props: {
  className?: string;
  searchRef: React.MutableRefObject<HTMLInputElement | null>;
  onSearch: (query: string, name: string) => void;
  onSearchClear: (inputName?: string) => void;
  searchLoading?: boolean;
  placeholder?: string;
  onSearchKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  showSearchIcon?: boolean;
  inputName?: string;
}) => {
  const {
    searchLoading,
    searchRef,
    onSearch,
    onSearchClear,
    placeholder,
    onSearchKeyDown,
    showSearchIcon = true,
    inputName = "default",
  } = props;

  const [searchQuery, setSearchQuery] = useState("");
  const searchClearHandler = searchQuery
    ? () => {
        setSearchQuery("");
        onSearchClear(inputName);
        if (searchRef.current) {
          searchRef.current.focus();
        }
      }
    : undefined;

  function changeHandler(_: any, data: InputOnChangeData) {
    const query = data.value as string;
    const name = data.name as string;
    onSearch(query, name);
    setSearchQuery(query);
    if (query === "") {
      onSearchClear();
    }
  }

  return (
    <div className={`search segment ${props.className}`}>
      <Input
        name={inputName}
        type={"text"}
        value={searchQuery}
        fluid
        onChange={changeHandler}
        loading={searchLoading ?? false}
        placeholder={placeholder ?? ""}
      >
        <input ref={searchRef} onKeyDown={onSearchKeyDown} />
        {searchLoading ? (
          <Loader size={"small"} />
        ) : showSearchIcon ? (
          <Icon
            name={searchQuery ? "close" : "search"}
            onClick={searchClearHandler}
          />
        ) : (
          searchQuery && (
            <Icon
              name={searchQuery ? "close" : "search"}
              onClick={searchClearHandler}
            />
          )
        )}
      </Input>
    </div>
  );
};
export default SearchInput;
