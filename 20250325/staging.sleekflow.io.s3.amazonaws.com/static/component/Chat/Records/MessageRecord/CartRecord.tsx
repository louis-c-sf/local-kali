import React from "react";
import styles from "./CartRecord.module.css";
import { ProfileType } from "types/LoginType";
import { TFunction } from "i18next";
import MessageRecord from "component/Chat/Records/MessageRecord";
import { CartMessageType } from "core/models/Ecommerce/Inbox/CartMessageType";
import { formatCurrency } from "utility/string";
import { Button } from "component/shared/Button/Button";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import { ImagePlaceholder } from "features/Ecommerce/components/ImagePlaceholder/ImagePlaceholder";
import { getCartCurrencies } from "features/Ecommerce/usecases/Inbox/MessageCart/getCartCurrencies";
import { MessageRecordCommonProps } from "component/Chat/Records/MessageRecord/MessageRecordBase";

function total(message: CartMessageType) {
  const items =
    message.extendedMessagePayload.extendedMessagePayloadDetail
      .whatsappCloudApiOrderObject.product_items;
  return items.reduce((acc, i) => acc + i.item_price, 0);
}

export function CartRecord(
  props: MessageRecordCommonProps & {
    message: CartMessageType;
    userId: string;
    pickingMessagesActive: boolean;
  }
): JSX.Element | null {
  const { t } = props;
  const loginDispatch = useAppDispatch();

  const items =
    props.message.extendedMessagePayload.extendedMessagePayloadDetail
      .whatsappCloudApiOrderObject?.product_items ?? [];

  const itemPrices = getCartCurrencies(items);

  const firstImg = items.find((i) => !!i.image_url?.trim())?.image_url;

  return (
    <MessageRecord
      channelTitle={props.channelTitle}
      message={props.message}
      messageQuoted={undefined}
      profile={props.profile}
      userId={props.userId}
      t={props.t}
      pickingMessagesActive={props.pickingMessagesActive}
      senderName={props.senderName}
      senderPic={props.senderPic}
      isShowIcon={props.isShowIcon}
      channelTypeName={props.channelTypeName}
      beforeContent={props.beforeContent}
    >
      <div>
        <div className={styles.body}>
          <div className={`${styles.image} ${firstImg ? "" : styles.empty}`}>
            {firstImg ? (
              <img src={firstImg} />
            ) : (
              <ImagePlaceholder size={"small"} />
            )}
          </div>
          <div className={styles.content}>
            <div className={styles.count}>
              {t("chat.message.cart.items.count", {
                count: items.length,
              })}
            </div>
            {itemPrices.length === 1 && (
              <div>
                {t("chat.message.cart.items.total", {
                  total: formatCurrency(
                    total(props.message),
                    items[0]?.currency ?? "HKD"
                  ),
                })}
              </div>
            )}
          </div>
        </div>
        <div className={styles.actions}>
          <Button
            centerText
            content={t("chat.message.cart.viewCart")}
            onClick={() => {
              loginDispatch({
                type: "INBOX.MESSAGE_CART.OPEN",
                message: props.message,
              });
            }}
          />
        </div>
      </div>
    </MessageRecord>
  );
}
