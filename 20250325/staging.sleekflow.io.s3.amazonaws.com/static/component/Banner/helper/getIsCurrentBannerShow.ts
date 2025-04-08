import { BannerEnum } from "../types/BannerEnum";

export const BannerOrderAndClassNameList = {
  [BannerEnum.bookMeeting]: "bookMeeting",
  [BannerEnum.paymentFailed]: "payment",
  [BannerEnum.channelConnection]: "channel",
  [BannerEnum.inviteUserAutomation]: "automation",
  [BannerEnum.balanceWarning]: "balanceWarning",
};

export const getIsCurrentBannerShow = (
  ref: HTMLElement | HTMLBodyElement,
  currentBanner: BannerEnum
): boolean => {
  for (let key in BannerOrderAndClassNameList) {
    if (key === currentBanner) {
      return true;
    } else if (BannerOrderAndClassNameList[key] in ref.dataset) {
      return false;
    }
  }
  return true;
};
