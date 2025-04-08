import React, { useEffect, useRef, useState } from "react";
import TimeZoneComponent from "../../../component/TimeZoneComponent";
import {
  deleteMethod,
  get,
  parseHttpError,
  post,
  postWithExceptions,
} from "../../../api/apiRequest";
import {
  DELETE_COMPANY_STAFF_BY_ID,
  GET_COMPANY_STAFF_BY_ID,
  POST_COMPANY_FIELD,
  POST_COMPANY_NAME,
  POST_COMPANY_STAFF_INFO,
  POST_PERSONAL_WHATSAPP_QR_CODE,
} from "../../../api/apiPath";
import { useHistory } from "react-router-dom";
import { ProfilePictureType } from "../../../types/LoginType";
import {
  Button,
  Divider,
  Dropdown,
  DropdownItemProps,
  DropdownProps,
  Form,
  Header,
  Image,
  Tab,
} from "semantic-ui-react";
import Helmet from "react-helmet";
import SettingProfilePic from "../../../component/Settings/SettingProfilePic/SettingProfilePic";
import { CompanyCustomFieldsType } from "../../../types/CompanyType";
import PhoneNumber from "../../../component/PhoneNumber";
import LockIcon from "../../../assets/images/permission-lock.svg";
import { clone, complement, equals, pick, prop } from "ramda";
import produce from "immer";
import { TeamType } from "../../../types/TeamType";
import { useFlashMessageChannel } from "../../../component/BannerMessage/flashBannerMessage";
import { useAccessRulesGuard } from "../../../component/Settings/hooks/useAccessRulesGuard";
import { staffDisplayName } from "../../../component/Chat/utils/staffDisplayName";
import { useFeaturesGuard } from "../../../component/Settings/hooks/useFeaturesGuard";
import { LockedField } from "../../../component/shared/input/LockedField";
import { Trans, useTranslation } from "react-i18next";
import { InfoTooltip } from "../../../component/shared/popup/InfoTooltip";
import { useCurrentUserDetail } from "../../../api/User/useCurrentUserDetail";
import { useTeams } from "../useTeams";
import { RemoveAccountConfirmModal } from "../../../component/Settings/RemoveAccountConfirmModal";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import { FieldError } from "../../SignIn";
import { StaffType } from "../../../types/StaffType";
import panelStyles from "../Panels.module.css";
import { QrCode } from "./QrCode";
import convertTargetChannelsToChannelConfigured from "../../../component/Settings/helpers/convertTargetChannelsToChannelConfigured";
import useCompanyChannels from "../../../component/Chat/hooks/useCompanyChannels";
import { fetchCompany } from "../../../api/Company/fetchCompany";
import { Security } from "./Security";
import { fetch2FASetting } from "api/User/fetch2FASetting";
import {
  update2FAEnableCompany,
  update2FAEnableRole,
} from "api/User/update2FASetting";
import { SystemPreference } from "./SystemPreference";
import { VersionType, VersionDic } from "./types";
import { useWebVersionRequest } from "../hooks/useWebVersionRequest";
import { isFreeOrFreemiumPlan } from "types/PlanSelectionType";

interface ModifiedStaffType {
  staffId: string;
  email: string;
  updatedUserName: string;
  updatedFirstName: string;
  updatedLastName: string;
  updatedPosition: string;
  timeZoneInfoId?: string;
  profilePicture?: ProfilePictureType;
  updatedStaffRole: string;
  updatedPhoneNumber: string;
  updatedFields: boolean;
  updatedMessage: string;
  teamIds: number[];
}

interface ModifiedCompanyType {
  updatedCompanyName: string;
  updatedPhoneNumber: string;
  updatedTimeZoneInfoId?: string;
  updatedFields: boolean;
}

interface GeneralInfoType {
  userInfo: ModifiedStaffType;
  company: ModifiedCompanyType;
}

interface SettingAccountProps {
  userId?: string;
  canRemoved?: boolean;
  setIsRemovedUser?: Function;
}

type StaffUpdateRequestType = {
  firstName: string;
  lastName: string;
  userName: string;
  phoneNumber: string;
  staffRole: string;
  staffName: string | undefined;
  position: string;
  timeZoneInfoId: string | undefined;
  message: string | undefined;
  teamIds: number[];
};

enum tabEnum {
  "general",
  "qrCode",
  "security",
  "systemPreference",
}

export type Is2FASettingType = {
  isCompanyEnable: boolean;
  isRoleEnable: {
    admin: boolean;
    staff: boolean;
    teamAdmin: boolean;
  };
};

export async function sendUpdateStaffRequest(
  staffId: string,
  staffParam: Partial<StaffUpdateRequestType>
) {
  return await postWithExceptions(
    POST_COMPANY_STAFF_INFO.replace("{staffId}", staffId),
    { param: staffParam }
  );
}

export function includesUser(id: string) {
  return (t: TeamType) => t.members.some((m) => m.userInfo.id === id);
}

export default SettingAccount;

