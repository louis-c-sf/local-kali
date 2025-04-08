import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Dimmer,
  Dropdown,
  DropdownItemProps,
  Loader,
  Modal,
  Pagination,
  PaginationProps,
  Portal,
  Ref,
  DropdownProps,
} from "semantic-ui-react";
import { TabMenu } from "component/shared/nav/TabMenu";
import ProductList from "./ShareProductModal/ProductList";
import styles from "./ShareProductModal.module.css";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import { CloseIcon } from "component/shared/modal/CloseIcon";
import { useDebouncedCallback } from "use-debounce/lib";
import { usePopperPopup } from "component/shared/popup/usePopperPopup";
import SearchResultItem from "./ShareProductModal/SearchResultItem";
import { Moment } from "moment";
import { PaymentLinkSetType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import { useSupportedRegions } from "core/models/Region/useSupportedRegions";
import { ProductSearch } from "./ShareProductModal/ProductSearch";
import { CartDisplay } from "./Cart/CartDisplay";
import { ProductVariantsDisplay } from "./ShareProductModal/ProductVariantsDisplay";
import { ProductGenericType } from "core/models/Ecommerce/Cart/ProductGenericType";
import {
  useProductCartContext,
  ShoppingVendorType,
} from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal/ProductCartContext";
import { useCartCalculationFlow } from "features/Ecommerce/usecases/Inbox/Share/Cart/useCartCalculationFlow";
import { retryPromise } from "lib/rxjs/retryPromise";
import { fetchMessageTemplate } from "api/Chat/Shopify/fetchMessageTemplate";
import { PAYMENT_LINK_TOKEN } from "App/reducers/Chat/paymentLinkReducer";
import {
  isSimplePaginated,
  isGroupPaginated,
} from "core/models/Ecommerce/Cart/ProductProviderInterface";
import { GroupPagination } from "features/Salesforce/components/GroupPagination/GroupPagination";
import { fetchSleekPayStatus } from "api/StripePayment/fetchSleekPayStatus";
import moment from "moment/moment";
import * as Sentry from "@sentry/browser";
import { MenuItemProps } from "semantic-ui-react/dist/commonjs/collections/Menu/MenuItem";
import { equals } from "ramda";
import { getProductName } from "features/Ecommerce/vendor/CommerceHub/toGenericProduct";
import { Icon } from "component/shared/Icon/Icon";
import { ShopifyProductProvider } from "features/Ecommerce/vendor/Shopify/ShopifyProductProvider";

export type CART_TAB_TYPE = "payment" | "product";

export interface PaymentCartFormType {
  expiredAt?: Moment;
  selectedTab: CART_TAB_TYPE;
}

export function ShareProductModal(props: {
  storeId: number | string;
  hiddenShareProduct: boolean;
  onSubmitPaymentLink?: (paymentLink: PaymentLinkSetType) => void;
}) {
  const loginDispatch = useAppDispatch();
  const userProfileId = useAppSelector((s) => s.profile.id);
  const vendor = useAppSelector((s) => s.inbox.product?.vendor);
  const language = useAppSelector((s) => s.inbox.product?.language);

  const closeModal = useCallback(() => {
    loginDispatch({
      type: "INBOX.SHOPIFY_MODAL.CLOSE",
      storeId: props.storeId,
      userProfileId,
      vendor: vendor as ShoppingVendorType,
    });
  }, [loginDispatch, vendor, userProfileId, props.storeId]);

  return (
    <Modal
      closeIcon={<CloseIcon />}
      open
      closeOnDimmerClick={true}
      mountNode={document.body}
      onClose={closeModal}
      className={styles.modal}
    >
      <ShopifyProductModalContent
        closeModal={closeModal}
        storeId={props.storeId}
        language={language ?? ""}
        hiddenShareProduct={props.hiddenShareProduct}
        onSubmitPaymentLink={props.onSubmitPaymentLink}
      />
    </Modal>
  );
}

function ShopifyProductModalContent(props: {
  storeId: number | string;
  language: string;
  closeModal: () => void;
  hiddenShareProduct: boolean;
  onSubmitPaymentLink?: (paymentLink: PaymentLinkSetType) => void;
}) {
  const { hiddenShareProduct } = props;
  const [selectedTab, setSelectedTab] = useState<"products" | "cart">(
    "products"
  );
  const { t } = useTranslation();
  const regions = useSupportedRegions();
  const cartItems = useAppSelector((s) => s.inbox.product?.cart ?? [], equals);
  const productId = useAppSelector((s) => s.inbox.product?.productId ?? null);
  const languages = useAppSelector(
    (s) => s.inbox.product?.languages ?? [],
    equals
  );
  const profileId = useAppSelector((s) => s.profile.id);

  const [search, setSearch] = useState("");
  const [searchRef, setSearchRef] = useState<HTMLElement | null>(null);
  const [searchedProductNames, setSearchedProductNames] = useState<
    DropdownItemProps[] | null
  >(null);

  const productCart = useProductCartContext();

  const [selectedProductId, setSelectedProductId] = useState<
    number | string | null
  >(productId ?? null);

  const [linkMessageTemplate, setLinkMessageTemplate] = useState<string>();
  const [popupNode, setPopupNode] = useState<HTMLElement | null>(null);

  const supportedCurrencies = productCart.currenciesBooted ?? [];

  const calculationFlow = useCartCalculationFlow({
    linkMessageTemplate,
    onSubmitPaymentLink: props.onSubmitPaymentLink,
    currency: productCart.selectedCurrency as string,
    onClose: props.closeModal,
    storeId: props.storeId,
    isShopifyPaymentLink: productCart.isShopifyPaymentLink,
  });

  useEffect(() => {
    if (!productCart.paymentGateway.canUsePayments()) {
      calculationFlow.form.setFieldValue(
        "selectedTab",
        "product" as CART_TAB_TYPE
      );
    }
  }, [productCart.paymentGateway.canUsePayments()]);

  useEffect(() => {
    const fetchTemplate$ = retryPromise(fetchMessageTemplate(), 5, 500);

    const subscribed = fetchTemplate$.subscribe({
      next: ([template]) => {
        setLinkMessageTemplate(
          template.messageBody.replace("{0}", PAYMENT_LINK_TOKEN)
        );
      },
      error: () => {
        setLinkMessageTemplate(t("chat.paymentLink.sendTemplate"));
      },
    });

    return () => {
      subscribed.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!regions.booted) {
      regions.boot();
    }
  }, [regions.booted]);

  const products = productCart.productProvider.getProductsLoaded();

  useEffect(() => {
    setSearch("");
    setSearchedProductNames(null);
    const selectedCurrency = productCart.selectedCurrency;
    if (!selectedCurrency) {
      return;
    }
    productCart.productProvider.fetchFirstPage({
      currency: selectedCurrency,
      storeId: props.storeId,
    });
  }, [productCart.selectedCurrency]);

  function onClick(productId: number | string | undefined) {
    setSelectedProductId(productId ?? null);
  }

  const selectedProduct = productCart.productProvider
    .getProductsLoaded()
    ?.items?.find((p) => p.productId === selectedProductId);

  function loadSearchPage(search: string) {
    setSearchedProductNames(null);
    const selectedCurrency = productCart.selectedCurrency;
    if (!selectedCurrency) {
      return;
    }
    productCart.productProvider.searchProducts(
      props.storeId,
      search,
      selectedCurrency
    );
  }

  const [debounceSearchProducts] = useDebouncedCallback((search: string) => {
    const reg = new RegExp(search, "ig");
    const selectedCurrency = productCart.selectedCurrency;
    if (!selectedCurrency) {
      return;
    }
    productCart.productProvider
      .suggestProducts(props.storeId, search, selectedCurrency)
      .then((res) => {
        setSearchedProductNames(
          res.map((p) => {
            const title = getProductName(p, props.language) ?? "";
            const firstMatch = [title, p.sku ?? ""].find((t) => t.match(reg));
            const matchAll = [...(firstMatch ?? "").matchAll(reg)];
            const content = matchAll.map((value, index) => (
              <SearchResultItem
                key={`searchResult_index${index}`}
                nextIndex={matchAll[index + 1]?.index}
                value={value}
                currentIndex={index}
                title={firstMatch ?? title}
              />
            ));
            return {
              id: `${p.productId}`,
              key: p.productId,
              content: content.length > 0 ? content : firstMatch ?? title,
              onClick: () => loadSearchPage(title),
            };
          })
        );
      });
  }, 1500);

  const count =
    search.trim() === "" ? products?.count ?? 0 : products?.items.length ?? 0;

  const totalPages = Math.ceil(
    (count ?? 0) / productCart.productProvider.getPageSize()
  );

  function changeSimplePage(e: React.MouseEvent, data: PaginationProps) {
    const selectedCurrency = productCart.selectedCurrency;
    if (!selectedCurrency) {
      return;
    }
    productCart.productProvider.fetchProductsPage({
      page: data.activePage as number,
      currency: selectedCurrency,
      storeId: props.storeId,
    });
  }

  useLayoutEffect(() => {
    if (popupNode && searchRef?.clientWidth) {
      popupNode.style.setProperty(
        "width",
        `${searchRef.clientWidth}px`,
        "important"
      );
      popupNode
        .querySelector(".scrolling.menu")
        ?.setAttribute(
          "style",
          `width: ${searchRef.clientWidth}px !important;`
        );
    }
  }, [popupNode, searchRef?.clientWidth]);

  useEffect(() => {
    const selectedCurrency = productCart.selectedCurrency;
    if (selectedCurrency === undefined) {
      return;
    }
    const regionMatch = regions.currenciesSupported.find(
      (c) => c.currencyCode.toLowerCase() === selectedCurrency.toLowerCase()
    );
    if (!regionMatch) {
      calculationFlow.form.setFieldValue("selectedTab", "product");
      return;
    }

    fetchSleekPayStatus(regionMatch.countryCode)
      .then((res) => {
        if (res.paymentLinkExpirationOption.expireNumberOfDaysAfter) {
          calculationFlow.form.setFieldValue(
            "expiredAt",
            moment().add(
              res.paymentLinkExpirationOption.expireNumberOfDaysAfter,
              "day"
            )
          );
        }
      })
      .catch((e) => {
        console.error(`fetchSleekPayStatus ${e}`);
        Sentry.captureEvent(e);
      });
  }, [productCart.selectedCurrency]);

  const handleSearch = (search: string) => {
    if (search) {
      setSearch(search);
      return debounceSearchProducts(search);
    } else {
      clearSearch();
    }
  };

  const refreshSearch = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      const selectedCurrency = productCart.selectedCurrency;
      if (!selectedCurrency) {
        return;
      }
      productCart.productProvider.searchProducts(
        props.storeId,
        search,
        selectedCurrency
      );
    }
  };

  function clearSearch() {
    setSearch("");
    setSearchedProductNames(null);
    const selectedCurrency = productCart.selectedCurrency;
    if (!selectedCurrency) {
      return;
    }
    productCart.productProvider.fetchFirstPage({
      currency: selectedCurrency,
      storeId: props.storeId,
    });
  }

  const loginDispatch = useAppDispatch();

  usePopperPopup(
    {
      popupRef: popupNode,
      anchorRef: searchRef,
      onClose: () => setSearchedProductNames(null),
      placement: "bottom-start",
      offset: [0, 0],
      ignoreOutsideClickNodes: [],
      closeOnOutsideClick: true,
    },
    []
  );

  function onBackLinkClick() {
    setSelectedProductId(null);
  }

  function updateProduct(
    productId: number | string,
    product: ProductGenericType
  ) {
    productCart.productProvider.updateProductVariants(product);
  }

  const showProductsTab = () => setSelectedTab("products");

  const showCartTab = () => {
    setSelectedTab("cart");
    calculationFlow.recalculate();
  };

  const tabItems: MenuItemProps[] = [
    {
      content: t("chat.shopifyProductsModal.products.title"),
      active: selectedTab === "products",
      key: "products",
      onClick: showProductsTab,
    },
    {
      content: (
        <div className={styles.cartTab}>
          {t("chat.shopifyProductsModal.cart.title")}
          {cartItems.length > 0 && (
            <span className={styles.cartItems}>{cartItems.length}</span>
          )}
        </div>
      ),
      active: selectedTab === "cart",
      key: "cart",
      onClick: showCartTab,
    },
  ];

  const updateLanguage = useCallback(
    (_: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
      loginDispatch({
        type: "INBOX.CART.LANGUAGE_SELECTED",
        language: data.value as string,
      });
    },
    []
  );

  const refreshShopifyProduct = () => {
    (productCart.productProvider as ShopifyProductProvider).syncShopifyProduct(
      props.storeId
    );
    clearSearch();
  };

  return (
    <Modal.Content className={styles.modalContent}>
      <div className={styles.header}>
        <TabMenu
          underscore={"thin"}
          size={"large"}
          defaultActiveIndex={0}
          items={tabItems}
        />
        {selectedTab === "products" && (
          <div className={styles.selectors}>
            {languages.length > 1 && (
              <div className="ui input">
                <Dropdown
                  selection
                  selectOnBlur={false}
                  value={props.language}
                  onChange={updateLanguage}
                  options={languages.map((lang) => ({
                    value: lang.code,
                    text: lang.name,
                  }))}
                />
              </div>
            )}
            {supportedCurrencies.length > 0 ? (
              <div className="ui input">
                <Dropdown
                  selection
                  selectOnBlur={false}
                  value={productCart.selectedCurrency}
                  options={supportedCurrencies.map((c) => ({
                    key: c,
                    text: c.toUpperCase(),
                    value: c.toUpperCase(),
                  }))}
                  onChange={(_, { value }) => {
                    loginDispatch({
                      type: "INBOX.CART.CLEAR",
                      storeId: props.storeId,
                      userProfileId: profileId,
                      vendor: productCart.vendor,
                      currency: value as string,
                    });
                  }}
                />
              </div>
            ) : null}
          </div>
        )}
      </div>
      {selectedTab === "products" && products && (
        <Ref innerRef={setSearchRef}>
          <ProductSearch
            keydown={refreshSearch}
            clearSearch={clearSearch}
            search={search}
            setSearch={handleSearch}
          />
        </Ref>
      )}
      {searchedProductNames && (
        <Portal open mountNode={searchRef?.parentElement ?? document.body}>
          <div
            ref={setPopupNode}
            className="app ui popup visible dialog dropdown static"
          >
            <Dropdown.Menu scrolling open>
              {searchedProductNames.map((name) => (
                <Dropdown.Item onClick={name.onClick} key={name.id}>
                  {name.content}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </div>
        </Portal>
      )}
      <Dimmer.Dimmable className={styles.productModal}>
        <Dimmer
          inverted
          active={
            products?.items === undefined ||
            productCart.productProvider.getIsLoading() ||
            productCart.currenciesBooted === undefined
          }
        >
          <Loader active={true} />
        </Dimmer>
        {selectedTab === "cart" && products && (
          <CartDisplay
            closeModal={props.closeModal}
            currency={productCart.selectedCurrency as string}
            hiddenShareProduct={hiddenShareProduct}
            onSubmitPaymentLink={props.onSubmitPaymentLink}
            form={calculationFlow.form}
            quantity={calculationFlow.quantity}
            loading={calculationFlow.loading}
            selectedOrderItems={calculationFlow.selectedOrderItems}
            storeId={props.storeId}
          />
        )}
        {selectedTab === "products" &&
          products &&
          (selectedProduct ? (
            <ProductVariantsDisplay
              currency={productCart.selectedCurrency}
              updateProduct={updateProduct}
              closeModal={props.closeModal}
              storeId={props.storeId}
              product={selectedProduct}
              clearSelection={onBackLinkClick}
              hiddenShareProduct={hiddenShareProduct}
              language={props.language}
            />
          ) : (
            <div className={styles.productList}>
              <ProductList onClick={onClick} products={products.items} />
            </div>
          ))}
      </Dimmer.Dimmable>
      {selectedTab === "products" && products && !selectedProduct && (
        <div className={styles.footer}>
          <span className={styles.count}>
            {isSimplePaginated(productCart.productProvider) &&
              t("chat.shopifyProductsModal.products.count", {
                count: count,
              })}
          </span>
          {count > 0 && totalPages > 1 && (
            <div className={styles.pagination}>
              {isSimplePaginated(productCart.productProvider) && (
                <Pagination
                  className={styles.paging}
                  totalPages={totalPages}
                  activePage={productCart.productProvider.getPage()}
                  onPageChange={changeSimplePage}
                />
              )}
              {isGroupPaginated(productCart.productProvider) && (
                <GroupPagination
                  disabled={false}
                  page={productCart.productProvider.getPage()}
                  groupResultCount={productCart.productProvider.getGroupResultCount()}
                  pagesPerGroup={productCart.productProvider.getPagesPerGroup()}
                  pageSize={productCart.productProvider.getPageSize()}
                  prevToken={productCart.productProvider.getPrevToken()}
                  nextToken={productCart.productProvider.getNextToken()}
                  onPageChange={productCart.productProvider.handlePageChange.bind(
                    productCart.productProvider
                  )}
                  onPrevGroup={productCart.productProvider.handlePrevGroup.bind(
                    productCart.productProvider
                  )}
                  onNextGroup={productCart.productProvider.handleNextGroup.bind(
                    productCart.productProvider
                  )}
                />
              )}
            </div>
          )}
          <div
            className={styles.refreshButtonWrapper}
            onClick={refreshShopifyProduct}
          >
            <div className={styles.refreshButton}>
              <Icon type="refresh" />
            </div>
            <span>
              {t("chat.shopifyProductsModal.products.button.refresh")}
            </span>
          </div>
        </div>
      )}
    </Modal.Content>
  );
}
