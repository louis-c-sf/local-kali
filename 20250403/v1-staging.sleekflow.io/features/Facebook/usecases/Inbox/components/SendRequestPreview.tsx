import React, { useCallback, useEffect, useState } from "react";
import { fetchFacebookPageInfo } from "../../../API/fetchFacebookPageInfo";
import { Image, Loader } from "semantic-ui-react";
import styles from "./SendRequestContent.module.css";
import { Trans, useTranslation } from "react-i18next";
import DefaultProfile from "../../../../../assets/images/inbox-facebook/fb-default-profile.svg";

const SendRequestPreview = (props: {
  pageId: string | undefined;
  message: string;
}) => {
  const { pageId, message } = props;
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({
    name: "",
    profileLink: "",
  });
  const getPageInfo = useCallback(async () => {
    try {
      setLoading(true);

      const result = await fetchFacebookPageInfo(pageId ?? "");
      if (result) {
        setPageInfo({
          name: result.pageName,
          profileLink: result.pageProfilePictureLink,
        });
      }
    } catch (e) {
      console.error("getPageInfo e: ", e);
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    if (pageId) {
      getPageInfo();
    }
  }, [pageId, getPageInfo]);
  return (
    <div className={styles.preview}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className={styles.top}>
            <Image
              src={pageInfo.profileLink ? pageInfo.profileLink : DefaultProfile}
              className="avatar"
            />
            <span className="channelName">{pageInfo.name}</span>
          </div>
          <div className={styles.center}>
            <Image
              src={pageInfo.profileLink ? pageInfo.profileLink : DefaultProfile}
              className="avatar"
            />
            <div className="channelName">{pageInfo.name}</div>
            <div className={styles.brand}>Facebook</div>
          </div>
          <div className={styles.bottom}>
            <Image
              src={pageInfo.profileLink ? pageInfo.profileLink : DefaultProfile}
              className="avatar"
            />
            <div className={styles.messageContainer}>
              <div
                className={`message ${message.length === 0 ? "empty" : "text"}`}
              >
                {message.length !== 0 && (
                  <span className={styles.prefix}>
                    {t(
                      "chat.facebookOTN.modal.sendRequest.form.message.prefix"
                    )}
                  </span>
                )}
                {message}
              </div>
              <div className="hint">
                <Trans
                  i18nKey={
                    "chat.facebookOTN.modal.sendRequest.preview.description"
                  }
                  values={{ pageName: pageInfo.name }}
                >
                  By clicking Notify me, you may receive one message from
                  {pageInfo.name} in the future about this topic.
                </Trans>
              </div>
              <div className="button">
                {t("chat.facebookOTN.modal.sendRequest.preview.notifyMe")}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default SendRequestPreview;
