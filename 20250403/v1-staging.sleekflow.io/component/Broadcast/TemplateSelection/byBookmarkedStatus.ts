import { WhatsappTemplateNormalizedType } from "../../../types/WhatsappTemplateResponseType";

export function byBookmarkedStatus(
  a: WhatsappTemplateNormalizedType,
  b: WhatsappTemplateNormalizedType
) {
  const both = a.isBookmarked && b.isBookmarked;
  const none = !a.isBookmarked && !b.isBookmarked;
  if (both || none) {
    return 0;
  }
  return a.isBookmarked ? -1 : 1;
}
