import { Mention, MentionsInput, SuggestionDataItem } from "react-mentions";
import React, { useRef } from "react";
import { staffDisplayName } from "../utils/staffDisplayName";
import { StaffItemAvatar } from "../StaffItemAvatar";
import { Icon, Ref } from "semantic-ui-react";
import { prop } from "ramda";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../AppRootContext";
import { StaffType } from "../../../types/StaffType";
import { useSendMessageContext } from "component/Chat/Messenger/SendMessageBox/SendMessageContext";
import { catchTextarea } from "component/Chat/Messenger/TextareaMessage";

interface TextAreaNoteProps {
  onAdd: (id: string | number, display: string) => void;
  candidates: StaffType[];
  candidateSelected: StaffType | undefined;
  textVal: string;
  onChangeText: (markupText: string, plainText: string) => any;
  onKeyDown: (e: React.KeyboardEvent) => void;

  setMessageAssignee(messageAssignee: StaffType): void;
}

export function TextareaNote(props: TextAreaNoteProps) {
  const { textVal, candidates } = props;
  const settings = useAppSelector((s) => s.settings);
  const teams = settings.teamsSettings.teams;
  const { t } = useTranslation();
  const sendMessage = useSendMessageContext();
  const inputRefInner = useRef<HTMLTextAreaElement | null>(null);
  inputRefInner.current = sendMessage.textInput;

  function renderSuggestion(suggestion: SuggestionDataItem) {
    const staff = props.candidates.find(
      (candidate) => candidate.userInfo.id === suggestion.id
    );
    if (!staff) {
      return (
        <div className={"textarea__suggestions__item"}>
          {suggestion.display}
        </div>
      );
    }
    const teamNames = teams
      .filter((t) => t.members.some((m) => m.userInfo.id === staff.userInfo.id))
      .map(prop("name"))
      .join(" / ");

    return (
      <div className={"user-suggestion"}>
        <StaffItemAvatar
          staff={{
            name: staffDisplayName(staff),
            profilePicture: staff.profilePicture,
            profilePictureURL: staff.profilePictureURL,
            ...staff.userInfo,
          }}
        />
        <div className="info">
          <span className="item-name">{suggestion.display}</span>
          {props.candidateSelected &&
            staff.userInfo.id === props.candidateSelected.userInfo.id && (
              <Icon name="check" />
            )}
          {teamNames && <div className="teams-list">{teamNames}</div>}
        </div>
      </div>
    );
  }

  return (
    <Ref innerRef={catchTextarea(sendMessage.setTextInput)}>
      <MentionsInput
        value={textVal}
        allowSuggestionsAboveCursor={true}
        suggestionsPortalHost={sendMessage.chatContentNode ?? undefined}
        inputRef={inputRefInner}
        onChange={(event, newValue, newPlainTextValue, mentions) => {
          props.onChangeText(newValue, newPlainTextValue);
        }}
        placeholder={t("chat.form.send.placeholder.note")}
        className={"textarea"}
        onKeyDown={props.onKeyDown}
        autoFocus={true}
      >
        <Mention
          className="no-scrollbars"
          appendSpaceOnAdd={true}
          trigger={"@"}
          data={candidates.map((staff) => ({
            id: staff.userInfo.id,
            display: staffDisplayName(staff),
          }))}
          onAdd={props.onAdd}
          renderSuggestion={renderSuggestion}
        />
      </MentionsInput>
    </Ref>
  );
}
