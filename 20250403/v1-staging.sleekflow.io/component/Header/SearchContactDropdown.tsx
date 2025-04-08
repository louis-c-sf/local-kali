import React from "react";
import { Dropdown } from "semantic-ui-react";
import SearchContact from "../SearchContact";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useContactsSuggest } from "../../api/Contacts/useContactsSuggest";

export default SearchContactDropdown;

function SearchContactDropdown() {
  const { t } = useTranslation();
  const { searchResult, handleSearchChange, loading, typedValue, resetSearch } =
    useContactsSuggest();

  return (
    <Dropdown
      placeholder={t("form.field.search.placeholder.long")}
      onSearchChange={(e, data) => {
        handleSearchChange(data.searchQuery);
      }}
      onClose={resetSearch}
      search
      className="search-staff"
      loading={loading}
      lazyLoad
      upward={false}
      value={typedValue}
      openOnFocus={false}
      noResultsMessage={t("form.field.dropdown.noResults")}
    >
      <Dropdown.Menu
        className={`${(searchResult.length > 0 && "display") || ""}`}
      >
        {searchResult.length > 0 && (
          <Dropdown.Header className="category">
            <div className="name">{t("header.search.results.header")}</div>
          </Dropdown.Header>
        )}
        {searchResult.map((result, idx) => {
          return (
            <Dropdown.Item key={idx}>
              <Link to={`/profile/${result.id}`}>
                <SearchContact
                  searchValue={typedValue}
                  id={result.id}
                  image={result.image || ""}
                  title={result.title}
                  description={result.description}
                />
              </Link>
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
}
