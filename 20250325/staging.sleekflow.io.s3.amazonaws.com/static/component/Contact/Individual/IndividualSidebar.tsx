import React, { useEffect, useState } from "react";
import { ProfileDetails, ProfilePic } from "../../../component/Profile";
import {
  Button,
  Dropdown,
  Grid,
  GridColumn,
  GridRow,
  Modal,
} from "semantic-ui-react";
import { Redirect, useHistory } from "react-router-dom";
import { ProfileType } from "../../../types/LoginType";
import { ProfileFieldsMapping } from "../../../config/ProfileFieldMapping";
import { deleteMethod } from "../../../api/apiRequest";
import { DELETE_USERPROFILE } from "../../../api/apiPath";
import { FieldValue } from "../NewContact/NewContact";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { AddToListPopup } from "../Lists/AddToListPopupGridAction";
import useImportedLists from "../../../container/Contact/Imported/useImportedLists";
import { FieldError } from "../../shared/form/FieldError";
import NewMessageButton from "./NewMessageButton";
import { useProfileDisplayName } from "../../Chat/utils/useProfileDisplayName";
import { Trans, useTranslation } from "react-i18next";
import useRouteConfig from "../../../config/useRouteConfig";
import { useAccessRulesGuard } from "../../Settings/hooks/useAccessRulesGuard";
import { HidableDropdownItemProps } from "../../Chat/Records/ContextMenu";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import { BackLink } from "../../shared/nav/BackLink";
import styles from "./IndividualSidebar.module.css";
import ProfilePicDummy from "../../Profile/ProfilePicDummy";
import { getProfileDetail } from "./IndividualProfile";

interface ContactInfoType {
  [key: string]: string;
}

export default IndividualSidebar;

