import { StaffListType } from "../../component/Chat/types";
import { getWithExceptions, URL as APILINK } from "../apiRequest";
import { GET_COMPANY_STAFF_PIC, GET_STAFF_PROFILE_PIC } from "../apiPath";
import { StaffTypeDeprecated } from "../../types/StaffTypeDeprecated";
import { StaffType } from "../../types/StaffType";
import { useEffect, useState } from "react";

export function useGetUserPicUrl(
  user?: StaffType | StaffListType | StaffTypeDeprecated
): string | undefined {
  const [pic, setPic] = useState("");
  const profilePic = user?.profilePicture?.profilePictureId;
  useEffect(() => {
    if (!user?.profilePicture?.profilePictureId) {
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
  if (!user?.profilePicture?.id) {
    return;
  }
  return pic;
}
