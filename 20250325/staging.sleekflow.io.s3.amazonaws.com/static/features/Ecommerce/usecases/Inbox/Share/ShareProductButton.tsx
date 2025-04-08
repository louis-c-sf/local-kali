import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "component/shared/Button/Button";
import { InfoTooltip } from "component/shared/popup/InfoTooltip";
import { useTranslation } from "react-i18next";
import { Dropdown, DropdownItemProps, Portal, Ref } from "semantic-ui-react";
import styles from "./ShopifyProductButton.module.css";
import StoreImg from "./assets/tsx/Store";
import { ShareProductModal } from "./ShareProductModal";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import { usePopperPopup } from "component/shared/popup/usePopperPopup";
import { isRef } from "utility/isRef";
import { PaymentLinkSetType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import {
  ProductCartContext,
  ShoppingVendorType,
} from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal/ProductCartContext";
import useFetchShopifyStatus from "api/Channel/useFetchShopifyStatus";
import PayShopifyModal from "component/Chat/ShopifyWidget/PayShopifyModal";
import { StoreOptionType } from "core/models/Ecommerce/Cart/ProductProviderInterface";
import { StoreConfigOption } from "features/Ecommerce/usecases/Inbox/Share/StoreConfigOption";

interface StoreDropdownItemProps extends DropdownItemProps {
  id: number | string;
  vendor: ShoppingVendorType;
  language: string;
  languages: Array<{ code: string; name: string }>;
}

export default function ShareProductButton(props: {
  hiddenShareProduct?: boolean;
  triggerButton?: ReactNode;
  onSubmitPaymentLink?: (paymentLink: PaymentLinkSetType) => void;
  standalone: boolean;
  storeChoices: StoreOptionType[];
}) {
  const { triggerButton, hiddenShareProduct = false } = props;
  const { t } = useTranslation();
  const [selectedStore, setSelectedStore] = useState<StoreDropdownItemProps>();
  const loginDispatch = useAppDispatch();
  const userProfileId = useAppSelector((s) => s.profile.id);
  const isModalVisible = useAppSelector((s) => s.inbox.product?.showModal);

  const storeConfigsOptions = props.storeChoices.map((item) => ({
    name: item.name,
    text: item.name,
    value: item.id,
    id: item.id,
    key: item.id,
    vendor: item.vendor,
    language: item.language,
    languages: item.languages,
    onClick: () => selectStore(item),
    content: <StoreConfigOption name={item.name} vendor={item.vendor} />,
  }));

  const [firstStore] = storeConfigsOptions;

  const shopifyStatus = useFetchShopifyStatus();
  const [openExpiredModal, setOpenExpiredModal] = useState(false);
  useEffect(() => {
    if (shopifyStatus.storeStatus === undefined) {
      shopifyStatus.refresh();
    }
  }, [shopifyStatus.storeStatus?.map((c) => c.id).join()]);

  function selectStore(item: StoreDropdownItemProps) {
    if (
      shopifyStatus.expiredShopifyStoreConfigs?.some(
        (config) => config.id === item.id
      )
    ) {
      setOpenExpiredModal(true);
      return;
    }

    setSelectedStore(item);
    if (item.vendor === "commerceHub") {
      loginDispatch({
        type: "INBOX.SHOPIFY_MODAL.OPEN",
        storeId: item.id as string,
        vendor: "commerceHub",
        userProfileId: userProfileId,
        language: item.language,
        languages: item.languages,
      });
      return;
    }

    loginDispatch({
      type: "INBOX.SHOPIFY_MODAL.OPEN",
      storeId: item.id as number,
      vendor: item.vendor,
      language: undefined,
      languages: [],
    });
  }

  const trigger =
    storeConfigsOptions.length > 1 ? (
      <StoreSelectionButton
        shopifyOptions={storeConfigsOptions}
        triggerButton={triggerButton}
      />
    ) : (
      <StoreButton onClick={() => selectStore(firstStore)} as={triggerButton} />
    );

  return (
    <>
      <InfoTooltip
        placement="top"
        children={t("chat.actions.product.add")}
        offset={[50, 10]}
        trigger={trigger}
      />
      {isModalVisible && selectedStore && (
        <ProductCartContext
          service={selectedStore.vendor}
          storeId={selectedStore.id}
        >
          <ShareProductModal
            storeId={selectedStore.id}
            hiddenShareProduct={hiddenShareProduct}
            onSubmitPaymentLink={props.onSubmitPaymentLink}
          />
        </ProductCartContext>
      )}
      {openExpiredModal && <PayShopifyModal setOpen={setOpenExpiredModal} />}
    </>
  );
}

function StoreButton(props: { onClick: () => void; as?: ReactNode }) {
  const { onClick, as } = props;
  if (as) {
    return <div onClick={onClick}>{as}</div>;
  }
  return (
    <Button className={styles.button} onClick={onClick}>
      <StoreImg className={styles.store} />
    </Button>
  );
}

function StoreSelectionButton(props: {
  shopifyOptions: StoreDropdownItemProps[];
  triggerButton?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [popupNode, setPopupNode] = useState<HTMLElement | null>(null);
  const [triggerRef, setTriggerRef] = useState<HTMLElement | null>(null);
  const triggerRefInner = useRef<HTMLElement | null>(null);
  let passTriggerRef = null;

  if (triggerRef !== null) {
    if (!isRef(triggerRef)) {
      passTriggerRef = triggerRefInner;
      triggerRefInner.current = triggerRef as HTMLElement | null;
    } else {
      passTriggerRef = triggerRef;
    }
  }
  usePopperPopup(
    {
      popupRef: popupNode,
      anchorRef: triggerRef,
      onClose: () => setOpen(false),
      placement: "top",
      offset: [0, 0],
      ignoreOutsideClickNodes: [],
      closeOnOutsideClick: true,
    },
    []
  );

  function onItemClick(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    data: DropdownItemProps,
    onClick?: (
      event: React.MouseEvent<HTMLDivElement, MouseEvent>,
      data: DropdownItemProps
    ) => void
  ) {
    setOpen(false);
    onClick?.(event, data);
  }

  return (
    <>
      <Ref innerRef={setTriggerRef}>
        <StoreButton onClick={() => setOpen(!open)} as={props.triggerButton} />
      </Ref>
      {open && (
        <CatalogListPopUp
          onItemClick={onItemClick}
          passTriggerRef={passTriggerRef}
          triggerRef={triggerRef?.parentElement?.parentElement}
          shopifyOptions={props.shopifyOptions}
          setPopupNode={setPopupNode}
        />
      )}
    </>
  );
}

export function CatalogListPopUp(props: {
  triggerRef?: HTMLElement | null;
  passTriggerRef: React.Ref<HTMLElement> | undefined;
  setPopupNode: (ref: HTMLElement | null) => void;
  shopifyOptions: StoreDropdownItemProps[];
  onItemClick: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    data: DropdownItemProps,
    onClick?: (
      event: React.MouseEvent<HTMLDivElement, MouseEvent>,
      data: DropdownItemProps
    ) => void
  ) => void;
}) {
  const {
    triggerRef,
    passTriggerRef,
    setPopupNode,
    shopifyOptions,
    onItemClick,
  } = props;
  const { t } = useTranslation();

  return (
    <Portal
      closeOnDocumentClick
      className={styles.popup}
      triggerRef={passTriggerRef}
      mountNode={triggerRef?.parentElement?.parentElement ?? document.body}
      open
    >
      <div
        ref={setPopupNode}
        className={`app ui searchable visible dialog dropdown static ${styles.dropdown}`}
      >
        <Dropdown.Menu open scrolling>
          <Dropdown.Header>{t("chat.actions.product.header")}</Dropdown.Header>
          {shopifyOptions.map((item, index) => (
            <Dropdown.Item
              key={`shopifyOptions_${index}`}
              onClick={(event, data) => {
                onItemClick(event, data, item.onClick);
              }}
              value={item.value}
            >
              {item.content}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </div>
    </Portal>
  );
}
