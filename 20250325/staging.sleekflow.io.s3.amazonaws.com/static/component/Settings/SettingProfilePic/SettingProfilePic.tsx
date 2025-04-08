import React, { useEffect, useState } from "react";
import { Dimmer, Image, Loader } from "semantic-ui-react";
import { deleteMethod, post, URL } from "../../../api/apiRequest";
import {
  DELETE_COMPANY_PIC,
  DELETE_COMPANY_STAFF_PIC,
  GET_COMPANY_ICON,
  GET_STAFF_PROFILE_PIC,
  POST_COMPANY_ICON,
  POST_COMPANY_STAFF_PIC,
} from "../../../api/apiPath";
import CompanyType from "../../../types/CompanyType";
import Avatar from "react-avatar";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import produce from "immer";
import { useTranslation } from "react-i18next";
import { includesUser } from "../../../container/Settings/Profile/SettingAccount";
import { useAccessRulesGuard } from "../hooks/useAccessRulesGuard";
import { matchesStaffId } from "../../../types/TeamType";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import { equals, pick } from "ramda";
import { StaffType } from "../../../types/StaffType";
import PasswordResetButton from "./PasswordResetButton";
import useRouteConfig from "config/useRouteConfig";
import { useGetUserPicUrl } from "api/User/useGetUserPicUrl";

interface SettingProfilePic {
  profilePicId: string;
  staffId: string;
  type: string;
  userName?: string;
  updatePicUrl?: any;
}
const UPLOAD_FILE_SIZE_LIMIT = 10 * 1024 * 1024; // (10MB = 10 * 1024 * 1024 bytes)

