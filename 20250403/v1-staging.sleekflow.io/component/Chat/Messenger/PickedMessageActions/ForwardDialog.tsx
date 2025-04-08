import React, { useState } from "react";
import { useProfileDisplayName } from "../../utils/useProfileDisplayName";
import { byLatestMessageCreateDate } from "../../mutators/chatSelectors";
import { useTranslation } from "react-i18next";
import { getQueryMatcher } from "../../../../container/Settings/filters/getQueryMatcher";
import { ProfileType } from "../../../../types/LoginType";
import { equals, innerJoin, reject, uniq } from "ramda";
import { Checkbox, Icon, Input, Modal } from "semantic-ui-react";
import { Button } from "../../../shared/Button/Button";
import ChatGroupItemImage from "../../ChatGroupItemImage/ChatGroupItemImage";
import { useContactsSuggest } from "../../../../api/Contacts/useContactsSuggest";
import { contactDescription } from "../../utils/contactDescription";
import { useAppSelector } from "../../../../AppRootContext";

export function ForwardDialog(props: {
  loading: boolean;
  onSubmit: (chatIds: string[], messageIds: number[]) => Promise<void>;
  onCancel: () => void;
  messageIds: number[];
}) {
  const { loading, onSubmit, messageIds } = props;
  const [checkedIds, setCheckedIds] = useState<Array<string | number>>([]);
  const { profileDisplayName } = useProfileDisplayName();
  const [chats, user] = useAppSelector((s) => [s.chats, s.user]);
  const myChats =
    chats
      ?.filter((c) => c?.assignee?.id === user.id)
      .sort(byLatestMessageCreateDate()) ?? [];

  const { t } = useTranslation();

  const {
    searchResult,
    handleSearchChange,
    loading: searchLoading,
    typedValue,
  } = useContactsSuggest();

  const searchMatcher = getQueryMatcher((chat: ProfileType) => {
    return profileDisplayName(chat);
  });
  const chatsVisible = myChats.filter(searchMatcher(typedValue));

  async function handleForwardSubmit() {
    // send to visible chats only, some checked ones could disappear while searching
    const myChatsToSend = innerJoin(
      (id, chat) => id === chat.id,
      checkedIds,
      chatsVisible
    ).map((id) => String(id));
    const foundChatsToSend = innerJoin(
      (id, result) => id === result.id,
      checkedIds,
      searchResult
    ).map((id) => String(id));

    try {
      await onSubmit(uniq([...myChatsToSend, ...foundChatsToSend]), messageIds);
    } catch (e) {
      console.error("handleForwardSubmit", e);
    }
  }

  function toggleCheck(checked: boolean, profileId: string | number) {
    if (checked) {
      setCheckedIds([...checkedIds, profileId]);
    } else {
      setCheckedIds(reject(equals(profileId), checkedIds));
    }
  }

  return (
    <Modal size={"tiny"} className={"message-forward"} open>
      <Modal.Header>
        <Icon name={"close"} onClick={props.onCancel} />
        <div className="text">
          {t("chat.modal.forward.header", { count: messageIds.length })}
        </div>
      </Modal.Header>
      <Modal.Content className={"light"}>
        <div className={"search-block"}>
          <Input
            type={"text"}
            icon={"search"}
            loading={searchLoading}
            placeholder={t("form.prompt.search")}
            fluid
            value={typedValue}
            onChange={(event, data) => {
              handleSearchChange(data.value as string);
            }}
          />
        </div>
        <div className={"chats-block"}>
          {chatsVisible.slice(0, 10).map((chat) => {
            const isSelected = checkedIds.includes(chat.id);

            return (
              <ContactItem
                key={chat.id}
                profileId={chat.id}
                isSelected={isSelected}
                title={profileDisplayName(chat)}
                description={contactDescription(chat)}
                onCheck={toggleCheck}
                loading={loading}
                image={chat.displayProfilePicture}
              />
            );
          })}
          {searchResult
            .filter((r) => !chatsVisible.some((chat) => chat.id === r.id))
            .map((profile) => {
              if (!profile.id) {
                return null;
              }
              const isSelected = checkedIds.includes(profile.id);

              return (
                <ContactItem
                  profileId={profile.id}
                  isSelected={isSelected}
                  title={profile.title}
                  description={profile.description}
                  onCheck={toggleCheck}
                  loading={loading}
                  image={profile.image}
                  key={profile.id}
                />
              );
            })}
          {}
        </div>
        <div className={"actions-block"}>
          <Button
            primary
            loading={loading}
            disabled={loading || checkedIds.length === 0}
            content={t("form.button.send")}
            onClick={handleForwardSubmit}
          />
        </div>
      </Modal.Content>
    </Modal>
  );
}

function ContactItem(props: {
  profileId: string | number;
  image: string | undefined;
  title: string;
  description: string;
  onCheck: (checked: boolean, profileId: string | number) => void;
  isSelected: boolean;
  loading: boolean;
}) {
  const { profileId, title, onCheck, image, description, isSelected, loading } =
    props;

  return (
    <div
      className={`chat-item`}
      onClick={() => {
        onCheck(!isSelected, profileId);
      }}
    >
      <Checkbox
        checked={isSelected}
        disabled={loading}
        onClick={(_, { checked }) => {
          onCheck(!!checked, profileId);
        }}
      />
      <div className="image-block">
        <ChatGroupItemImage
          name={title}
          pic={image || ""}
          channel={"whatsApp"}
        />
      </div>
      <div className="name-block">
        <div className="name">{title}</div>
        <div className="contact">{description}</div>
      </div>
    </div>
  );
}
