import React, { useState, useEffect } from "react";
import { ProfileType } from "../../types/LoginType";
import { GET_USERPROFILE_DETAIL } from "../../api/apiPath";
import { get } from "../../api/apiRequest";
import { ProfileDetails } from "../Profile";
import ProfileDetailDummmy from "./ProfileDetailDummy";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { equals } from "ramda";

interface ProfileInfoProps {
  setFieldValue: Function;
  profile: ProfileType;
}

interface ProfileFieldMappingType {
  [key: string]: string;
}

const ProfileInfoDetail = (props: ProfileInfoProps) => {
  const { setFieldValue, profile } = props;
  const company = useAppSelector((s) => s.company, equals);
  const loginDispatch = useAppDispatch();
  const [loading, isLoading] = useState(true);

  const getProfileDetail = (profileId: string) => {
    if (company) {
      get(GET_USERPROFILE_DETAIL.replace("{id}", profileId), { param: {} })
        .then((profileResult: ProfileType) => {
          if (profileId === profileResult.id) {
            if (
              JSON.stringify(profileResult.customFields) !==
              JSON.stringify(profile.customFields)
            ) {
              loginDispatch({
                type: "PROFILE_UPDATED",
                profile: {
                  ...profile,
                  emailAddress: profileResult.emailAddress,
                  smsUser: profileResult.smsUser,
                  customFields: profileResult.customFields,
                },
              });
            }
          }
        })
        .catch((e) => {
          console.error(`Retrieve profile detail error ${e}`);
        })
        .finally(() => {
          isLoading(false);
        });
    }
  };

  useEffect(() => {
    if (profile?.id && company?.id) {
      isLoading(true);
      getProfileDetail(profile.id);
    }
  }, [profile?.id, company?.id]);

  const setContactFieldValue = (fields: ProfileFieldMappingType) => {
    setFieldValue({
      firstName: profile.firstName,
      lastName: profile.lastName,
      name:
        (profile.lastName && `${profile.firstName} ${profile.lastName}`) ||
        `${profile.firstName}`,
      ...fields,
    });
  };
  return loading ? (
    <ProfileDetailDummmy />
  ) : (
    <ProfileDetails
      updateCustomFields={setContactFieldValue}
      isEditButtonEnabled={true}
    />
  );
};
export default ProfileInfoDetail;
