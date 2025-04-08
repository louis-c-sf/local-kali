import ProfileSearchType from "../../../types/ProfileSearchType";
import { ProfileType } from "../../../types/LoginType";

export function contactDescription(
  profile: ProfileSearchType | ProfileType
): string {
  let desc: string[] = [];
  if (profile.whatsAppAccount) {
    desc = [...desc, `WhatsApp/(${profile.whatsAppAccount.phone_number})`];
  }
  if (profile.facebookAccount) {
    desc = [...desc, `Facebook/(${profile.facebookAccount.name})`];
  }
  if (profile.lineUser) {
    desc = [
      ...desc,
      `Line/(${profile.lineUser.displayName || profile.lineUser.userId})`,
    ];
  }
  if (profile.weChatUser) {
    desc = [
      ...desc,
      `WeChat/(${profile.weChatUser.nickname || profile.weChatUser.openid})`,
    ];
  }
  if (profile.emailAddress) {
    desc = [...desc, `Email/${profile.emailAddress.email}`];
  }
  if (profile.instagramUser) {
    desc = [...desc, `Instagram DM/${profile.instagramUser.username}`];
  }
  if (profile.webClient) {
    desc = [...desc, `Web`];
  }
  return desc.join(",");
}
