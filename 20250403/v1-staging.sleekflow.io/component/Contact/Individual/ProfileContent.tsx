import React, { useEffect, useState } from "react";
import { Tab } from "semantic-ui-react";
import IndividualMessage from "./IndividualMessage";
import ProfileContentNote from "./ProfileContentNote";
import ProfileMediaContent from "./ProfileMediaContent";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../AppRootContext";
import MessageType from "../../../types/MessageType";
import {
  mainTabEnum,
  ProfileMediaFileType,
  ProfileRemarkFilterDataType,
  subTabEnum,
} from "../../../types/IndividualProfileType";
import { get } from "../../../api/apiRequest";
import { GET_CONVERSATIONS_MESSAGES } from "../../../api/apiPath";
import { equals } from "ramda";
import moment from "moment";
import { ProfileRemark } from "../../../types/LoginType";
import {
  AuditLogsGetUserProfileAuditLogsArgs,
  fetchActivityLogs,
} from "api/Contacts/fetchActivityLogs";
import { useCompanyStaff } from "api/User/useCompanyStaff";

interface ProfileContentProps {
  pic: string;
  visibleNewContact: boolean;
}

export default (props: ProfileContentProps) => {
  const { t } = useTranslation();
  const tabMapping = {
    main: {
      activity: mainTabEnum.activity,
      media: mainTabEnum.media,
    },
    sub: {
      user: subTabEnum.user,
      system: subTabEnum.system,
      all: subTabEnum.all,
    },
  };
  const subTitleMapping = {
    all: t("profile.individual.activities.subTab.all"),
    system: t("profile.individual.activities.subTab.system"),
    user: t("profile.individual.activities.subTab.user"),
  };
  const senderMapping = {
    sender: "displayName",
    facebookSender: "name",
    webClientSender: "name",
    whatsappSender: "nickname",
    lineSender: "displayName",
    smsSender: "name",
    instagramSender: "username",
  };
  const { visibleNewContact } = props;
  const [selectedItem, setSelectedItem] = useState(mainTabEnum.activity);
  const profile = useAppSelector((s) => s.profile, equals);
  const { booted, staffList } = useCompanyStaff();

  const [remarkHasMore, setRemarkHasMore] = useState(false);
  const [mediaFileCurrPaging, setMediaFileCurrPaging] = useState(0);
  const [mediaFileHasMore, setMediaFileHasMore] = useState(false);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);

  const [remarkGroup, setRemarkGroup] = useState<ProfileRemarkFilterDataType>(
    {}
  );
  const [isFetchingRemark, setIsFetchingRemark] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<ProfileMediaFileType[]>([]);
  const [isFetchingMedia, setIsFetchingMedia] = useState(false);
  const [selectedMediaFiles, setSelectedMediaFiles] = useState<
    ProfileMediaFileType[]
  >([]);
  const [remarkContinuationToken, setRemarkContinuationToken] = useState<
    string | null
  >("");
  const remarkLimit = 100;
  const mediaLimit = 10;

  const getRemarks = async (pageNumber: number) => {
    if (isFetchingRemark || remarkContinuationToken === null) return;
    let filterData: ProfileRemarkFilterDataType =
      remarkContinuationToken === "" ? {} : remarkGroup;

    try {
      setIsFetchingRemark(true);
      let param: AuditLogsGetUserProfileAuditLogsArgs = {
        sleekflow_user_profile_id: profile.id,
        filters: {
          types: null,
        },
        limit: remarkLimit,
      };
      if (remarkContinuationToken !== "") {
        param = {
          ...param,
          continuation_token: remarkContinuationToken,
        };
      }

      const result = await fetchActivityLogs(param);
      const logs = result.data.user_profile_audit_logs;

      for (const i in logs) {
        const {
          id,
          sleekflow_user_profile_id,
          audit_log_text,
          created_time,
          sleekflow_staff_id,
        } = logs[i];

        const remarkCurrentStaff = staffList.find(
          (staff) => staff.userInfo.id === sleekflow_staff_id
        );
        const month = moment(created_time).format("MMMM YYYY");
        const formatRemark: ProfileRemark = {
          id: id,
          userProfileId: sleekflow_user_profile_id,
          remark: audit_log_text,
          staffId: remarkCurrentStaff?.userInfo?.id ?? sleekflow_staff_id ?? "",
          date: created_time,
          name:
            remarkCurrentStaff?.userInfo.displayName ||
            t("profile.individual.activities.sender.system"),
          pic:
            remarkCurrentStaff?.profilePictureURL ??
            remarkCurrentStaff?.userInfo.displayName ??
            "",
        };

        const filterGroup = remarkCurrentStaff ? "user" : "system";

        filterData = {
          ...filterData,
          all: {
            ...filterData["all"],
            [month]: [
              ...(filterData["all"] ? filterData["all"][month] ?? [] : []),
              formatRemark,
            ],
          },
          [filterGroup]: {
            ...filterData[filterGroup],
            [month]: [
              ...(filterData[filterGroup]
                ? filterData[filterGroup][month] ?? []
                : []),
              formatRemark,
            ],
          },
        };
      }

      if (remarkContinuationToken === "") {
        if (logs.length === 0) {
          setRemarkGroup({});
        } else {
          setRemarkGroup(filterData);
        }
      } else {
        setRemarkGroup(filterData);
      }

      setRemarkHasMore(logs.length === remarkLimit);
      if (result.success && result.data.next_continuation_token) {
        setRemarkContinuationToken(result.data.next_continuation_token);
      } else if (!result.data.next_continuation_token) {
        setRemarkContinuationToken(null);
      }
    } catch (e) {
      console.error(`getRemarks error${e}`);
    } finally {
      setIsFetchingRemark(false);
    }
  };

  const getMediaFiles = async (pageNumber: number) => {
    if (isFetchingMedia) return;
    let files: ProfileMediaFileType[] =
      mediaFileCurrPaging === 0 ? [] : mediaFiles;
    try {
      setIsFetchingMedia(true);
      const result: MessageType[] = await get(
        GET_CONVERSATIONS_MESSAGES.replace("{id}", profile.conversationId),
        {
          param: {
            offset: mediaFileCurrPaging,
            limit: mediaLimit,
            isGetFileOnly: true,
          },
        }
      );
      for (const i in result) {
        const senderKey = Object.keys(senderMapping).find((key) =>
          result[i].hasOwnProperty(key)
        );
        files = [
          ...files,
          ...result[i].uploadedFiles.map((file) => ({
            messageId: result[i].id,
            filename: result[i].uploadedFiles ? file.filename : "N/A",
            sender: senderKey
              ? result[i][senderKey][senderMapping[senderKey]]
              : "N/A",
            fileSize: result[i].uploadedFiles ? file.fileSize ?? "N/A" : "N/A",
            date: result[i].createdAt,
            fileId: result[i].uploadedFiles ? file.fileId : "N/A",
            mimeType: result[i].uploadedFiles ? file.mimeType ?? "N/A" : "N/A",
            url: result[i].uploadedFiles ? file.url : "N/A",
          })),
        ];
      }

      if (mediaFileCurrPaging === 0) {
        if (result.length === 0) {
          setMediaFiles([]);
        } else {
          setMediaFiles(files);
        }
      } else {
        setMediaFiles(files);
      }
      setMediaFileHasMore(result.length === mediaLimit);
      if (result.length > 0) {
        setMediaFileCurrPaging(mediaFileCurrPaging + mediaLimit);
      }
      setIsLoadingMedia(false);
    } catch (e) {
      console.error(`getMedias error${e}`);
    } finally {
      setIsFetchingMedia(false);
    }
  };

  const handleTabChange = (event: React.MouseEvent, data: Object): void => {
    setSelectedItem(data["activeIndex"]);
  };

  useEffect(() => {
    if (
      booted &&
      remarkContinuationToken === "" &&
      profile.id &&
      selectedItem === mainTabEnum.activity
    ) {
      getRemarks(0);
    }
  }, [remarkContinuationToken, profile.id, selectedItem, booted]);

  useEffect(() => {
    if (
      mediaFileCurrPaging === 0 &&
      profile.conversationId &&
      selectedItem === mainTabEnum.media
    ) {
      getMediaFiles(0);
    }
  }, [mediaFileCurrPaging, profile.conversationId, selectedItem]);

  useEffect(() => {
    if (profile && profile.id) {
      setRemarkContinuationToken("");
    }
  }, [profile.id, JSON.stringify(staffList)]);

  const CustomPane = (props: { key: string; children: any }) => {
    const { key, children } = props;
    return <Tab.Pane as={() => <>{children}</>} key={key} />;
  };
  const updateRemarksGroup = (note: ProfileRemark, month: string) => {
    setRemarkGroup((remarkGroups) => {
      if (!remarkGroups["all"][month]) {
        return {
          ...remarkGroups,
          all: {
            ...remarkGroups["all"],
            [month]: [note],
          },
          user: {
            ...remarkGroups["user"],
            [month]: [note],
          },
        };
      } else if (
        !remarkGroups["all"][month].some((remark) => remark.id === note.id)
      ) {
        const userRemark = remarkGroups["user"] ?? {};
        const allRemark = remarkGroups["all"] ?? {};
        return {
          ...remarkGroups,
          all: {
            ...allRemark,
            [month]: [
              note,
              ...(allRemark && allRemark[month] ? [...allRemark[month]] : []),
            ],
          },
          user: {
            ...userRemark,
            [month]: [
              note,
              ...(userRemark && userRemark[month]
                ? [...userRemark[month]]
                : []),
            ],
          },
        };
      }
      return remarkGroups;
    });
  };

  const subPanes = Object.keys(tabMapping.sub).map((subTitle) => ({
    menuItem: subTitleMapping[subTitle],
    render: () => {
      return (
        <CustomPane key={subTitle}>
          <div className="content">
            <ProfileContentNote
              key={subTitle}
              {...{
                remarkGroup: remarkGroup[subTitle] ?? {},
                setRemarkGroup: updateRemarksGroup,
                hasMore: remarkHasMore,
                setHasMore: setRemarkHasMore,
                getRemarks,
                filter: subTitle,
              }}
            />
          </div>
          {subTitle !== "system" && (
            <footer>
              <IndividualMessage />
            </footer>
          )}
        </CustomPane>
      );
    },
  }));

  const mainPanes = [
    {
      menuItem: t("profile.individual.activities.tab"),
      render: () => {
        return (
          <Tab.Pane attached={false} key="activity">
            <Tab
              className="sub-tab"
              menu={{ secondary: true, pointing: true }}
              panes={subPanes}
            />
          </Tab.Pane>
        );
      },
    },
    {
      menuItem: t("profile.individual.media.tab"),
      render: () => {
        return (
          <Tab.Pane attached={false} key="media">
            <ProfileMediaContent
              {...{
                files: mediaFiles,
                isLoading: isLoadingMedia,
                getMediaFiles,
                hasMore: mediaFileHasMore,
                currPaging: mediaFileCurrPaging,
                selectedFiles: selectedMediaFiles,
                setSelectedFiles: setSelectedMediaFiles,
              }}
            />
          </Tab.Pane>
        );
      },
    },
  ];

  return (
    <div
      className={`profile-content ${
        selectedItem === mainTabEnum.activity ? "activity" : "media"
      } ${(visibleNewContact && "blur") || ""}`}
    >
      <Tab
        className="main-tab"
        menu={{ secondary: true, pointing: true }}
        panes={mainPanes}
        onTabChange={handleTabChange}
      />
    </div>
  );
};
