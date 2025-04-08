import React, { useEffect, useReducer, useState } from "react";
import { Dimmer, Loader } from "semantic-ui-react";
import CompanyType from "../../../types/CompanyType";
import Helmet from "react-helmet";
import GridHeader from "../../../component/shared/grid/GridHeader";
import SettingStaffTable from "./SettingsStaffTable";
import SettingAccount from "../../../container/Settings/Profile/SettingAccount";
import { isSuperAdministrator } from "../../../component/Settings/helpers/AccessRulesGuard";
import { complement } from "ramda";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router";
import { fetchCompany } from "../../../api/Company/fetchCompany";
import { InfoTooltip } from "../../../component/shared/popup/InfoTooltip";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import { useCompanyStaff } from "../../../api/User/useCompanyStaff";
import { AddUserFeature } from "../../../component/Settings/AddUserModal/AddUserFeature";
import { defaultState, settingUserReducer } from "./hooks/settingUserReducer";
import { SettingUserContext } from "./hooks/SettingUserContext";
import { formatQrCodeInfoRequestParam } from "../helpers/formatQrCodeInfoRequestParam";
import { RequestParamType } from "../types/SettingTypes";
import { postWithExceptions } from "../../../api/apiRequest";
import { POST_PERSONAL_WHATSAPP_QR_CODE } from "../../../api/apiPath";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { useFetchWhatsappQrCode } from "../../../container/Settings/hooks/useFetchWhatsappQrCode";
import { handleSelectedDownload } from "../helpers/downloadQrCode";
import HeaderPrependActions from "../component/HeaderPrependActions";
import useRouteConfig from "../../../config/useRouteConfig";
import { useFeaturesGuard } from "../hooks/useFeaturesGuard";
import { DisabledInviteUserButtonWithToolTip } from "component/Header/InviteUserButton/InviteUserButton";

interface StaffUserManagementType {
  company: CompanyType | undefined;
  updateMenuItem: Function;
  userId?: string;
}

