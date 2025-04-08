import { UserInfoType } from "../../../types/ConversationType";
import { escapeRegExp } from "lodash-es";

export function replaceMentions(
  text: string,
  users: UserInfoType[],
  html: boolean
) {
  if (text.indexOf("@") === -1) {
    return text;
  }
  if (text.indexOf('<span class="matched-text">') > -1) {
    return text;
  }
  return users.reduce((textResult, user) => {
    const namePart = String(user.displayName || user.email).trim();
    if (!namePart) {
      return textResult;
    }
    const regex = `(\\s*)(@${escapeRegExp(namePart)})([|/.,;:?!]*)(\\s*)`;

    return textResult.replace(
      new RegExp(`${regex}`, "gi"),
      (match, headSpace, name, punctuation, tailSpace, position) => {
        let nameInTag = name.trim();
        let tail = "";

        // add punctuation inside tag
        if (position + match.length < text.length) {
          nameInTag = `${nameInTag}${punctuation}`;
          tail = " ";
        }

        let result = html
          ? `<span class="user-mention">${nameInTag}</span>${tail}`
          : `${nameInTag}${tail}`;
        if (position > 0) {
          result = ` ${result}`;
        }
        return result;
      }
    );
  }, text);
}
