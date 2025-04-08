import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import styles from "./SearchPanel.module.css";
import { useAppDispatch, useAppSelector } from "../../../../AppRootContext";
import { equals, prop, uniqBy } from "ramda";
import { useTranslation } from "react-i18next";
import SearchListItem from "./SearchListItem";
import MessageType from "../../../../types/MessageType";
import { BackLink } from "../../../shared/nav/BackLink";
import { SearchInput } from "../../../shared/input/SearchInput";

function SearchPanel() {
  const active = useAppSelector((s) => s.inbox.messageSearch.active);
  const results = useAppSelector(
    (s) => uniqBy(prop("id"), s.inbox.messageSearch.results),
    equals
  );
  const query = useAppSelector((s) => s.inbox.messageSearch.query);
  const queryLatest = useAppSelector((s) => s.inbox.messageSearch.queryLatest);
  const loading = useAppSelector((s) => s.inbox.messageSearch.loading);
  const conversationId = useAppSelector((s) => s.profile?.conversationId);
  const contextLoading = useAppSelector(
    (s) => s.inbox.messageSearch.contextMessages.loading
  );
  const contextInitialized = useAppSelector(
    (s) => s.inbox.messageSearch.contextMessages.initialized
  );
  const messageClickedId = useAppSelector(
    (s) => s.inbox.messageSearch.clickedMessage?.id
  );
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const { t } = useTranslation();

  const loginDispatch = useAppDispatch();

  const hasQuery = query.trim() !== "";

  useEffect(() => {
    if (!active || !inputRef) {
      return;
    }
    const focusTime = setTimeout(() => {
      if (inputRef) {
        inputRef.focus();
      }
    }, 300);

    return () => {
      focusTime && clearTimeout(focusTime);
    };
  }, [active, inputRef]);

  const performSearch = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      const queryNormalized = ev.target.value;
      loginDispatch({
        type: "INBOX.MESSAGE.SEARCH_TYPE",
        query: queryNormalized,
        conversationId: conversationId,
      });
    },
    [loginDispatch, conversationId]
  );

  const handleMessageClick = useCallback(
    (message: MessageType) => {
      loginDispatch({
        type: "INBOX.MESSAGE.SEARCH_RESULT_CLICK",
        message,
      });
    },
    [loginDispatch]
  );

  return (
    <div className={`${styles.wrap} ${active ? styles.active : ""}`}>
      <div className={`${styles.panel} `}>
        <div className={styles.fixed}>
          <BackLink
            onClick={() =>
              loginDispatch({ type: "INBOX.MESSAGE.SEARCH_CLOSE" })
            }
          >
            {t("chat.search.messages.back")}
          </BackLink>
          <SearchInput
            loading={loading}
            onChange={performSearch}
            reset={() => loginDispatch({ type: "INBOX.MESSAGE.SEARCH_RESET" })}
            setInputRef={setInputRef}
            hasQuery={hasQuery}
            query={query}
          />
          {loading && (
            <div className={styles.resultsCounter}>
              {t("chat.search.messages.loading")}
            </div>
          )}
          {!loading && results.length > 0 && (
            <div className={styles.resultsCounter}>
              {t("chat.search.messages.counter", { count: results.length })}
            </div>
          )}
          {!loading && hasQuery && results.length === 0 && (
            <div className={styles.resultsCounter}>
              {t("chat.search.messages.noResults")}
            </div>
          )}
        </div>
        <div className={styles.results}>
          {results.map((res) => {
            const isSelected = res.id === messageClickedId;
            return (
              <SearchListItem
                query={queryLatest ?? query}
                message={res}
                selected={isSelected}
                loading={contextLoading && isSelected && !contextInitialized}
                key={res.id}
                onClick={handleMessageClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SearchPanel;