function SettingAccount(props: SettingAccountProps) {
  const { userId, canRemoved, setIsRemovedUser } = props;
  const {
    staffList,
    user,
    company,
    bannerMessage,
    loggedInUserDetail,
    settings,
  } = useAppSelector(
    pick([
      "user",
      "company",
      "staffList",
      "bannerMessage",
      "loggedInUserDetail",
      "settings",
    ]),
    equals
  );

  const loginDispatch = useAppDispatch();

  const isQRCodeMappingEnabled = company?.isQRCodeMappingEnabled;
  const [selectedCompanySize, setSelectedCompanySize] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, isLoading] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const [removeLoading, setRemoveLoading] = useState(false);
  const [userNameError, setUserNameError] = useState("");
  const { refreshCurrentUserDetail } = useCurrentUserDetail();
  const accessRulesGuard = useAccessRulesGuard();

  const { t } = useTranslation();
  const staffRoleChoices = [
    {
      value: "admin",
      text: t("system.user.role.admin.name"),
    },
    {
      value: "TeamAdmin",
      text: t("system.user.role.teamAdmin.name"),
    },
    {
      value: "staff",
      text: t("system.user.role.staff.name"),
    },
  ];

  const [fieldsState, setFieldsState] = useState({
    updatedUserName: {
      placeholder: t("account.form.field.userName.placeholder"),
      isEdit: false,
      originalValue: "",
      fieldType: "staff",
    },
    updatedFirstName: {
      placeholder: t("account.form.field.firstName.placeholder"),
      isEdit: false,
      originalValue: "",
      fieldType: "staff",
    },
    updatedLastName: {
      placeholder: t("account.form.field.lastName.placeholder"),
      isEdit: false,
      originalValue: "",
      fieldType: "staff",
    },
    updatedPosition: {
      placeholder: t("account.form.field.position.placeholder"),
      isEdit: false,
      originalValue: "",
      fieldType: "staff",
    },
    updatedCompanyName: {
      placeholder: t("account.form.field.companyName.placeholder"),
      isEdit: false,
      originalValue: "",
      fieldType: "company",
    },
    companySize: {
      placeholder: t("account.form.field.companySize.placeholder"),
      isEdit: false,
      originalValue: "",
      fieldType: "company",
    },
    updatedStaffRole: {
      placeholder: t("account.form.field.staffRole.placeholder"),
      isEdit: false,
      originalValue: "",
      fieldType: "staff",
    },
    phoneNumber: {
      placeholder: t("account.form.field.phoneNumber.placeholder"),
      isEdit: false,
      originalValue: "",
      fieldType: "staff",
    },
    yourTimeZone: {
      placeholder: t("account.form.field.yourTimeZone.placeholder"),
      isEdit: false,
      originalValue: 0,
      fieldType: "staff",
    },
    updatedMessage: {
      placeholder: t("account.form.field.link.placeholder"),
      isEdit: false,
      originalValue: "",
      fieldType: "staff",
    },
    companyTimeZone: {
      placeholder: t("account.form.field.companyTimeZone.placeholder"),
      isEdit: false,
      originalValue: 0,
      fieldType: "company",
    },
    teamIds: {
      placeholder: t("account.form.field.teamIds.placeholder"),
      isEdit: false,
      originalValue: [] as number[],
      fieldType: "teams",
    },
  });

  const flash = useFlashMessageChannel();
  const history = useHistory();
  const { refreshTeams } = useTeams();
  const [refreshQrCode, setRefreshQrCode] = useState(false);

  const teamChoices: DropdownItemProps[] = settings.teamsSettings.teams.map(
    (team: TeamType, key: number) => {
      return {
        text: team.name,
        key: team.id,
        value: team.id,
      };
    }
  );

  const [updateInfo, setUpdateInfo] = useState<GeneralInfoType>({
    userInfo: {
      staffId: "",
      email: "",
      updatedUserName: "",
      timeZoneInfoId: "",
      updatedFirstName: "",
      updatedLastName: "",
      updatedPosition: "",
      updatedStaffRole: "",
      updatedPhoneNumber: "",
      updatedFields: false,
      updatedMessage: "",
      teamIds: [],
    },
    company: {
      updatedCompanyName: "",
      updatedPhoneNumber: "",
      updatedTimeZoneInfoId: "",
      updatedFields: false,
    },
  });

  const [selectedTab, setSelectedTab] = useState<tabEnum>(tabEnum.general);
  const originalDisplayName = useRef<string>();
  const [displayName, setDisplayName] = useState("");
  const original2FASetting = useRef({
    isCompanyEnable: false,
    isRoleEnable: {
      admin: false,
      staff: false,
      teamAdmin: false,
    },
  });
  const [is2FASetting, set2FASetting] = useState({
    isCompanyEnable: false,
    isRoleEnable: {
      admin: false,
      staff: false,
      teamAdmin: false,
    },
  });
  const [open2FAUpdateModal, setOpen2FAUpdateModal] = useState(false);

  const is2FASettingChanged =
    JSON.stringify(original2FASetting.current) !== JSON.stringify(is2FASetting);
  const [selectedVersion, setSelectedVersion] = React.useState<VersionType>(
    VersionDic.v2
  );
  const originalWebVersionRef = useRef<VersionType>(VersionDic.v2);
  const { getDefaultWebVersion, saveWebVersion } = useWebVersionRequest({
    isLoading,
    selectedVersion,
    setSelectedVersion,
    originalWebVersionRef,
  });
  const webVersionChanged = originalWebVersionRef.current !== selectedVersion;

  const isEdit =
    originalDisplayName.current !== displayName ||
    is2FASettingChanged ||
    webVersionChanged;
  const isPaidPlan = useAppSelector(
    (s) => !isFreeOrFreemiumPlan(s.currentPlan),
    equals
  );
  const panes = [
    {
      menuItem: t("account.form.header.tab.general"),
    },
    isQRCodeMappingEnabled
      ? {
          menuItem: t("account.form.header.tab.qrCode"),
        }
      : {},
    isPaidPlan
      ? {
          menuItem: t("account.form.header.tab.security"),
        }
      : {},
    {
      menuItem: t("account.form.header.tab.systemPreference"),
    },
  ];
  const companyChannels = useCompanyChannels();
  const qrCodeChannel =
    staffList.filter(
      (staff) => staff.userInfo.id === updateInfo.userInfo.staffId
    )[0]?.qrCodeChannel ?? null;
  const matchedCompanyChannel =
    qrCodeChannel !== null
      ? convertTargetChannelsToChannelConfigured(companyChannels, [
          qrCodeChannel,
        ])
      : [];
  const defaultChannel =
    matchedCompanyChannel.length !== 0 &&
    matchedCompanyChannel[0].configs !== undefined
      ? matchedCompanyChannel[0].type === "whatsappcloudapi"
        ? matchedCompanyChannel[0].configs[0].channelName
        : matchedCompanyChannel[0].configs[0].name
      : "";

  useEffect(() => {
    if (updateInfo.userInfo.staffId !== "") {
      const defaultDisplayName =
        staffList.filter(
          (staff) => staff.userInfo.id === updateInfo.userInfo.staffId
        )[0]?.qrCodeIdentity ?? "";
      originalDisplayName.current = defaultDisplayName;
      setDisplayName(defaultDisplayName);
    }
  }, [updateInfo, staffList.map((s) => s.staffId).join()]);

  const handleTabChange = (event: React.MouseEvent, data: Object): void => {
    setSelectedTab(data["activeIndex"]);
  };

  async function refreshUser() {
    if (bannerMessage && company === undefined) {
      isLoading(true);
    }
    const fieldStatusTrackingDraft = clone(fieldsState);

    let existStaff: ModifiedStaffType = {
      staffId: "",
      email: "",
      updatedUserName: "",
      timeZoneInfoId: "",
      updatedFirstName: "",
      updatedLastName: "",
      updatedPosition: "",
      updatedStaffRole: "",
      updatedPhoneNumber: "",
      updatedFields: false,
      updatedMessage: "",
      teamIds: [],
    };

    if (company && settings.teamsSettings.teamsLoaded) {
      fieldStatusTrackingDraft.updatedCompanyName.originalValue =
        company.companyName;
      setCompanyName(company.companyName);
      fieldStatusTrackingDraft.companyTimeZone.originalValue =
        (company.timeZoneInfo && company.timeZoneInfo.baseUtcOffsetInHour) || 0;
      const foundCompanySizeIndex = company.companyCustomFields.findIndex(
        (companyCustomField: CompanyCustomFieldsType) =>
          companyCustomField.fieldName.toLowerCase() === "companysize"
      );
      if (foundCompanySizeIndex > -1) {
        setSelectedCompanySize(
          company.companyCustomFields[foundCompanySizeIndex].value
        );
        fieldStatusTrackingDraft.companySize.originalValue =
          company.companyCustomFields[foundCompanySizeIndex].value;
      }
      const foundPhoneNumberIndex = company.companyCustomFields.findIndex(
        (companyCustomField: CompanyCustomFieldsType) =>
          companyCustomField.fieldName.toLowerCase() === "phonenumber"
      );
      if (foundPhoneNumberIndex > -1) {
        setPhoneNumber(
          company.companyCustomFields[foundPhoneNumberIndex].value
        );
        fieldStatusTrackingDraft.phoneNumber.originalValue =
          company.companyCustomFields[foundPhoneNumberIndex].value;
      }
      if (userId) {
        const modifiedCompany = {
          updatedCompanyName: company.companyName,
          updatedFields: false,
          updatedPhoneNumber: "",
        };
        await fetchUserDetail(
          userId,
          settings.teamsSettings.teams,
          fieldStatusTrackingDraft,
          modifiedCompany
        );
        setFieldsState(fieldStatusTrackingDraft);
      } else {
        if (loggedInUserDetail) {
          existStaff = denormalizeUserInfo(
            loggedInUserDetail,
            settings.teamsSettings.teams
          );
          fieldStatusTrackingDraft.teamIds.originalValue = [
            ...existStaff.teamIds,
          ];
        }
        Object.keys(existStaff).forEach((field) => {
          if (field === "updatedPhoneNumber") {
            fieldStatusTrackingDraft.phoneNumber.originalValue =
              existStaff.updatedPhoneNumber;
          } else if (fieldStatusTrackingDraft[field]) {
            fieldStatusTrackingDraft[field].originalValue = existStaff[field];
          }
        });

        setUpdateInfo(
          produce(updateInfo, (draft) => {
            draft.userInfo = existStaff;
            draft.company = {
              updatedCompanyName: company.companyName,
              updatedFields: false,
              updatedPhoneNumber: "",
              updatedTimeZoneInfoId: company.timeZoneInfo.id,
            };
          })
        );

        setFieldsState(fieldStatusTrackingDraft);
      }
      isLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, [
    JSON.stringify([
      loggedInUserDetail,
      company,
      userId,
      settings.teamsSettings.teams,
    ]),
    settings.teamsSettings.teamsLoaded,
  ]);

  useEffect(() => {
    setUserRole(updateInfo.userInfo.updatedStaffRole);
  }, [updateInfo.userInfo.updatedStaffRole]);
  const featuresGuard = useFeaturesGuard();
  const enabledRoleChoices = staffRoleChoices.filter((ch) =>
    accessRulesGuard.canEditRole(userId ?? user?.id, userRole, ch.value)
  );
  const selectedRoleName = staffRoleChoices.find(
    (c) => c.value.toLowerCase() === userRole.toLowerCase()
  )?.text;

  const fetchUserDetail = async (
    userId: string,
    teams: TeamType[],
    fieldStatusTrackingDraft: typeof fieldsState,
    company?: ModifiedCompanyType
  ) => {
    const result: StaffType[] = await get(
      GET_COMPANY_STAFF_BY_ID.replace("{staffId}", userId),
      { param: {} }
    );

    const currentStaff = result[0];
    const existStaff = denormalizeUserInfo(currentStaff, teams);
    Object.keys(existStaff).forEach((field) => {
      if (fieldStatusTrackingDraft[field]) {
        fieldStatusTrackingDraft[field].originalValue = existStaff[field];
      }
    });
    if (company) {
      setUpdateInfo({
        ...updateInfo,
        userInfo: { ...existStaff },
        company: { ...company },
      });
      isLoading(false);
    } else {
      setUpdateInfo({ ...updateInfo, userInfo: { ...existStaff } });
    }
  };

  function getStaffTeamIds(currentStaff: StaffType, teams: TeamType[]) {
    return teams.filter(includesUser(currentStaff.userInfo.id)).map(prop("id"));
  }

  const denormalizeUserInfo = (currentStaff: StaffType, teams: TeamType[]) => {
    setPhoneNumber(currentStaff.userInfo.phoneNumber || "");
    setUserName(staffDisplayName(currentStaff));

    return {
      staffId: currentStaff.userInfo.id,
      updatedUserName: currentStaff.userInfo.userName,
      email: currentStaff.userInfo.email,
      profilePicture: currentStaff.profilePicture,
      updatedFirstName: currentStaff.userInfo.firstName,
      updatedLastName: currentStaff.userInfo.lastName,
      updatedPosition: currentStaff.position || "",
      timeZoneInfoId: currentStaff.timeZoneInfo.id,
      updatedPhoneNumber: currentStaff.userInfo.phoneNumber || "",
      updatedStaffRole: currentStaff.roleType,
      updatedFields: false,
      updatedMessage: currentStaff.message || "",
      teamIds: getStaffTeamIds(currentStaff, teams),
    };
  };

  const timezoneChanged = (timezoneId: string) => {
    setUpdateInfo({
      ...updateInfo,
      company: {
        ...updateInfo.company,
        updatedTimeZoneInfoId: timezoneId,
        updatedFields: true,
      },
    });
  };

  const updatePhoneNumber = (id: string, value: string) => {
    if (company) {
      const foundPhoneNumberIndex = company.companyCustomFields.findIndex(
        (companyCustomField: CompanyCustomFieldsType) =>
          companyCustomField.fieldName.toLowerCase() === "phonenumber"
      );

      if (updateInfo.userInfo.updatedPhoneNumber || value) {
        setUpdateInfo({
          ...updateInfo,
          userInfo: {
            ...updateInfo.userInfo,
            updatedPhoneNumber: value,
            updatedFields: true,
          },
        });
        setPhoneNumber(value);
      } else if (foundPhoneNumberIndex > -1) {
        if (fieldsState["phoneNumber"].originalValue !== value) {
          setUpdateInfo({
            ...updateInfo,
            company: {
              ...updateInfo.company,
              updatedPhoneNumber: value,
              updatedFields: true,
            },
          });
        } else {
          setUpdateInfo({
            ...updateInfo,
            company: {
              ...updateInfo.company,
              updatedPhoneNumber: value,
              updatedFields:
                Object.keys(fieldsState).filter(
                  (field) =>
                    fieldsState[field].isEdit &&
                    fieldsState[field].fieldType === "company"
                ).length > 0,
            },
          });
        }
        setPhoneNumber(value);
      }
    }
  };

  const updateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, id } = e.target;
    fieldsState[id].isEdit = fieldsState[id].originalValue !== value;
    if (Object.keys(updateInfo.userInfo).indexOf(id) > -1) {
      setUpdateInfo({
        ...updateInfo,
        userInfo: {
          ...updateInfo.userInfo,
          [id]: value,
          updatedFields:
            Object.keys(fieldsState).filter(
              (field) =>
                fieldsState[field].isEdit &&
                fieldsState[field].fieldType === "staff"
            ).length > 0,
        },
      });
    } else if (company) {
      if (Object.keys(updateInfo.company).indexOf(id) > -1) {
        setUpdateInfo({
          ...updateInfo,
          company: {
            ...updateInfo.company,
            [id]: value,
            updatedFields:
              Object.keys(fieldsState).filter(
                (field) =>
                  fieldsState[field].isEdit &&
                  fieldsState[field].fieldType === "company"
              ).length > 0,
          },
        });
      }
    }
  };

  const handleSelectedStaffRoleChange = (
    e: React.SyntheticEvent,
    data: DropdownProps
  ) => {
    const { value } = data;
    const staffRole = value as string;
    if (staffRole) {
      if (
        fieldsState["updatedStaffRole"].originalValue.toLowerCase() !==
        staffRole.toLowerCase()
      ) {
        fieldsState["updatedStaffRole"].isEdit = true;
        setUpdateInfo({
          ...updateInfo,
          userInfo: {
            ...updateInfo.userInfo,
            updatedStaffRole: staffRole,
            updatedFields: true,
          },
        });
      } else {
        fieldsState["updatedStaffRole"].isEdit = false;
        setUpdateInfo({
          ...updateInfo,
          userInfo: {
            ...updateInfo.userInfo,
            updatedStaffRole: fieldsState["updatedStaffRole"].originalValue,
            updatedFields:
              Object.keys(fieldsState).filter(
                (field) =>
                  fieldsState[field].isEdit &&
                  fieldsState[field].fieldType === "staff"
              ).length > 0,
          },
        });
      }
      setUserRole(staffRole);
    }
  };

  const staffTimezoneChanged = (timezoneId: string) => {
    const currentStaff: StaffType | undefined = staffList.find(
      (staff: StaffType) => staff.userInfo.id === (userId ?? user.id)
    );
    if (currentStaff) {
      if (currentStaff.timeZoneInfo.id !== timezoneId) {
        setUpdateInfo({
          ...updateInfo,
          userInfo: {
            ...updateInfo.userInfo,
            timeZoneInfoId: timezoneId,
            updatedFields: true,
          },
        });
      } else {
        setUpdateInfo({
          ...updateInfo,
          userInfo: {
            ...updateInfo.userInfo,
            timeZoneInfoId: currentStaff.timeZoneInfoId,
            updatedFields:
              Object.keys(fieldsState).filter(
                (field) =>
                  fieldsState[field].isEdit &&
                  fieldsState[field].fieldType === "staff"
              ).length > 0,
          },
        });
      }
    } else {
      setUpdateInfo({
        ...updateInfo,
        userInfo: { ...updateInfo.userInfo, updatedFields: false },
      });
    }
  };

  async function refresh() {
    try {
      const res = await fetchCompany();
      loginDispatch({ type: "ADD_COMPANY", company: { ...res } });
    } catch (e) {
      console.error("GET_COMPANY", e);
    }
    await refreshTeams();

    if (!userId) {
      await refreshCurrentUserDetail();
    }
  }

  const saveInfo = async () => {
    isLoading(true);
    try {
      const updatedPhoneNumber =
        updateInfo.userInfo.updatedPhoneNumber ||
        updateInfo.company.updatedPhoneNumber;
      if (updateInfo.userInfo.updatedFields) {
        const {
          updatedFirstName,
          updatedStaffRole,
          updatedLastName,
          updatedPosition,
          timeZoneInfoId,
          updatedMessage,
          updatedUserName,
        } = updateInfo.userInfo;
        if (/\s/g.test(updatedUserName)) {
          // not allow to enter any space
          setUserNameError(
            t("account.form.field.userName.error.invalidFormat")
          );
          return;
        }
        const staffId = updateInfo.userInfo.staffId;
        const staffName =
          updatedFirstName && updatedLastName
            ? `${updatedFirstName} ${updatedLastName}`
            : updatedFirstName || updatedLastName;
        const updateRequest: Partial<StaffUpdateRequestType> = {
          position: updatedPosition,
          userName: updatedUserName,
          staffName: staffName,
          timeZoneInfoId,
          phoneNumber: updatedPhoneNumber,
          firstName: updatedFirstName,
          lastName: updatedLastName,
          staffRole: updatedStaffRole,
          message: updatedMessage,
        };
        if (fieldsState.teamIds.isEdit) {
          updateRequest.teamIds = [...updateInfo.userInfo.teamIds];
        }
        await sendUpdateStaffRequest(staffId, updateRequest);
      }
      if (updateInfo.company.updatedFields) {
        const {
          updatedCompanyName,
          updatedTimeZoneInfoId,
          updatedPhoneNumber,
        } = updateInfo.company;
        await post(POST_COMPANY_NAME, {
          param: {
            companyName: updatedCompanyName,
            timeZoneInfoId: updatedTimeZoneInfoId,
          },
        });
        if (company) {
          const foundPhoneNumber = company.companyCustomFields.find(
            (companyCustomField: CompanyCustomFieldsType) =>
              companyCustomField.fieldName.toLowerCase() === "phonenumber"
          );
          if (foundPhoneNumber) {
            if (
              updatedPhoneNumber &&
              foundPhoneNumber.value !== updatedPhoneNumber
            ) {
              const {
                category,
                fieldName,
                companyCustomFieldFieldLinguals,
                type,
              } = foundPhoneNumber;
              await post(POST_COMPANY_FIELD, {
                param: [
                  {
                    category,
                    fieldName,
                    companyCustomFieldFieldLinguals,
                    type,
                    value: updatedPhoneNumber,
                  },
                ],
              });
            }
          }
          const foundCompanySizeIndex = company.companyCustomFields.findIndex(
            (companyCustomField: CompanyCustomFieldsType) =>
              companyCustomField.fieldName.toLowerCase() === "companysize"
          );
          if (foundCompanySizeIndex > -1) {
            const existingCompanySize =
              company.companyCustomFields[foundCompanySizeIndex];
            const {
              category,
              fieldName,
              companyCustomFieldFieldLinguals,
              type,
              value,
            } = existingCompanySize;
            if (value !== selectedCompanySize) {
              await post(POST_COMPANY_FIELD, {
                param: [
                  {
                    category,
                    fieldName,
                    companyCustomFieldFieldLinguals,
                    type,
                    value: selectedCompanySize,
                  },
                ],
              });
            }
          }
        }
      }
      setUserNameError("");
      flash(t("flash.settings.account.updated"));
    } catch (e) {
      flash(t("flash.settings.account.updateError"));
      const error = parseHttpError(e);
      if (error === "Username has been used") {
        setUserNameError(t("account.form.field.userName.error.alreadyExist"));
        return;
      }
    } finally {
      refresh();
      isLoading(false);
    }
  };

  const removeClick = async (userId: string) => {
    setRemoveLoading(true);
    const foundUser = staffList.find((u) => u.userInfo.id === userId);
    if (foundUser) {
      const result = await postWithExceptions(
        "/v1/tenant-hub/authorized/Companies/DeleteCompanyStaffCompletely",
        {
          param: {
            company_id: company?.id,
            staff_id: foundUser?.staffId,
            user_id: userId,
          },
        }
      );
      if (result && setIsRemovedUser) {
        history.push("/settings/usermanagement");
        setIsRemovedUser(true);
      }
    }
    setRemoveLoading(false);
  };

  function handleTeamChange(ids: string[]) {
    const newIds = ids.map((v) => parseInt(v)).filter(complement(isNaN));
    const idsDirty = !equals(
      newIds.sort(),
      fieldsState.teamIds.originalValue.sort()
    );
    setUpdateInfo(
      produce(updateInfo, (draft) => {
        draft.userInfo.teamIds = newIds;
        if (idsDirty) {
          draft.userInfo.updatedFields = true;
        } else {
          const { teamIds, ...otherFieldsTracking } = fieldsState;
          draft.userInfo.updatedFields = Object.values(
            otherFieldsTracking
          ).some(prop("isEdit"));
        }
      })
    );
    setFieldsState(
      produce(fieldsState, (draft) => {
        draft.teamIds.isEdit = idsDirty;
      })
    );
  }

  const saveDisplayName = async () => {
    try {
      setRefreshQrCode(false);
      isLoading(true);
      const result = await postWithExceptions(
        POST_PERSONAL_WHATSAPP_QR_CODE.replace(
          "{staffId}",
          updateInfo.userInfo.staffId
        ),
        {
          param: {
            qrCodeIdentity: displayName,
          },
        }
      );
      if (result) {
        setRefreshQrCode(true);
        originalDisplayName.current = displayName;
        flash(t("account.qrCode.flashMsg.save"));
      }
    } catch (e) {
      console.error("POST_PERSONAL_WHATSAPP_QR_CODE error: ", e);
    } finally {
      refresh();
      isLoading(false);
    }
  };

  const teamNames = updateInfo.userInfo.teamIds.map(
    (id) => teamChoices.find((t) => t.value === id)?.text ?? ""
  );
  const pageTitle = userId
    ? t("nav.menu.settings.users")
    : t("nav.menu.settings.profile");

  const get2FASetting = async () => {
    try {
      isLoading(true);
      const result = await fetch2FASetting();
      if (result) {
        const data = {
          isCompanyEnable: result.data.is_feature_enabled_for_company,
          isRoleEnable: {
            admin: result.data.is_feature_enabled_for_roles_dict.Admin,
            staff: result.data.is_feature_enabled_for_roles_dict.Staff,
            teamAdmin: result.data.is_feature_enabled_for_roles_dict.TeamAdmin,
          },
        };
        original2FASetting.current = data;
        set2FASetting(data);
      }
    } catch (e) {
      console.error("GET_2FA_SETTING error: ", e);
    } finally {
      isLoading(false);
    }
  };

  const save2FASetting = async () => {
    try {
      isLoading(true);
      const isCompanyEnableChanged =
        is2FASetting.isCompanyEnable !==
        original2FASetting.current.isCompanyEnable;

      const isAdminRoleEnableChanged =
        is2FASetting.isRoleEnable.admin !==
          original2FASetting.current.isRoleEnable.admin &&
        is2FASetting.isCompanyEnable;
      const isStaffRoleEnableChanged =
        is2FASetting.isRoleEnable.staff !==
          original2FASetting.current.isRoleEnable.staff &&
        is2FASetting.isCompanyEnable;
      const isTeamAdminRoleEnableChanged =
        is2FASetting.isRoleEnable.teamAdmin !==
          original2FASetting.current.isRoleEnable.teamAdmin &&
        is2FASetting.isCompanyEnable;
      const promises = [];
      //Need to always call first
      if (isCompanyEnableChanged) {
        promises.push(update2FAEnableCompany(is2FASetting.isCompanyEnable));
      }
      if (isAdminRoleEnableChanged) {
        promises.push(
          update2FAEnableRole(is2FASetting.isRoleEnable.admin, "Admin")
        );
      }
      if (isStaffRoleEnableChanged) {
        promises.push(
          update2FAEnableRole(is2FASetting.isRoleEnable.staff, "Staff")
        );
      }
      if (isTeamAdminRoleEnableChanged) {
        promises.push(
          update2FAEnableRole(is2FASetting.isRoleEnable.teamAdmin, "TeamAdmin")
        );
      }

      // promises.push(Promise.reject(new Error("Error 1 occurred")));
      await Promise.all(promises).then(async (results) => {
        let isAllSuccess = true;
        results.forEach((result) => {
          if (!result.success) {
            isAllSuccess = false;
          }
        });
        if (isAllSuccess) {
          original2FASetting.current.isCompanyEnable =
            is2FASetting.isCompanyEnable;
          original2FASetting.current.isRoleEnable = {
            admin: is2FASetting.isRoleEnable.admin,
            staff: is2FASetting.isRoleEnable.staff,
            teamAdmin: is2FASetting.isRoleEnable.teamAdmin,
          };
          await get2FASetting();
          if (!is2FASetting.isCompanyEnable) {
            flash(t("flash.settings.changesSaved"));
            return;
          }
          setOpen2FAUpdateModal(true);
        }
      });
    } catch (e) {
      console.error("POST_2FA_SETTING error: ", e);
      flash(t("flash.common.unknownErrorTryLater"));
    } finally {
      isLoading(false);
    }
  };

  const handleSaveClick = async () => {
    if (selectedTab === tabEnum.general) {
      return await saveInfo();
    } else if (selectedTab === tabEnum.security) {
      return await save2FASetting();
    } else if (selectedTab === tabEnum.qrCode) {
      return await saveDisplayName();
    } else if (selectedTab === tabEnum.systemPreference) {
      return await saveWebVersion(user.id);
    }
  };

  useEffect(() => {
    if (selectedTab === tabEnum.security) {
      get2FASetting();
    } else if (selectedTab === tabEnum.systemPreference) {
      getDefaultWebVersion(user.id);
    }
  }, [selectedTab, user?.id]);

  return (
    <div className="content general-info">
      <div className="container no-scrollbars">
        <div className="header">
          <Header
            as="h4"
            content={
              userId
                ? t("account.form.header.named", { name: userName })
                : t("nav.menu.settings.profile")
            }
          />
          <div className="action-btn">
            {userId && canRemoved && (
              <RemoveAccountConfirmModal
                headerText={t("settings.modal.removeUserWarn.header")}
                triggerText={t("settings.modal.removeUserWarn.trigger")}
                loading={removeLoading}
                onConfirm={() => removeClick(userId)}
                onCancel={() => {}}
                content={
                  <Trans
                    i18nKey={"settings.modal.removeUserWarn.text"}
                    values={{
                      userName,
                      companyName,
                    }}
                  >
                    <div>
                      If you remove ${userName} from ${companyName}, they will
                      no longer be able to see any of its messages. To join the
                      workspace, they will have to be re-invited.
                    </div>
                    <div>Are you sure you wish to do this?</div>
                  </Trans>
                }
              />
            )}
            <Button
              className="button1"
              loading={loading}
              disabled={
                selectedTab === tabEnum.general
                  ? !(
                      updateInfo.userInfo.updatedFields ||
                      updateInfo.company.updatedFields
                    )
                  : !isEdit
              }
              onClick={handleSaveClick}
              content={t("form.button.save")}
            />
          </div>
        </div>
        <Tab
          className={panelStyles["panel-wrap"]}
          menu={{ secondary: true, pointing: true }}
          panes={panes}
          onTabChange={handleTabChange}
          activeIndex={selectedTab}
        />
        <Divider />

        {selectedTab === tabEnum.general && (
          <div className="content-info form">
            <div className="header">{t("account.form.field.photo.label")}</div>
            <SettingProfilePic
              type="profile"
              staffId={updateInfo.userInfo.staffId}
              profilePicId={
                updateInfo.userInfo?.profilePicture?.profilePictureId ?? ""
              }
            />
            <Form className="setting-form">
              <div className="row-user-name">
                <div className={`row ${userNameError ? "error" : ""}`}>
                  <Form.Field>
                    <label htmlFor="updatedUserName">
                      {t("account.form.field.userName.label")}
                    </label>
                    <input
                      id={"updatedUserName"}
                      placeholder={t("account.form.prompt.text", {
                        field: fieldsState["updatedUserName"].placeholder,
                      })}
                      disabled={true}
                      value={updateInfo.userInfo.updatedUserName}
                      onChange={updateInputChange}
                    />
                  </Form.Field>
                  <Form.Field>
                    <label htmlFor="updatedEmail">
                      {t("account.form.field.email.label")}
                    </label>
                    <input
                      id={"updatedEmail"}
                      disabled={true}
                      value={updateInfo.userInfo.email}
                    />
                  </Form.Field>
                </div>
                <div className="row">
                  {userNameError && <FieldError text={userNameError} />}
                </div>
              </div>
              <div className="row">
                <Form.Field>
                  <label htmlFor="updatedFirstName">
                    {t("account.form.field.firstName.label")}
                  </label>
                  <input
                    disabled={accessRulesGuard.isSocialLoginUser()}
                    id={"updatedFirstName"}
                    placeholder={t("account.form.prompt.text", {
                      field: fieldsState["updatedFirstName"].placeholder,
                    })}
                    value={updateInfo.userInfo.updatedFirstName}
                    onChange={updateInputChange}
                  />
                </Form.Field>
                <Form.Field>
                  <label htmlFor="updatedLastName">
                    {t("account.form.field.lastName.label")}
                  </label>
                  <input
                    disabled={accessRulesGuard.isSocialLoginUser()}
                    id={"updatedLastName"}
                    placeholder={t("account.form.prompt.text", {
                      field: fieldsState["updatedLastName"].placeholder,
                    })}
                    value={updateInfo.userInfo.updatedLastName}
                    onChange={updateInputChange}
                  />
                </Form.Field>
              </div>
              <div className="row">
                <Form.Field>
                  <label htmlFor="updatedPosition">
                    {t("account.form.field.position.label")}
                  </label>
                  <InfoTooltip
                    placement={"left"}
                    children={t("settings.tooltip.field.position")}
                    trigger={
                      <input
                        id={"updatedPosition"}
                        placeholder={t("account.form.prompt.text", {
                          field: fieldsState.updatedPosition.placeholder,
                        })}
                        value={updateInfo.userInfo.updatedPosition}
                        onChange={updateInputChange}
                      />
                    }
                  />
                </Form.Field>
                {accessRulesGuard.canEditCompanyName() ? (
                  <Form.Field>
                    <label htmlFor="updatedCompanyName">
                      {t("account.form.field.companyName.label")}
                    </label>
                    <input
                      id={"updatedCompanyName"}
                      placeholder={t("account.form.prompt.text", {
                        field: fieldsState.updatedCompanyName.placeholder,
                      })}
                      value={
                        updateInfo.company &&
                        updateInfo.company.updatedCompanyName
                      }
                      onChange={updateInputChange}
                    />
                  </Form.Field>
                ) : (
                  <Form.Field>
                    <label>{t("account.form.field.phone.label")}</label>
                    <PhoneNumber
                      placeholder={t("account.form.prompt.text", {
                        field: fieldsState.phoneNumber.placeholder,
                      })}
                      existValue={phoneNumber}
                      onChange={updatePhoneNumber}
                      fieldName={"phoneNumber"}
                    />
                  </Form.Field>
                )}
              </div>
              <div className="row">
                <Form.Field>
                  <label>{t("account.form.field.team.label")}</label>
                  {featuresGuard.canUseTeams() &&
                  accessRulesGuard.canEditAnyTeam() ? (
                    <InfoTooltip
                      placement={"left"}
                      children={t("settings.tooltip.field.team")}
                      trigger={
                        <Dropdown
                          selection
                          multiple
                          placeholder={
                            teamChoices.length === 0
                              ? t("account.form.field.team.placeholder.empty")
                              : t("account.form.field.team.placeholder.filled")
                          }
                          options={teamChoices}
                          value={updateInfo.userInfo.teamIds ?? []}
                          onChange={(event, data) => {
                            handleTeamChange(data.value as string[]);
                          }}
                        />
                      }
                    />
                  ) : (
                    <div className="field locked">
                      <input
                        value={
                          teamNames.length > 0
                            ? teamNames.join(", ")
                            : (t(
                                "account.form.field.team.value.empty"
                              )! as string)
                        }
                        disabled
                      />
                      <Image src={LockIcon} />
                    </div>
                  )}
                </Form.Field>
                <Form.Field>
                  <label>{t("account.form.field.role.label")}</label>
                  {enabledRoleChoices.length > 1 &&
                  accessRulesGuard.isAdmin() ? (
                    <InfoTooltip
                      placement={"left"}
                      children={
                        <Trans i18nKey={"settings.tooltip.field.role"} />
                      }
                      trigger={
                        <Dropdown
                          scrolling
                          selectOnBlur={false}
                          upward={false}
                          options={enabledRoleChoices}
                          value={userRole.toLowerCase()}
                          text={selectedRoleName}
                          placeholder={t("account.form.prompt.dropdown", {
                            field: fieldsState["updatedStaffRole"].placeholder,
                          })}
                          onChange={handleSelectedStaffRoleChange}
                        />
                      }
                    />
                  ) : (
                    <LockedField text={selectedRoleName!} />
                  )}
                </Form.Field>
              </div>

              <div className="row">
                {accessRulesGuard.isAdmin() && updateInfo.userInfo.staffId && (
                  <Form.Field>
                    <label>{t("account.form.field.phone.label")}</label>
                    <PhoneNumber
                      placeholder={t("account.form.prompt.text", {
                        field: fieldsState["phoneNumber"].placeholder,
                      })}
                      existValue={phoneNumber}
                      onChange={updatePhoneNumber}
                      fieldName={"phoneNumber"}
                    />
                  </Form.Field>
                )}
                <Form.Field>
                  <label className="with-tooltip">
                    {t("account.form.field.link.label")}
                  </label>
                  <InfoTooltip
                    placement={"left"}
                    children={t("settings.tooltip.field.link")}
                    trigger={
                      <input
                        id={"updatedMessage"}
                        placeholder={t("account.form.prompt.text", {
                          field: fieldsState["updatedMessage"].placeholder,
                        })}
                        value={updateInfo.userInfo.updatedMessage}
                        onChange={updateInputChange}
                      />
                    }
                  />
                </Form.Field>
              </div>
              {
                <div className={"row"}>
                  <Form.Field>
                    <label>{t("account.form.field.yourTimeZone.label")}</label>
                    <TimeZoneComponent
                      placeholder={t("account.form.prompt.text", {
                        field: fieldsState["yourTimeZone"].placeholder,
                      })}
                      onChange={staffTimezoneChanged}
                      currentTimezone={updateInfo.userInfo.timeZoneInfoId}
                    />
                  </Form.Field>
                  {accessRulesGuard.canEditCompanyTimeZone() && (
                    <Form.Field>
                      <label>
                        {t("account.form.field.companyTimeZone.label")}
                      </label>
                      <TimeZoneComponent
                        placeholder={t("account.form.prompt.text", {
                          field: fieldsState["companyTimeZone"].placeholder,
                        })}
                        onChange={timezoneChanged}
                        currentTimezone={
                          updateInfo.company.updatedTimeZoneInfoId
                        }
                      />
                    </Form.Field>
                  )}
                </div>
              }
            </Form>
            {<Helmet title={t("nav.common.title", { page: pageTitle })} />}
          </div>
        )}

        {selectedTab === tabEnum.qrCode && (
          <QrCode
            isEdit={isEdit}
            staffId={updateInfo.userInfo.staffId}
            displayName={displayName}
            setDisplayName={setDisplayName}
            defaultChannel={defaultChannel}
            refresh={refreshQrCode}
          />
        )}
        {selectedTab === tabEnum.security && (
          <Security
            is2FASetting={is2FASetting}
            set2FASetting={set2FASetting}
            open2FAUpdateModal={open2FAUpdateModal}
            setOpen2FAUpdateModal={setOpen2FAUpdateModal}
          />
        )}
        {selectedTab === tabEnum.systemPreference && (
          <SystemPreference
            selectedVersion={selectedVersion}
            setSelectedVersion={setSelectedVersion}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
