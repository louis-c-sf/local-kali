import React, { useRef, useState } from "react";
import { postWithExceptions } from "../../../api/apiRequest";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import {
  Button,
  Dropdown,
  Grid,
  GridColumn,
  GridRow,
  Icon,
  Modal,
} from "semantic-ui-react";
import { FieldError } from "../../shared/form/FieldError";
import { UserProfileGroupType } from "../../../container/Contact/Imported/UserProfileGroupType";
import { submitCreateList } from "../../../api/Contacts/submitCreateList";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../../shared/popup/InfoTooltip";
import useImportedLists from "../../../container/Contact/Imported/useImportedLists";
import { useSignalRGroup } from "../../SignalR/useSignalRGroup";
import { TaskResponseType } from "../../Header/ProgressBar/types/TaskType";
import { useAppSelector } from "../../../AppRootContext";
import styles from "./AddToListPopupGridAction.module.css";
import useRouteConfig from "config/useRouteConfig";
import { ContactListType } from "../../../types/ContactType";

interface AddToListPopupProps {
  selectedContactsCount: number;
  importedLists: ContactListType[];
  selectAllIds: () => Promise<string[]>;
  appendNewList: (list: UserProfileGroupType) => void;
  onListConnected?: (list: ContactListType) => void;
}

export function AddToListPopupGridAction(props: AddToListPopupProps) {
  const { importedLists, selectedContactsCount, selectAllIds, appendNewList } =
    props;
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();
  return (
    <>
      <InfoTooltip
        placement={"bottom"}
        children={t("profile.tooltip.action.addToList")}
        trigger={
          <Button
            disabled={props.selectedContactsCount === 0}
            className={styles.button}
            onClick={
              props.selectedContactsCount === 0
                ? undefined
                : () => {
                    setShowModal(true);
                  }
            }
          >
            {t("profile.form.addToList.button.add")}
          </Button>
        }
      />

      <AddToListPopup
        selectedContactsCount={selectedContactsCount}
        importedLists={importedLists}
        setShowModal={setShowModal}
        showModal={showModal}
        selectAllIds={selectAllIds}
        appendNewList={appendNewList}
      />
    </>
  );
}

export function AddToListPopup(
  props: AddToListPopupProps & {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    fetchProfileDetails?: () => Promise<void>;
  }
) {
  const {
    setShowModal,
    showModal,
    selectAllIds,
    appendNewList,
    fetchProfileDetails,
  } = props;
  const signalRGroupName = useAppSelector((s) => s.user?.signalRGroupName);
  const [name, setName] = useState("");
  const taskId = useRef<number>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [listId, setListId] = useState<number>();
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();
  const { refresh } = useImportedLists();
  const { routeTo } = useRouteConfig();

  const listsDropdownOptions = props.importedLists.map((list) => {
    return {
      value: list.id,
      text: list.listName,
    };
  });

  async function createList(name: string) {
    setPending(true);
    try {
      const newList = await submitCreateList(name, []);
      appendNewList(newList);
      if (props.onListConnected) {
        props.onListConnected({ id: newList.id, listName: newList.importName });
      }
      return newList;
    } catch (e) {
      console.error("createList", e);
    } finally {
      setPending(false);
    }
  }

  async function addToList() {
    if (!listId) {
      return;
    }
    setPending(true);
    setError(``);
    try {
      const ids = await selectAllIds();
      const result: {
        id: number;
        target: { listId: number; importName: string };
      } = await postWithExceptions(
        `/UserProfile/List/${listId}/Add/background`,
        {
          param: {
            GroupListName: name,
            UserProfileIds: ids,
          },
        }
      );
      if (result) {
        taskId.current = result.id;
      }
      if (props.onListConnected) {
        props.onListConnected({
          id: result.target.listId,
          listName: result.target.importName,
        });
      }
      setShowModal(false);
    } catch (e) {
      setError(t("system.error.unknown"));
    } finally {
      setPending(false);
    }
  }

  function closeModal() {
    setShowModal(false);
    setError("");
    setListId(undefined);
  }

  useSignalRGroup(
    signalRGroupName,
    {
      OnBackgroundTaskStatusChange: [
        (store, task: TaskResponseType) => {
          if (task.isCompleted && task.id === taskId.current) {
            flash(
              t("flash.addToList.success", {
                content: `<a class="link2" href="${routeTo(
                  `/contacts/lists/${listId}`,
                  true
                )}">here</a>`,
              })
            );
            refresh();
            fetchProfileDetails && fetchProfileDetails();
          }
        },
      ],
    },
    "AddToListPopup"
  );

  return (
    <>
      <Modal
        open={showModal}
        size={"small"}
        className={"create-form create-contacts-form"}
      >
        <Modal.Header>
          {t("profile.form.addToList.field.list.label")}
          <Icon
            name={"delete"}
            className={"lg"}
            onClick={pending ? undefined : closeModal}
          />
        </Modal.Header>
        <Modal.Content>
          <div className="ui form">
            <div className="field">
              <label>{t("profile.form.addToList.field.list.prompt")}</label>
              <Dropdown
                selection
                search
                selectOnBlur={false}
                options={listsDropdownOptions}
                onChange={(event, props) => {
                  setListId(props.value as number);
                }}
                icon={"search"}
                className={"icon-left"}
                placeholder={t("form.field.search.placeholder.short")}
                upward={false}
                allowAdditions
                additionLabel={t(
                  "profile.form.addToList.field.list.additional"
                )}
                noResultsMessage={t("form.field.dropdown.noResults")}
                value={listId}
                onAddItem={async (event, { value }) => {
                  const list = await createList(value as string);
                  if (list) {
                    setListId(list.id);
                  }
                }}
              />
              <Grid>
                <GridRow textAlign={"center"}>
                  <GridColumn>
                    <FieldError text={error} />
                  </GridColumn>
                </GridRow>
              </Grid>
            </div>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={listId && !pending ? () => addToList() : undefined}
            disabled={!listId}
            loading={pending}
            primary
          >
            {t("form.button.add")}
          </Button>
          <Button onClick={pending ? undefined : closeModal}>
            {t("form.button.cancel")}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}