export default function SettingUserManagment(props: StaffUserManagementType) {
  const { updateMenuItem, userId } = props;
  const loginDispatch = useAppDispatch();
  const [qrCodeInfoState, dispatchQrCodeInfo] = useReducer(
    settingUserReducer,
    defaultState()
  );

  const [loading, setLoading] = useState(true);
  const [isRemovedUser, setIsRemovedUser] = useState(false);

  const [deleteConfirmationRequested, setDeleteConfirmationRequested] =
    useState(false);
  const location = useLocation<{ openInviteUserModal: boolean }>();
  const { openInviteUserModal } = location.state ?? {};
  const [isAddUserActive, setIsAddUserActive] = useState(false);
  const { routeTo } = useRouteConfig();
  const history = useHistory();
  const { staffList, refresh: refreshStaff } = useCompanyStaff();
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();
  const { fetchQrCodeInfo } = useFetchWhatsappQrCode();
  const featureGuard = useFeaturesGuard();
  const isAllowedRegion = useAppSelector((s) =>
    featureGuard.isRegionAllowedToInviteUser(s.userWorkspaceLocation || "")
  );
  const isCompanyAllowedToInviteUser =
    featureGuard.isCompanyAllowedToInviteUser();
  const isQRCodeMappingEnabled = useAppSelector(
    (s) => s.company?.isQRCodeMappingEnabled
  );

  const saveUserQRCodeInfo = async (
    staffId: string,
    param: RequestParamType
  ) => {
    try {
      return await postWithExceptions(
        POST_PERSONAL_WHATSAPP_QR_CODE.replace("{staffId}", staffId),
        {
          param,
        }
      );
    } catch (e) {
      console.error("POST_PERSONAL_WHATSAPP_QR_CODE error: ", e);
    }
  };

  const handleClickSave = async () => {
    const requestParam = formatQrCodeInfoRequestParam({
      channels: qrCodeInfoState.channels,
      type: "user",
    });
    try {
      dispatchQrCodeInfo({ type: "START_BUTTON_LOADING" });
      await Promise.all(
        requestParam.map((param) => {
          const staffId = param.staffId;
          delete param["staffId"];
          saveUserQRCodeInfo(staffId, param);
        })
      );
      flash(t("settings.whatsappQrCode.common.flashMsg.save.teams"));
      await refreshStaffList();
      dispatchQrCodeInfo({ type: "UPDATE_CHANNELS", channels: [] });
    } catch (e) {
      console.error("update setting user e: ", e);
    } finally {
      dispatchQrCodeInfo({ type: "END_BUTTON_LOADING" });
    }
  };

  const selectedDownloadResolve = () => {
    flash(
      t("settings.whatsappQrCode.common.flashMsg.download.user", {
        count: qrCodeInfoState.checkableItems.checkedIds.length,
      })
    );
    dispatchQrCodeInfo({ type: "UNCHECKED_ALL" });
  };

  useEffect(() => {
    if (qrCodeInfoState.channels.length !== 0) {
      dispatchQrCodeInfo({ type: "ENABLE_SAVE" });
    } else {
      dispatchQrCodeInfo({ type: "DISABLE_SAVE" });
    }
  }, [qrCodeInfoState.channels]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      refreshStaffList(),
      fetchCompany()
        .then((res) => {
          loginDispatch({ type: "ADD_COMPANY", company: { ...res } });
        })
        .catch((error) => {
          console.error("GET_COMPANY", error);
        }),
    ]).then((_) => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (isRemovedUser) {
      refreshStaffList();
      setIsRemovedUser(false);
    }
  }, [isRemovedUser]);

  useEffect(() => {
    if (openInviteUserModal) {
      setIsAddUserActive(true);
      history.push({
        pathname: routeTo("/settings/usermanagement"),
        state: {
          openInviteUserModal: false,
        },
      });
    }
  }, [openInviteUserModal]);

  function activateAddUser() {
    if (process.env.REACT_APP_ENABLE_NEW_SIGNUP === "false") {
      if (isAllowedRegion) {
        setIsAddUserActive(true);
      } else {
        return window.open(
          "https://docs.google.com/forms/d/e/1FAIpQLSex-zmkqoDI9w5umwRLsGEVbbaXYvMeWL_fKzuCYAlAoAIZdg/viewform",
          "_blank"
        );
      }
    } else {
      setIsAddUserActive(true);
    }
  }

  async function refreshStaffList() {
    setLoading(true);
    try {
      const staffList = await refreshStaff();
      dispatchQrCodeInfo({
        type: "CHECKABLE_IDS_UPDATED",
        newIdList: staffList?.map((staff) => staff.userInfo.id) ?? [],
      });
    } catch (e) {
      console.error("refreshItems", e);
    } finally {
      setLoading(false);
    }
  }

  const pageTitle = t("nav.menu.settings.users");

  return (
    <SettingUserContext.Provider
      value={{
        state: qrCodeInfoState,
        dispatch: dispatchQrCodeInfo,
      }}
    >
      <Dimmer.Dimmable
        dimmed
        className={"main-primary-column content user-management"}
      >
        {loading ? (
          <Dimmer active={loading} inverted>
            <Loader inverted />
          </Dimmer>
        ) : (
          (userId && (
            <SettingAccount
              setIsRemovedUser={setIsRemovedUser}
              canRemoved={
                !(staffList.length > 0 && staffList[0].userInfo.id === userId)
              }
              userId={userId}
            />
          )) || (
            <div>
              <GridHeader
                selectedItemsCount={
                  qrCodeInfoState.checkableItems.checkedIds.length
                }
                deleteLoading={false}
                onDeleteClick={() => null}
                deleteEnabled={false}
                title={t("nav.menu.settings.users")}
                deleteConfirmationRequested={deleteConfirmationRequested}
                requestDeleteConfirmation={setDeleteConfirmationRequested}
                prependActions={
                  <HeaderPrependActions
                    selectedItemsCount={
                      qrCodeInfoState.checkableItems.checkedIds.length
                    }
                    optionChanged={qrCodeInfoState.isEdit}
                    handleClickSave={handleClickSave}
                    isLoading={qrCodeInfoState.buttonLoading}
                    handleSelectedDownload={() =>
                      handleSelectedDownload({
                        type: "user",
                        checkedIds: qrCodeInfoState.checkableItems.checkedIds,
                        fetchQrCodeInfo,
                        resolve: selectedDownloadResolve,
                      })
                    }
                    hasSaveButton={
                      (qrCodeInfoState.isEdit && isQRCodeMappingEnabled) ||
                      false
                    }
                    hasDownloadButton={isQRCodeMappingEnabled ?? false}
                  />
                }
              >
                {process.env.REACT_APP_ENABLE_NEW_SIGNUP === "false" ? (
                  isAllowedRegion && isCompanyAllowedToInviteUser ? (
                    <InfoTooltip
                      placement={"left"}
                      children={t("settings.tooltip.users.invite")}
                      trigger={
                        <span
                          className={`ui button primary`}
                          onClick={activateAddUser}
                        >
                          {t("settings.user.button.invite")}
                        </span>
                      }
                    />
                  ) : (
                    <DisabledInviteUserButtonWithToolTip>
                      {!isCompanyAllowedToInviteUser
                        ? t("account.inviteUser.companyNotAllowToInviteTooltip")
                        : t("account.inviteUser.notAllowToInviteTooltip")}
                    </DisabledInviteUserButtonWithToolTip>
                  )
                ) : (
                  <InfoTooltip
                    placement={"left"}
                    children={t("settings.tooltip.users.invite")}
                    trigger={
                      <span
                        className={`ui button primary`}
                        onClick={activateAddUser}
                      >
                        {t("settings.user.button.invite")}
                      </span>
                    }
                  />
                )}
              </GridHeader>
              <div className={`hide-scrollable-table`}>
                <div className="stick-wrap">
                  <SettingStaffTable
                    staffList={staffList.filter(
                      complement(isSuperAdministrator)
                    )}
                    updateMenuItem={updateMenuItem}
                    loading={loading}
                  />
                </div>
              </div>
              <Helmet title={t("nav.common.title", { page: pageTitle })} />
            </div>
          )
        )}
        {isAddUserActive && (
          <AddUserFeature
            hide={() => setIsAddUserActive(false)}
            refreshStaff={refreshStaffList}
          />
        )}
      </Dimmer.Dimmable>
    </SettingUserContext.Provider>
  );
}
