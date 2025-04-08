import React, { useEffect, useReducer, useState } from "react";
import { PostLogin } from "../../../component/Header";
import { Dimmer, Loader, Message } from "semantic-ui-react";
import IndividualSidebar from "./IndividualSidebar";
import { RouteComponentProps } from "react-router-dom";
import { GET_USERPROFILE_DETAIL } from "../../../api/apiPath";
import { get } from "../../../api/apiRequest";
import ProfileContent from "./ProfileContent";
import { ProfileType } from "../../../types/LoginType";
import IndividualProfileType, {
  IndividualProfileActionType,
} from "../../../types/IndividualProfileType";
import IndividualProfileContext from "../../../context/IndividualProfileContext";
import NewContact, { FieldValue } from "../NewContact/NewContact";
import ChannelInfoContainer from "../../../container/ChannelInfoContainer";
import { LabelsManagementContainer } from "../../../container/Chat/LabelsManagementContainer";
import { useTranslation } from "react-i18next";
import { fetchStaffList } from "../../../api/User/fetchStaffList";
import Helmet from "react-helmet";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import ContactListContainer from "./ContactListContainer";
import { defaultAssigee } from "../../../types/state/inbox/AssigneeType";
import { equals } from "ramda";

function IndividualProfileReducer(
  state: IndividualProfileType,
  action: IndividualProfileActionType
) {
  switch (action.type) {
    case "UPDATE_REMARKS":
      return { ...state, isDisplayMessage: action.isDisplayMessage };
    default:
      return state;
  }
}

export async function getProfileDetail(id: string) {
  const profileDetail: ProfileType = await get(
    GET_USERPROFILE_DETAIL.replace("{id}", id),
    { param: {} }
  );

  return profileDetail;
}

function IndividualProfile({ match }: RouteComponentProps<any>) {
  const { id } = match.params;
  const [profile, staffList] = useAppSelector(
    (s) => [s.profile, s.staffList],
    equals
  );

  const loginDispatch = useAppDispatch();
  const editContactForm = useAppSelector((s) => s.inbox.editContactForm);
  const [loading, isLoading] = useState(true);
  const individualProfileDefault: IndividualProfileType = {
    isDisplayMessage: false,
  };
  const [individualProfile, individualProfileDispatch] = useReducer(
    IndividualProfileReducer,
    individualProfileDefault
  );
  const [isDisplayMessage, setIsDisplayMessage] = useState(
    individualProfile.isDisplayMessage
  );
  const [visibleNewContact, isVisibleNewContact] = useState(false);
  const [fieldValue, setFieldValue] = useState<FieldValue>({});
  const [fieldUpdated, setFieldUpdated] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    loginDispatch({
      type: "CREATE_PROFILE",
      profile: defaultAssigee.conversations[0],
    });
  }, []);

  useEffect(() => {
    isLoading(true);
    setIsDisplayMessage(individualProfile.isDisplayMessage);
    refreshProfile();
  }, [fieldUpdated, id]);

  useEffect(() => {
    isVisibleNewContact(editContactForm.visible);
  }, [editContactForm.visible]);

  useEffect(() => {
    if (!visibleNewContact) {
      loginDispatch({
        type: "INBOX.CONTACT_FORM.HIDE",
      });
    }
  }, [visibleNewContact]);

  async function refreshProfile() {
    async function loadProfile() {
      try {
        const profileDetail = await getProfileDetail(id);
        loginDispatch({
          type: "CREATE_PROFILE",
          profile: profileDetail,
        });
      } catch (e) {
        throw new Error(`loadProfile ${e}`);
      }
    }

    async function loadStaff() {
      try {
        return await fetchStaffList(loginDispatch);
      } catch (e) {
        throw new Error(`loadStaff ${e}`);
      }
    }

    try {
      await Promise.all([loadProfile(), loadStaff()]);
    } catch (e) {
      console.error(e);
    } finally {
      isLoading(false);
    }
  }

  const pageTitle = t("nav.menu.individualContact");

  return (
    <>
      <Dimmer active={loading} inverted>
        {" "}
        <Loader inverted></Loader>
      </Dimmer>
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
      <div className="post-login">
        <PostLogin selectedItem={"Contacts"}>
          <>
            <Message
              className={`notification-message ${
                (isDisplayMessage && "visible") || ""
              }`}
              floating
              content={t("profile.individual.message.noteCreated")}
            />
            <div className="profile main">
              <IndividualSidebar
                visibleSidebar={visibleNewContact}
                fieldValue={fieldValue}
                setFieldValue={setFieldValue}
                setVisible={isVisibleNewContact}
                profileId={id}
              />
              <IndividualProfileContext.Provider
                value={{ ...individualProfile, individualProfileDispatch }}
              >
                <ProfileContent
                  visibleNewContact={visibleNewContact}
                  pic={profile ? profile.displayProfilePicture : ""}
                />

                <div className="profile-widgets">
                  <ChannelInfoContainer customFieldValues={fieldValue} />
                  <LabelsManagementContainer profile={profile} />
                  <ContactListContainer
                    contactLists={profile.contactLists}
                    profileId={profile.id}
                  />
                </div>

                <NewContact
                  profileFields={fieldValue}
                  contactCreate={() => setFieldUpdated(true)}
                  visible={visibleNewContact}
                  hideForm={() => isVisibleNewContact(false)}
                  staffList={staffList}
                  profile={profile}
                  fieldFocusedName={editContactForm.focusField}
                />
              </IndividualProfileContext.Provider>
            </div>
          </>
        </PostLogin>
      </div>
    </>
  );
}

export default IndividualProfile;
