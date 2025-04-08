import React from "react";
import styles from "./MessageCartModal.module.css";
import { Modal } from "semantic-ui-react";
import { useAppSelector, useAppDispatch } from "AppRootContext";
import { useTranslation, Trans } from "react-i18next";
import { Button } from "component/shared/Button/Button";
import { CloseIcon } from "component/shared/modal/CloseIcon";
import { ImagePlaceholder } from "features/Ecommerce/components/ImagePlaceholder/ImagePlaceholder";
import { formatCurrency, formatNumber } from "utility/string";
import { useFeaturesGuard } from "component/Settings/hooks/useFeaturesGuard";
import { InfoTooltip } from "component/shared/popup/InfoTooltip";
import useRouteConfig from "config/useRouteConfig";
import { WhatsappCloudAPIOrderItemType } from "core/models/Message/WhatsappCloudAPIMessageType";
import { getCartCurrencies } from "features/Ecommerce/usecases/Inbox/MessageCart/getCartCurrencies";
import { isWhatsappMessageInCatalog } from "features/WhatsappCloudAPI/models/isWhatsappMessageInCatalog";
import InfoTip from "component/shared/infoTip/InfoTip";
import { Link } from "react-router-dom";

export function MessageCartModal(): JSX.Element | null {
  const cart = useAppSelector((s) => s.inbox.messageCart);
  const route = useRouteConfig();
  const isWhatsappCatalogOn = useAppSelector(
    (s) =>
      s.vendor.whatsappCloudApi.channels.booted &&
      s.inbox.messageCart.message &&
      isWhatsappMessageInCatalog(
        s.inbox.messageCart.message,
        s.vendor.whatsappCloudApi.channels.connectedChannels
      )
  );
  const loginDispatch = useAppDispatch();
  const featuresGuard = useFeaturesGuard();

  const { t } = useTranslation();

  const items: WhatsappCloudAPIOrderItemType[] =
    cart.message?.extendedMessagePayload.extendedMessagePayloadDetail
      .whatsappCloudApiOrderObject.product_items ?? [];

  if (!cart.visible) {
    return null;
  }

  function close() {
    loginDispatch({ type: "INBOX.MESSAGE_CART.CLOSE" });
  }

  function showGenerateLink() {
    if (!cart.message) {
      return;
    }
    loginDispatch({
      type: "INBOX.PAYMENT_LINK.SHOW",
      cartMessage: cart.message,
    });
  }

  const canUseStripePayments = featuresGuard.canUseStripePayments();
  const totals = items.reduce((acc, next) => acc + next.item_price, 0);
  const itemCurrencies = getCartCurrencies(items);

  return (
    <Modal
      open
      className={`
        ${styles.modal}
        ${isWhatsappCatalogOn ? styles.full : styles.brief}
      `}
      onClose={close}
      closeIcon={<CloseIcon />}
    >
      <Modal.Content>
        <div className={styles.body}>
          <div className={styles.head}>
            <div className={styles.title}>
              {t("chat.message.cart.modal.title")}
            </div>
            {!isWhatsappCatalogOn && (
              <div className={styles.tip}>
                <InfoTip noHorizontalOutset>
                  <Trans i18nKey={"chat.message.cart.modal.integrateTip"}>
                    We recommend you{" "}
                    <Link
                      to={route.routeTo("/onboarding/whatsappCatalog")}
                      target={"_blank"}
                    >
                      integrate your WhatsApp Catalog
                    </Link>{" "}
                    to SleekFlow so you can view the items with the product
                    image and name.
                  </Trans>
                </InfoTip>
              </div>
            )}
            <div className={styles.total}>
              {t("chat.message.cart.modal.count", {
                count: items.reduce((acc, next) => acc + next.quantity, 0),
              })}
            </div>
          </div>
          <div className={styles.list}>
            {items.map((item, idx) =>
              isWhatsappCatalogOn ? (
                <ItemFull key={item.product_retailer_id} item={item} />
              ) : (
                <ItemBrief
                  key={item.product_retailer_id}
                  item={item}
                  last={idx + 1 === items.length}
                />
              )
            )}
          </div>
          {(isWhatsappCatalogOn || itemCurrencies.length === 1) && (
            <div className={styles.footer}>
              {itemCurrencies.length === 1 && (
                <div className={styles.total}>
                  {t("chat.message.cart.modal.total", {
                    // @ts-ignore
                    count: formatCurrency(totals, itemCurrencies[0]) as number,
                  })}
                </div>
              )}
              {isWhatsappCatalogOn && (
                <div className={styles.actions}>
                  {canUseStripePayments ? (
                    <Button
                      primary
                      onClick={showGenerateLink}
                      content={t("chat.message.cart.modal.submit")}
                    />
                  ) : (
                    <DisabledButton />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal.Content>
    </Modal>
  );
}

function ItemBrief(props: {
  item: WhatsappCloudAPIOrderItemType;
  last: boolean;
}): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className={`${styles.item} ${props.last ? styles.last : ""}`}>
      <div className={styles.id}>
        {t("chat.message.cart.modal.retailerId", {
          id: props.item.product_retailer_id,
        })}
      </div>
      <div className={styles.quantity}>(Qty: {props.item.quantity})</div>
      <div className={styles.price}>
        {formatPrice(props.item.item_price, props.item.currency)}
      </div>
    </div>
  );
}

function ItemFull(props: { item: WhatsappCloudAPIOrderItemType }): JSX.Element {
  return (
    <div className={styles.item}>
      <div
        className={`${styles.pic} ${props.item.image_url ? "" : styles.empty}`}
      >
        {props.item.image_url ? (
          <img src={props.item.image_url} />
        ) : (
          <ImagePlaceholder size={"small"} />
        )}
      </div>
      <div className={styles.productName}>{props.item.name}</div>
      <div className={styles.price}>
        {formatPrice(props.item.item_price, props.item.currency)} (Qty:{" "}
        {props.item.quantity})
      </div>
    </div>
  );
}

function DisabledButton() {
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();

  return (
    <InfoTooltip
      placement={"top"}
      trigger={
        <Button
          className={`${styles.hoverable} ${styles._} disabled`}
          content={t("chat.message.cart.modal.submit")}
        />
      }
    >
      <Trans i18nKey={"chat.message.cart.modal.activateStripe"}>
        Activate Stripe Payment feature in{" "}
        <a href={routeTo("/channels", true)} target={"_blank"}>
          Channels
        </a>
        to create payment link of selected cart items.
      </Trans>
    </InfoTooltip>
  );
}

function formatPrice(amount: number, currency?: string) {
  let options: Intl.NumberFormatOptions = {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  };
  if (currency) {
    options = { ...options, style: "currency", currency };
  }
  return formatNumber(Number(amount.toFixed(2)), {
    ...options,
  });
}
