import React, { useEffect, useState } from "react";
import { Image } from "semantic-ui-react";
import { getWithExceptions, URL as APILINK } from "../../api/apiRequest";
import Avatar from "react-avatar";
import { GET_COMPANY_STAFF_PIC } from "../../api/apiPath";
import styles from "./UserProfileDropdown.module.css";

export default function AccountPic(props: {
  userName: string;
  profilePic: string;
}) {
  const { userName, profilePic } = props;
  const [pic, setPic] = useState("");
  useEffect(() => {
    if (!profilePic) {
      return;
    }
    getWithExceptions(`${APILINK}${GET_COMPANY_STAFF_PIC}/${profilePic}`, {
      config: {
        responseType: "blob",
      },
      param: {},
    }).then((res) => {
      const imageBlob = new Blob([res.data], {
        type: res.type,
      });
      setPic(URL.createObjectURL(res));
    });
  }, [profilePic]);

  return (
    <>
      {userName &&
        (profilePic ? (
          <Image size={"tiny"} avatar src={pic} />
        ) : (
          <div className={styles.avatarContainer}>
            <Avatar
              name={userName}
              maxInitials={2}
              round={true}
              className={styles.avatar}
            />
          </div>
        ))}
    </>
  );
}
