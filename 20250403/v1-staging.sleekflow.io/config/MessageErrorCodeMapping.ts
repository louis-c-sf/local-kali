import { TFunction } from "i18next";

const ErrorCodeList = {
  noRecipient: "63003",
  noSupportAttachedFile: "63005",
  violateChannelPolicy: "63013",
  outTimeOfReply: "63016",
  exceedRateLimit: "63018",
  failedProcessAttachedFile: "63019",
  invalidContent: "63021",
  notActivated: "2018310",
  outside7d: "2018278",
  notFound: "401",
};

export function getTwilioErrorCodeMap(t: TFunction) {
  return {
    [ErrorCodeList.noRecipient]: t("broadcast.grid.row.errorCode.noRecipient"),
    [ErrorCodeList.noSupportAttachedFile]: t(
      "broadcast.grid.row.errorCode.noSupportAttachedFile"
    ),
    [ErrorCodeList.violateChannelPolicy]: t(
      "broadcast.grid.row.errorCode.violateChannelPolicy"
    ),
    [ErrorCodeList.outTimeOfReply]: t(
      "broadcast.grid.row.errorCode.outTimeOfReply"
    ),
    [ErrorCodeList.exceedRateLimit]: t(
      "broadcast.grid.row.errorCode.exceedRateLimit"
    ),
    [ErrorCodeList.failedProcessAttachedFile]: t(
      "broadcast.grid.row.errorCode.failedProcessAttachedFile"
    ),
    [ErrorCodeList.invalidContent]: t(
      "broadcast.grid.row.errorCode.invalidContent"
    ),
    unknown: t("broadcast.grid.row.errorCode.unknownError"),
  };
}

export function getFbErrorCodeMap(t: TFunction, outside7dElement: JSX.Element) {
  return {
    [ErrorCodeList.notActivated]: t(
      "chat.facebookOTN.message.error.notActivated"
    ),
    [ErrorCodeList.outside7d]: outside7dElement,
    [ErrorCodeList.notFound]: t("chat.facebookOTN.message.error.notFound"),
  };
}
