import React, { useContext } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { Image } from "semantic-ui-react";
import moment from "moment";
import { URL } from "../../../api/apiRequest";
import {
  ProfileRemark,
  ProfileRemarkGroupType,
} from "../../../types/LoginType";
import { ProfileRemarksReceivedType } from "../../../types/ConversationType";
import IndividualProfileContext from "../../../context/IndividualProfileContext";
import Avatar from "react-avatar";
import { useSignalRGroup } from "../../SignalR/useSignalRGroup";
import SleekFlowIcon from "../../../assets/images/logo-solid.svg";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../AppRootContext";
import { equals, pick } from "ramda";
import MessageContent from "../../Chat/Records/MessageContent";

export function isEmail(validateStr: string) {
  return /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/.test(
    validateStr
  );
}

interface ProfileContentNoteProps {
  remarkGroup: ProfileRemarkGroupType;
  hasMore: boolean;
  setRemarkGroup: (remark: ProfileRemark, month: string) => void;
  getRemarks: (pageNumber: number) => Promise<void>;
  filter: string;
}

export default function ProfileContentNote(props: ProfileContentNoteProps) {
  const { remarkGroup, hasMore, getRemarks } = props;
  const signalRGroupName = useAppSelector((s) => s.user.signalRGroupName);
  const selectedTimeZone = useAppSelector((s) => s.selectedTimeZone);
  const { individualProfileDispatch } = useContext(IndividualProfileContext);
  const { t } = useTranslation();

  useSignalRGroup(
    signalRGroupName,
    {
      OnRemarksReceived: [
        (state, message: ProfileRemarksReceivedType) => {
          const { remarkId, userProfileId, remarksStaff, remarks, createdAt } =
            message;
          const remarkCurrentStaff = state.staffList.find(
            (staff) => staff.userInfo.id === remarksStaff?.userInfo.id
          );
          const remark: ProfileRemark = {
            id: remarkId,
            userProfileId,
            staffId: remarkCurrentStaff?.userInfo.id ?? "",
            name:
              remarksStaff?.userInfo.displayName ||
              t("profile.individual.activities.sender.system"),
            pic: remarksStaff
              ? remarkCurrentStaff?.profilePictureURL ||
                remarksStaff.userInfo.displayName
              : "",
            remark: remarks,
            date: createdAt,
          };
          individualProfileDispatch({
            type: "UPDATE_REMARK",
            isDisplayMessage: true,
          });

          setTimeout(() => {
            individualProfileDispatch({
              type: "UPDATE_REMARK",
              isDisplayMessage: false,
            });
          }, 1500);

          if (state.profile?.id === message.userProfileId) {
            const month = moment(createdAt).format("MMMM YYYY");
            props.setRemarkGroup(remark, month);
          }
        },
      ],
    },
    "ProfileContentNote"
  );

  return (
    <InfiniteScroll hasMore={hasMore} loadMore={getRemarks} useWindow={false}>
      {Object.keys(remarkGroup).map((profileDate, g) => {
        return (
          <div className="month-title" key={g}>
            {remarkGroup[profileDate].map((profileRemark, i) => {
              return (
                <div className="info" key={i}>
                  <div className="title">
                    <div className="pic">
                      <div className="image">
                        {profileRemark.name === profileRemark.pic &&
                        profileRemark.staffId !==
                          process.env.REACT_APP_ADMIN_ID ? (
                          <Avatar
                            name={profileRemark.pic}
                            size={"30px"}
                            round={true}
                            maxInitials={2}
                          />
                        ) : (
                          <Image
                            src={`${
                              profileRemark.name === "System"
                                ? SleekFlowIcon
                                : URL.concat(profileRemark.pic)
                            }`}
                            avatar
                          />
                        )}
                      </div>
                      <div className="name">{profileRemark.name}</div>
                      <div className="time">
                        {moment
                          .utc(profileRemark.date)
                          .utcOffset(selectedTimeZone)
                          .format("LLL")}
                      </div>
                    </div>
                  </div>
                  <div className="desc">
                    <div className="content">
                      {profileRemark.remark.split("\n").map((remark, idx) => {
                        if (isEmail(remark)) {
                          return <div>{remark}</div>;
                        }
                        return <MessageContent message={remark} key={idx} />;
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </InfiniteScroll>
  );
}
