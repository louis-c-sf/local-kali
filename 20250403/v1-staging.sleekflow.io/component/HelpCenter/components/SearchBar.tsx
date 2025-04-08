import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input } from "semantic-ui-react";
import { HelpCenterContext } from "../hooks/helpCenterContext";
import RedirectIcon from "../../../assets/tsx/icons/RedirectIcon";
import { useCurrentPath } from "../hooks/useCurrentPath";
import mappingData from "../assets/mappingData.json";
import styles from "./SearchBar.module.css";

const SearchBar = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(HelpCenterContext);
  const originSearch = useRef(state.search);
  const [showHint, setShowHint] = useState(state.search !== "");
  const { currentPath } = useCurrentPath();

  const handleRedirect = () => {
    const redirectLink = `${mappingData.domain}/${mappingData.pages[currentPath].search}`;
    window.open(redirectLink + state.search, "docs.sleekflow.io");
    dispatch({ type: "UPDATE_SEARCH", search: "" });
    originSearch.current = "";
  };

  useEffect(() => {
    if (state.search !== "") {
      setShowHint(true);
    } else {
      setShowHint(false);
    }
  }, [state.search]);

  return (
    <div className={styles.searchBar}>
      <div className={styles.top}>
        <Input
          className={styles.inputWrapper}
          icon="search"
          iconPosition="left"
          placeholder={t("nav.helpCenter.mainPage.search.placeholder")}
          onChange={(e) => {
            dispatch({ type: "UPDATE_SEARCH", search: e.target.value });
          }}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.nativeEvent.code === "Enter") {
              handleRedirect();
            }
          }}
          value={state.search}
        />
        <Button
          primary
          disabled={originSearch.current === state.search}
          onClick={handleRedirect}
        >
          {t("nav.helpCenter.mainPage.search.button.search")}
          <RedirectIcon className={styles.redirectIcon} />
        </Button>
      </div>
      <div className={styles.bottom}>
        {t("nav.helpCenter.mainPage.search.hint")}
      </div>
    </div>
  );
};
export default SearchBar;
