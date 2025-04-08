import React, { useState } from "react";
import { useEmojiLocales } from "./localizable/useEmojiLocales";
import { emojiList } from "./emoji/emojiList";

interface EmojiPopUpProps {
  setSelectedEmoji: (emoji: string) => void;
  handleEmojiToggle: Function;
}

export default function EmojiPopUp(props: EmojiPopUpProps) {
  const { setSelectedEmoji, handleEmojiToggle } = props;
  const [searchText, setSearchText] = useState("");
  const handleEmojiClick = (e: React.MouseEvent, emoji: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedEmoji(emoji);
    handleEmojiToggle();
  };
  const { categoryNames } = useEmojiLocales();

  return (
    <div
      className={`intercom-composer-popover active intercom-composer-emoji-popoverver intercom-composer-emoji-popover`}
    >
      <div className="intercom-emoji-picker">
        <div className="intercom-composer-popover-header">
          <input
            className="intercom-composer-popover-input"
            placeholder="Search"
            onChange={(e) => setSearchText(e.target.value)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            value={searchText}
          />
        </div>
        <div className="intercom-composer-popover-body-container">
          <div className="intercom-composer-popover-body">
            <div className="intercom-emoji-picker-groups">
              {Object.keys(emojiList).map((categoryName, index, arr) => {
                const categoryNameLocale =
                  categoryNames[categoryName] ?? categoryName;
                return (
                  <div
                    key={categoryName + index}
                    className="intercom-emoji-picker-group"
                  >
                    <div className="intercom-emoji-picker-group-title">
                      {categoryNameLocale}
                    </div>
                    {Object.keys(emojiList[categoryName])
                      .filter((emojiName) =>
                        emojiName.includes(searchText.toLowerCase())
                      )
                      .map((emojiName, index) => (
                        <span
                          key={emojiName + index}
                          onClick={(e) =>
                            handleEmojiClick(
                              e,
                              emojiList[categoryName][emojiName]
                            )
                          }
                          className="intercom-emoji-picker-emoji"
                          title={emojiName}
                        >
                          {emojiList[categoryName][emojiName]}
                        </span>
                      ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="intercom-composer-popover-caret"></div>
      </div>
    </div>
  );
}
