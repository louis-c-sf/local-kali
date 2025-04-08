import MessageType from "../../../types/MessageType";
import moment from "moment";

export function sortedFromOldest(messages: MessageType[]): MessageType[] {
  const getStamp = (m: MessageType) =>
    moment(
      m.scheduleSentAt ? m.scheduleSentAt : m.updatedAt,
      "YYYY-MM-DDTHH:mm:ss.SSSSZ",
      true
    ).valueOf();

  return [...messages].sort((a, b) => {
    const tsA = getStamp(a);
    const tsB = getStamp(b);
    if (tsA && tsB && tsA !== tsB) {
      return tsA - tsB;
    }
    return a.timestamp - b.timestamp;
  });
}