export default function SettingProfilePic(props: SettingProfilePic) {
  const { profilePicId, staffId, type, updatePicUrl } = props;
  // const fileReader = new FileReader();
  const { staffList, user, settings, loggedInUserDetail } = useAppSelector(
    pick(["user", "settings", "staffList", "loggedInUserDetail"]),
    equals
  );
  const { routeTo } = useRouteConfig();
  const loginDispatch = useAppDispatch();
  const [fileContent, setFileContent] = useState("");
  const [prefix, setPrefix] = useState("");
  const [loading, isLoading] = useState(false);
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();
  const accessGuard = useAccessRulesGuard();
  const teams = settings.teamsSettings.teams.filter(includesUser(staffId));
  const name =
    loggedInUserDetail?.userInfo.displayName ??
    `${loggedInUserDetail?.userInfo.firstName ?? ""} ${
      loggedInUserDetail?.userInfo.lastName ?? ""
    }`;
  const uploadFiles = async (e: React.FormEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const filesList = e.currentTarget.files && e.currentTarget.files;
    const formData = new FormData();
    isLoading(true);
    if (filesList !== null) {
      formData.append("files", filesList[0]);
      if (type === "company") {
        try {
          const result: CompanyType = await post(
            POST_COMPANY_ICON.replace("{companyId}", staffId),
            {
              param: formData,
              header: { "Content-Type": "application/x-www-form-urlencoded" },
            }
          );
          setFileContent(
            (result.companyIconFile &&
              result.companyIconFile.profilePictureId) ||
              ""
          );
          if (updatePicUrl) {
            updatePicUrl(
              `${URL}${prefix}/${
                (result.companyIconFile &&
                  result.companyIconFile.profilePictureId) ||
                ""
              }`
            );
          }
        } catch (error) {
          console.error(`POST_COMPANY_ICON`, error);
        } finally {
          isLoading(false);
        }
      } else {
        if (filesList[0].size > UPLOAD_FILE_SIZE_LIMIT) {
          flash(t("flash.settings.photo.sizeExceeded"));
          return;
        }
        try {
          const result: StaffType = await post(
            POST_COMPANY_STAFF_PIC.replace("{staffid}", staffId),
            {
              param: formData,
              header: { "Content-Type": "application/x-www-form-urlencoded" },
            }
          );
          setFileContent(
            (result.profilePicture && result.profilePicture.profilePictureId) ||
              ""
          );
          const foundIndex = staffList.findIndex(
            (staff) => staff.userInfo.id === staffId
          );
          const updatedStaffList = produce(staffList, (draftState) => {
            draftState[foundIndex] = { ...draftState[foundIndex], ...result };
          });
          loginDispatch({
            type: "UPDATE_STAFF_LIST",
            staffList: [...updatedStaffList],
          });
        } catch (error) {
          console.error(`POST_COMPANY_STAFF_PIC`, error);
        } finally {
          isLoading(false);
        }
      }
    }
  };
  const getProfilePic = useGetUserPicUrl(loggedInUserDetail);
  useEffect(() => {
    if (type === "company") {
      setPrefix(`${GET_COMPANY_ICON}`);
    }
    setFileContent(profilePicId);
    if (updatePicUrl) {
      updatePicUrl(`${URL}${GET_COMPANY_ICON}/${profilePicId}`);
    }
  }, [JSON.stringify(props)]);

  const deletePhoto = async () => {
    isLoading(true);
    if (type === "company") {
      try {
        await deleteMethod(DELETE_COMPANY_PIC.replace("{companyId}", staffId), {
          param: {},
        });
        setFileContent("");
        flash(t("flash.settings.photo.removed"));
      } catch (error) {
        console.error("DELETE_COMPANY_PIC", error);
      }
      isLoading(false);
    } else {
      try {
        const result: StaffType = await deleteMethod(
          DELETE_COMPANY_STAFF_PIC.replace("{staffId}", staffId),
          { param: {} }
        );
        setFileContent("");
        const foundIndex = staffList.findIndex(
          (staff) => staff.userInfo.id === staffId
        );
        flash(t("flash.settings.photo.removed"));
        const updatedStaffList = produce(staffList, (draftState) => {
          draftState[foundIndex] = { ...draftState[foundIndex], ...result };
        });
        loginDispatch({
          type: "UPDATE_STAFF_LIST",
          staffList: [...updatedStaffList],
        });
      } catch (error) {
        console.error("DELETE_COMPANY_STAFF_PIC", error);
      }
      isLoading(false);
    }
  };
  const isAllowToResetPassword =
    (teams
      .filter((t) => t.teamAdmins.some(matchesStaffId(user?.id)))
      .some((team) => accessGuard.canEditTheTeam(team)) ||
      accessGuard.isAdmin() ||
      user?.id === staffId) &&
    !accessGuard.isSocialLoginUser();
  return (
    <div className="image">
      <Dimmer.Dimmable>
        <Dimmer active={loading} inverted>
          <Loader active />
        </Dimmer>
        {fileContent ? (
          type !== "company" ? (
            <Image circular src={getProfilePic} />
          ) : (
            <Image src={`${URL}${prefix}/${fileContent}`} />
          )
        ) : (
          <Avatar name={name} size={"32px"} round={true} maxInitials={2} />
        )}
      </Dimmer.Dimmable>
      <div className="upload">
        <div className="action">
          <span className="link2">
            {t("account.form.photo.upload")}
            <input
              className="fileupload"
              type="file"
              accept="image/*"
              onChange={uploadFiles}
            />
          </span>
          {fileContent && (
            <>
              <span className="p2">.</span>
              <span className="link2" onClick={deletePhoto}>
                {t("account.form.photo.remove")}
              </span>
            </>
          )}
        </div>
        {type === "company" ? (
          <div className="description">
            <span>{t("account.form.photo.hint.logo")}</span>
          </div>
        ) : (
          <>
            <div className="description">
              <span>{t("account.form.photo.hint.teammates")}</span>
            </div>
            {isAllowToResetPassword && <PasswordResetButton />}
          </>
        )}
      </div>
    </div>
  );
}
