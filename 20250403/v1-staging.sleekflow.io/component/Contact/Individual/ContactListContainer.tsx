import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "semantic-ui-react";
import { ContactListType } from "../../../types/ContactType";
import ContactListRow from "./../Lists/ContactListRow";
import { AddToListPopup } from "../Lists/AddToListPopupGridAction";
import useImportedLists from "../../../container/Contact/Imported/useImportedLists";
import { Button } from "../../shared/Button/Button";
import { append, complement } from "ramda";
import { UserProfileGroupType } from "../../../container/Contact/Imported/UserProfileGroupType";
import { useRemoveContactsFromList } from "../../../container/Contact/Imported/useRemoveContactsFromList";
import styles from "./ContactListContainer.module.css";

const ContactListContainer = (props: {
  profileId: string;
  contactLists: ContactListType[] | undefined;
}) => {
  const { contactLists = [], profileId } = props;
  const { t } = useTranslation();
  const [showAddPopup, setShowAddPopup] = useState(false);
  const importedLists = useImportedLists();
  const removeFromList = useRemoveContactsFromList();
  const [listsAdded, setListsAdded] = useState<ContactListType[]>([]);
  const [listsRemoved, setListsRemoved] = useState<ContactListType[]>([]);
  const [listsNewOptions, setListsNewOptions] = useState<ContactListType[]>([]);
  const [loading, setLoading] = useState(false);

  const listsUnified = [...contactLists, ...listsAdded]
    .reduce<ContactListType[]>((acc, next) => {
      if (acc.some(matchingList(next))) {
        return acc;
      }

      return [...acc, next];
    }, [])
    .filter((item) => !listsRemoved.some(matchingList(item)));
  listsUnified.sort((a, b) => a.listName.localeCompare(b.listName));

  const getRemoveListHandler = (list: ContactListType) => async () => {
    setLoading(true);
    const prevValue = listsRemoved;
    try {
      setListsRemoved(append(list));
      await removeFromList.remove([profileId], String(list.id));
    } catch (e) {
      setListsRemoved(prevValue);
    } finally {
      setListsAdded((lists) => lists.filter(complement(matchingList(list))));
      setLoading(false);
    }
  };

  async function handleConnectList(newList: ContactListType) {
    setLoading(true);
    const prevLists = listsAdded;
    setListsAdded(append(newList));

    try {
      setListsRemoved((lists) =>
        lists.filter(complement(matchingList(newList)))
      );
    } catch (e) {
      setListsAdded(prevLists);
    } finally {
      setLoading(false);
    }
  }

  const addListOptions = importedLists.lists
    .map(toContactList)
    .filter((list) => !listsUnified.some(matchingList(list)))
    .concat(listsNewOptions);

  return (
    <>
      <div className={`container`}>
        <Header as={"h4"} className={styles.title}>
          {t("chat.lists.header")}
          <Button
            content={t("form.button.add")}
            onClick={() => setShowAddPopup(true)}
            disabled={loading}
          />
        </Header>
        <div>
          {listsUnified.map((list, index: number) => {
            return (
              <ContactListRow
                list={list}
                key={index}
                onRemove={getRemoveListHandler(list)}
                disabled={loading}
              />
            );
          })}
        </div>
      </div>
      {showAddPopup && (
        <AddToListPopup
          selectedContactsCount={1}
          importedLists={addListOptions}
          selectAllIds={async () => [profileId]}
          appendNewList={(list) => {
            setListsNewOptions(
              append({ id: list.id, listName: list.importName })
            );
          }}
          showModal={showAddPopup}
          setShowModal={setShowAddPopup}
          onListConnected={handleConnectList}
        />
      )}
    </>
  );
};
export default ContactListContainer;

function matchingList(list: ContactListType) {
  return (sample: ContactListType) => list.id === sample.id;
}

function toContactList(list: UserProfileGroupType) {
  return {
    id: list.id,
    listName: list.importName,
  };
}
