import React from "react";
import styles from "./SearchListItem.module.css";
import MessageType, { isStaffMessage } from "../../../../types/MessageType";
import { useCurrentUtcOffset } from "../../hooks/useCurrentUtcOffset";
import moment from "moment";
import { parseQueryMatches } from "../../../../container/Settings/filters/getQueryMatcher";
import { trimStart, trimEnd } from "lodash-es";
import { useAppSelector } from "../../../../AppRootContext";
import { equals } from "ramda";
import ChatRecordIcon from "../../ChatRecordIcon";
import { Loader } from "semantic-ui-react";
import { useProfileDisplayName } from "../../utils/useProfileDisplayName";
import { parseMatchSentence } from "../../../../container/Settings/filters/parseMatchSentence";

export function SearchListItem(props: {
  message: MessageType;
  query: string;
  onClick: (message: MessageType) => void;
  loading: boolean;
  selected: boolean;
}) {
  const { message, query, onClick, loading, selected } = props;
  const profile = useAppSelector((s) => s.profile, equals);
  const companyName = useAppSelector((s) => s.company?.companyName ?? "");
  const sentence = parseMatchSentence(message.messageContent, query);
  const [matchBefore, match, matchAfter] = parseQueryMatches(
    query,
    sentence ?? ""
  );
  let before = matchBefore ? trimStart(matchBefore) : "";
  let after = matchAfter ? trimEnd(matchAfter) : "";

  const utc = useCurrentUtcOffset() ?? 0;
  const updatedMoment = moment.utc(message.updatedAt).utcOffset(utc);

  const { getPicText, getSenderName } = useProfileDisplayName();
  const profileName =
    getSenderName(message, profile) ||
    getPicText(profile, message) ||
    companyName;

  return (
    <div
      className={`${styles.item} ${selected ? styles.selected : ""}`}
      onClick={() => onClick(message)}
    >
      <div className={styles.avatar}>
        <div className={styles.avatarWrap}>
          {loading && <Loader active size={"large"} />}
          <ChatRecordIcon
            isStaff={isStaffMessage(message)}
            message={message}
            profile={profile}
            size={40}
          />
        </div>
      </div>
      <div className={styles.details}>
        <div className={styles.header}>
          <div className={styles.name}>{profileName}</div>
          <div className={styles.date}>{updatedMoment.format("L")}</div>
        </div>
        <div className={styles.text}>
          {before}
          <span className={styles.highlight}>{match}</span>
          {after}
        </div>
      </div>
    </div>
  );
}

export default SearchListItem;
