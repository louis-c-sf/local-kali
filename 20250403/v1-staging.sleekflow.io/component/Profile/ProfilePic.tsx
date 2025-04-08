import React, { useEffect, useState } from "react";
import { Header, Image } from "semantic-ui-react";
import Avatar from "react-avatar";
import { Link } from "react-router-dom";
import { channelPhoneNumberImage } from "../Chat/ChatGroupItemImage/ChatGroupItemImage";
import lastChannelName from "../Chat/utils/lastChannelName";
import { useAppSelector } from "../../AppRootContext";
import styles from "./ProfilePic.module.css";
import { ProfileClickableName } from "../Chat/ChatHeader/ChatProfileName";
import { equals } from "ramda";

interface ProfilePicProps {
  pic: string;
  name: string;
  address: string;
  jobTitle?: string;
  company?: string;
  id: string;
  hasIcon?: boolean;
  large?: boolean;
}

export default function ProfilePic(props: ProfilePicProps) {
  const { hasIcon = false, large, name, jobTitle } = props;
  const [profileName, setProfileName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [profile, company] = useAppSelector(
    (s) => [s.profile, s.company],
    equals
  );
  const companyName = props.company;
  const width = large ? "60px" : "32px";

  useEffect(() => {
    const phoneNumberImage = channelPhoneNumberImage(
      name,
      lastChannelName(profile.customFields, company)
    );
    setProfileName(name);
    setProfilePic(props.pic ? props.pic : phoneNumberImage || "");
  }, [props.name, props.pic]);

  let jobTitleText = "";
  if (jobTitle) {
    jobTitleText = companyName ? `${jobTitle} at ${companyName}` : jobTitle;
  } else if (companyName) {
    jobTitleText = companyName;
  }

  return (
    <div className={`${styles.wrap} ${props.large ? styles.large : ""}`}>
      <div className={styles.pic}>
        {profilePic ? (
          <Image src={profilePic} avatar />
        ) : (
          <Avatar name={name} size={width} round={true} maxInitials={2} />
        )}
      </div>
      <div className={styles.info}>
        <ProfileClickableName
          hasIcon={hasIcon}
          profileId={profile.id}
          profileName={profileName}
        />
      </div>
    </div>
  );
}