function IndividualSidebar(props: {
  setVisible: Function;
  setFieldValue: Function;
  fieldValue: FieldValue;
  visibleSidebar: boolean;
  profileId: string;
}) {
  const { setVisible, setFieldValue, visibleSidebar, fieldValue, profileId } =
    props;
  const profile = useAppSelector((s) => s.profile);
  const [pic, setPic] = useState("");
  const [contactInfo, setContactInfo] = useState<ContactInfoType>({});
  const [isBack, goBack] = useState(false);
  const [visible, isVisible] = useState(false);
  const [displayEdit, isDisplayEdit] = useState(false);
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const history = useHistory();
  const loginDispatch = useAppDispatch();
  useEffect(() => {
    setPic(profile.displayProfilePicture || "");
    let contactInfoMapping = {};
    Object.keys(ProfileFieldsMapping).forEach((field) => {
      const fieldValue = getContactInfo(profile, ProfileFieldsMapping[field]);

      if (fieldValue) {
        contactInfoMapping = { ...contactInfoMapping, [field]: fieldValue };
      }
    });
    contactInfoMapping = { ...contactInfoMapping };
    setContactInfo(contactInfoMapping);
  }, [profile && profile.id]);

  const getContactInfo = (profile: ProfileType, field: string | string[]) => {
    if (typeof field === "string") {
      return profile[field];
    } else {
      let messageObj = "";
      for (const key in field) {
        messageObj =
          (messageObj && messageObj[field[key]]) || profile[field[key]];
        if (typeof messageObj === "string") {
          return messageObj;
        }
      }
      return "";
    }
  };

  const toggleVisibleEdit = () => {
    isVisible(!visible);
    setVisible(!visible);
  };

  const handleBack = () => {
    goBack(true);
  };

  const setContactFieldValue = (fields: ContactInfoType) => {
    setFieldValue({
      firstName: profile.firstName,
      lastName: profile.lastName,
      name:
        (profile.lastName && `${profile.firstName} ${profile.lastName}`) ||
        `${profile.firstName}`,
      ...fields,
    });
    isDisplayEdit(true);
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const flash = useFlashMessageChannel();

  async function handleDelete() {
    setDeletePending(true);
    setDeleteError("");
    try {
      await deleteMethod(DELETE_USERPROFILE, {
        param: { UserProfileIds: [profileId] },
      });
      flash(t("flash.profile.deleted"));
      history.replace(routeTo("/contacts"));
      return;
    } catch (e) {
      setDeleteError(t("system.error.unknown"));
    } finally {
      setDeletePending(false);
    }
  }

  const [showAddToList, setShowAddToList] = useState(false);
  const { loading: contactListsLoading, lists, listAdded } = useImportedLists();
  const { profileDisplayName } = useProfileDisplayName();
  const accessRulesGuard = useAccessRulesGuard();

  const options: HidableDropdownItemProps[] = [
    {
      visible: () => true,
      text: t("form.button.edit"),
      onClick: toggleVisibleEdit,
      key: "Edit",
    },
    {
      visible: () => true,
      text: t("profile.individual.actions.addToList"),
      disabled: contactListsLoading,
      onClick: contactListsLoading
        ? undefined
        : () => {
            setShowAddToList(true);
          },
      key: "AddToList",
    },
    {
      visible: () => accessRulesGuard.canDeleteUser(),
      text: t("form.button.delete"),
      onClick: () => {
        setShowDeleteConfirm(true);
      },
      key: "Delete",
    },
  ].filter((c) => c.visible());

  return isBack ? (
    <Redirect to={routeTo("/contacts")} />
  ) : (
    <div className={`profile-sidebar ${(visibleSidebar && "blur") || ""}`}>
      <div className={styles.topSection}>
        <div className={styles.headerItem}>
          <BackLink onClick={handleBack}>
            {t("nav.back", { to: t("nav.menu.contacts") })}
          </BackLink>
          {displayEdit && (
            <Dropdown
              options={options}
              trigger={
                <span className={"trigger-label"}>
                  {t("profile.individual.actions.title")}
                </span>
              }
            />
          )}
        </div>
        <div className={styles.profileInfo}>
          {profile.id ? (
            <ProfilePic
              id={profile.id}
              name={profileDisplayName(profile)}
              address={profile.address}
              company={fieldValue.CompanyName || ""}
              jobTitle={fieldValue.JobTitle || ""}
              pic={pic}
              large
            />
          ) : (
            <ProfilePicDummy large />
          )}
        </div>
        <NewMessageButton />
      </div>
      <div className={`${styles.contentSection} no-scrollbars-y`}>
        <ProfileDetails
          showHeader={true}
          updateCustomFields={setContactFieldValue}
          isEditButtonEnabled={true}
        />
      </div>

      <ConfirmDelete
        open={showDeleteConfirm}
        deletePending={deletePending}
        deleteError={deleteError}
        onClose={() => {
          setDeleteError("");
          setShowDeleteConfirm(false);
        }}
        onConfirm={handleDelete}
      />
      <AddToListPopup
        importedLists={lists.map(({ id, importName }) => ({
          id,
          listName: importName,
        }))}
        selectedContactsCount={1}
        showModal={showAddToList}
        setShowModal={setShowAddToList}
        selectAllIds={async () => [profileId]}
        appendNewList={listAdded}
        fetchProfileDetails={async () => {
          const result = await getProfileDetail(profileId);
          loginDispatch({
            type: "PROFILE_UPDATED",
            profile: result,
          });
        }}
      />
    </div>
  );
}

type ConfirmDeletePropsType = {
  open: boolean;
  deletePending: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deleteError: string;
};

function ConfirmDelete(props: ConfirmDeletePropsType) {
  const { open, deletePending, onClose, onConfirm, deleteError } = props;
  const { t } = useTranslation();
  return (
    <Modal
      open={open}
      closeOnDimmerClick={false}
      dimmer={"inverted"}
      className={"modal-confirm"}
      onClose={deletePending ? undefined : onClose}
    >
      <Modal.Header>
        {t("profile.individual.confirmDelete.header")}
      </Modal.Header>
      <Modal.Content>
        <Trans i18nKey={"profile.individual.confirmDelete.text"}>
          <p>
            if you delete this contact, all related conversations will no longer
            appear in SleekFlow.
            <br />
            Are you sure you wish to do this?
          </p>
        </Trans>
        <Grid>
          <GridRow textAlign={"center"}>
            <GridColumn>
              <FieldError text={deleteError} />
            </GridColumn>
          </GridRow>
        </Grid>
      </Modal.Content>
      <Modal.Actions>
        <Button
          primary
          onClick={deletePending ? undefined : onConfirm}
          loading={deletePending}
        >
          {t("profile.individual.confirmDelete.button.yes")}
        </Button>
        <Button
          onClick={deletePending ? undefined : onClose}
          disabled={deletePending}
        >
          {t("form.button.cancel")}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
