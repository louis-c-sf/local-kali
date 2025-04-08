import React, { memo, useState } from "react";
import { Button, Dropdown, Input } from "semantic-ui-react";
import { QuickReplyType } from "../../../types/QuickReplies/QuickReplyType";
import { getQueryMatcher } from "../../../container/Settings/filters/getQueryMatcher";
import { PopupWithTooltip } from "../../shared/upload/PopupWithTooltip";
import { DropdownMenuList } from "../../shared/DropdownMenuList";
import { useTranslation } from "react-i18next";
import { UploadedQuickReplyFileType } from "../../../types/UploadedFileType";
import { useSendMessageContext } from "component/Chat/Messenger/SendMessageBox/SendMessageContext";
import useRouteConfig from "config/useRouteConfig";

export const QuickReplyToggle = memo(function QuickReplyToggle(props: {
  quickReplyTemplates: QuickReplyType[];
  setText: (text: string) => void;
  setAttachments: (
    files: UploadedQuickReplyFileType[],
    templateId: number
  ) => void;
}) {
  const { quickReplyTemplates, setAttachments, setText } = props;
  const sendMessage = useSendMessageContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<QuickReplyType[]>([]);
  const [itemActive, setItemActive] = useState<QuickReplyType | undefined>();
  const { t } = useTranslation();
  const items = searchQuery === "" ? quickReplyTemplates : searchResults;

  const matcher = getQueryMatcher(
    (it: QuickReplyType) => `${it.name}${it.text}`
  );

  function itemClickHandler(item: QuickReplyType) {
    setText(item.text);
    if (item.files && item.files.length > 0 && item.id) {
      setAttachments(item.files, item.id);
    }
  }

  function closeHandler() {
    setItemActive(undefined);
    setSearchQuery("");
    setSearchResults([]);
  }

  function searchHandler(query: string) {
    setSearchQuery(query);
    if (query === "") {
      setSearchResults([]);
      return;
    }
    const found = quickReplyTemplates.filter(matcher(query));
    setSearchResults(found);
  }

  return (
    <PopupWithTooltip
      tooltipClassName={"quick-reply-tooltip info-tooltip"}
      tooltipText={t("chat.quickReply.tooltip")}
      tooltipPosition={"top"}
      popupClassName={"quick-reply dialog"}
      popupPositionPivot={sendMessage.textInput}
      popupOffset={[0, 10]}
      popupFlowing={true}
      renderPopup={(closePopup) => (
        <PopupContents
          searchQuery={searchQuery}
          items={items}
          itemActive={itemActive}
          setItemActive={setItemActive}
          itemClickHandler={(item) => {
            itemClickHandler(item);
            closeHandler();
            closePopup();
          }}
          searchHandler={searchHandler}
        />
      )}
      tooltipTrigger={
        <Button>
          <i className={"ui icon icon-quick-reply-trigger"} />
        </Button>
      }
    />
  );
});

function PopupContents(props: {
  itemActive: QuickReplyType | undefined;
  items: QuickReplyType[];
  searchQuery: string;
  searchHandler(value: string): void;
  itemClickHandler(item: QuickReplyType): void;
  setItemActive(item: QuickReplyType): void;
}) {
  const {
    itemActive,
    itemClickHandler,
    items,
    searchHandler,
    searchQuery,
    setItemActive,
  } = props;
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();

  return (
    <div>
      <div className={"dialog header"}>
        <div className="text">{t("chat.quickReply.header")}</div>
        <Button
          as={"a"}
          href={routeTo("/settings/quickreplies", true)}
          target={"_blank"}
          content={t("chat.quickReply.buttons.manage")}
          className={"button-small"}
        />
      </div>
      <div className={"dialog body"}>
        <div className="search row">
          <Input
            type={"text"}
            fluid
            icon={"search"}
            iconPosition={"left"}
            value={searchQuery}
            placeholder={t("chat.quickReply.search.placeholder")}
            onChange={(event, data) => {
              searchHandler(data.value as string);
            }}
          />
        </div>
        <div className="content row">
          <div className="list column">
            <DropdownMenuList>
              {items.map((item, index) => {
                const hasAttachment = item.files && item.files.length > 0;
                return (
                  <Dropdown.Item
                    key={index}
                    onClick={() => itemClickHandler(item)}
                    onMouseOver={() => {
                      setItemActive(item);
                    }}
                  >
                    <span className={"text"}>{item.name}</span>
                    {hasAttachment && (
                      <i className={"ui small icon attachment-trigger"} />
                    )}
                  </Dropdown.Item>
                );
              })}
            </DropdownMenuList>
          </div>
          <div className="content column">
            {itemActive && (
              <div className="content">
                <div className="clip">{itemActive.text}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
