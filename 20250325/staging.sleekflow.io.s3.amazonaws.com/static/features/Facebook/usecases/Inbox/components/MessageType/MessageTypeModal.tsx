import { fetchFacebookOTNTopics } from "../../../../API/fetchFacebookOTNTopics";
import { fetchFacebookOTNTopicValidToken } from "../../../../API/fetchFacebookOTNTopicValidToken";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader, Modal } from "semantic-ui-react";
import styles from "./MessageTypeModal.module.css";
import { Selection } from "./Selection";
import {
  HoverDetailType,
  OptionType,
  TopicResponseType,
} from "../../../../models/FacebookOTNTypes";
import SelectionDetail from "./SelectionDetail";
import { getNonPromotionalDict } from "../../helper/getNonPromotionalDict";
import { useAppSelector } from "AppRootContext";
import { equals } from "ramda";
import { fetchCompanyTags } from "api/Company/fetchCompanyTags";
import { HashTagCountedType } from "types/ConversationType";
import { CloseIcon } from "component/shared/modal/CloseIcon";
import InfoIcon from "assets/tsx/icons/InfoIcon";

const MessageTypeModal = (props: {
  onClose: () => void;
  pageId: string | undefined;
  fbReceiverId: string | undefined;
}) => {
  const { onClose, pageId, fbReceiverId } = props;
  const { t } = useTranslation();
  const messageType = useAppSelector(
    (s) => s.inbox.facebook.messageType,
    equals
  );
  const initDetail: HoverDetailType = useAppSelector((s) => {
    const messageType = s.inbox.facebook.messageType;
    if (messageType.value && messageType.selectedOption) {
      return {
        isFacebookOTN: messageType.type === "facebookOTN",
        option: messageType.selectedOption,
      };
    }
    return {
      isFacebookOTN: false,
      option: {
        name: "",
        value: "",
      },
    };
  }, equals);

  const [topics, setTopics] = useState<OptionType[]>([]);
  const [detail, setDetail] = useState<HoverDetailType>(initDetail);
  const [loading, setLoading] = useState(false);
  const { hasHumanAgent } = useAppSelector((s) => s.inbox.facebook.messageType);
  const nonPromotionalDict = getNonPromotionalDict(t, hasHumanAgent);

  const getAvailableToken = useCallback(async () => {
    if (!pageId || !fbReceiverId) return;
    try {
      return await fetchFacebookOTNTopicValidToken(pageId, fbReceiverId);
    } catch (e) {
      console.error("getAvailableToken e: ", e);
    }
  }, [pageId, fbReceiverId]);

  const getTagsInfo = useCallback(async () => {
    try {
      const tags = await fetchCompanyTags(2);
      return tags;
    } catch (e) {
      console.error("getTagsInfo e: ", e);
    }
  }, []);

  const handleTags = (
    allTags: HashTagCountedType[],
    itemTags: string[] | undefined
  ): HashTagCountedType[] | undefined => {
    if (!itemTags) return;
    const newAry: HashTagCountedType[] = [];
    itemTags.forEach((item) => {
      const found = allTags.find((info) => info.id === item);
      if (found) {
        newAry.push(found);
      }
    });
    return newAry;
  };

  const loadTopics = useCallback(async () => {
    if (!pageId) return;
    try {
      setLoading(true);
      const result = await fetchFacebookOTNTopics(pageId);
      const tokenNumberList = await getAvailableToken();
      const tagsInfo = await getTagsInfo();

      if (result && tokenNumberList) {
        const validTopics: OptionType[] = [];
        result.forEach((item: TopicResponseType) => {
          const match = tokenNumberList.find((row) => row.topic === item.topic);
          const tokenNumber = match?.tokenNumber ?? 0;
          const validUntil = match?.validUntil ?? "";
          if (tokenNumber > 0) {
            validTopics.push({
              name: item.topic,
              value: item.id ?? "",
              number: tokenNumber,
              validUntil,
              tags: handleTags(tagsInfo, item.hashTagIds),
            });
          }
        });
        setTopics(validTopics);
      }
    } catch (e) {
      console.error("loadTopics e: ", e);
    } finally {
      setLoading(false);
    }
  }, [pageId, getAvailableToken, getTagsInfo]);

  useEffect(() => {
    if (pageId) {
      loadTopics();
    }
  }, [pageId, loadTopics]);

  return (
    <Modal
      open={messageType.showModal}
      closeOnDimmerClick
      dimmer={true}
      className={styles.modal}
      closeIcon={<CloseIcon />}
      onClose={onClose}
    >
      <div className={styles.title}>
        {t("chat.facebookOTN.modal.messageType.title")}
      </div>
      <div className={styles.content}>
        <div className={styles.selections}>
          {loading ? (
            <Loader />
          ) : (
            topics.length > 0 && (
              <Selection
                subTitle={t("chat.facebookOTN.modal.messageType.promotional")}
                options={topics}
                setDetail={setDetail}
              />
            )
          )}
          <Selection
            subTitle={t("chat.facebookOTN.modal.messageType.nonPromotional")}
            options={nonPromotionalDict}
            setDetail={setDetail}
          />
        </div>
        <SelectionDetail
          detail={detail}
          nonPromotionalDict={nonPromotionalDict}
        />
      </div>
      <div className={styles.hintContainer}>
        <InfoIcon className={styles.infoIcon} />
        <div className={styles.hint}>
          {t("chat.facebookOTN.modal.messageType.hint")}
        </div>
      </div>
    </Modal>
  );
};
export default MessageTypeModal;
