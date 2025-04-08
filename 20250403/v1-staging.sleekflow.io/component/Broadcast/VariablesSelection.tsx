import {
  DropdownItemProps,
  Loader,
  StrictDropdownItemProps,
} from "semantic-ui-react";
import React, { CSSProperties, useContext, useState } from "react";
import { pasteHtmlAtCaret } from "./pasteHtmlAtCaret";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../shared/popup/InfoTooltip";
import { useCompanyVariables } from "../Settings/hooks/useCompanyVariables";
import { SearchInput } from "../shared/input/SearchInput";
import styles from "./VariablesSelection.module.css";
import utilStyles from "../shared/Utils.module.css";
import BroadcastContext from "./BroadcastContext";
import getIsReadOnlyCampaign from "./helpers/getIsReadOnlyCampaign";
import iconStyles from "../shared/Icon/Icon.module.css";
import ShareProductButton from "features/Ecommerce/usecases/Inbox/Share/ShareProductButton";
import { PaymentLinkSetType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import { PaymentLinkDialog } from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/PaymentLinkDialog";
import {
  EcommerceStoresContext,
  useEcommerceStores,
} from "features/Ecommerce/components/EcommerceStoresContext";
import { SendPaymentLinkContext } from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/contracts/SendPaymentLinkContext";

export function VariablesSelection(props: {
  updateText: (text: string) => void;
  textareaId: string;
  isSearchable: boolean;
  bordered?: boolean;
  restrictHeight?: number;
  hideHeader?: boolean;
  compactItems?: boolean;
  fluid?: boolean;
  enablePaymentLink?: boolean;
  showGroupName?: boolean;
  disabled?: boolean;
}) {
  const { disabled = false } = props;
  const { t } = useTranslation();
  const { status, broadcastDispatch, stripePaymentRequestOption } =
    useContext(BroadcastContext);
  const isReadOnly = getIsReadOnlyCampaign(status);
  const { variables: options } = useCompanyVariables();
  const [searchText, updateSearching] = useState("");
  const [isDisplayGenerateLink, setIsDisplayGenerateLink] = useState(false);
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const {
    isSearchable,
    enablePaymentLink = false,
    showGroupName = false,
  } = props;
  const style: CSSProperties = {};
  if (props.restrictHeight) {
    style.height = "auto";
    style.maxHeight = `${props.restrictHeight}px`;
  }

  function insertVariable(data: DropdownItemProps) {
    const selectedParamName = data.value as string;
    const selectedValue = "{{" + selectedParamName + "}}";
    const textarea: HTMLTextAreaElement = document.getElementById(
      props.textareaId
    ) as HTMLTextAreaElement;
    if (textarea) {
      if (selectedValue.length > 1) {
        const sel = window.getSelection();
        if (sel) {
          pasteHtmlAtCaret(`${selectedValue}`, textarea);
          textarea.focus();
        }
        props.updateText(textarea.value);
      }
    }
  }

  function filterOptions(option: StrictDropdownItemProps) {
    //remove labels since labels will always empty from backend
    if ((option.value as string) === "labels") {
      return false;
    }
    if (isSearchable) {
      return (option.value as string).includes(searchText);
    }
    return true;
  }

  return (
    <div
      className={`${styles.component} ${utilStyles.noScrollY}
      ${props.bordered ? styles.bordered : ""}
      ${props.fluid ? styles.fluid : ""}
      `}
      style={style}
    >
      <div className={styles.items}>
        <div className={styles.prefix}>
          {!props.hideHeader && (
            <InfoTooltip
              placement={"left"}
              children={t("broadcast.tooltip.campaign.variables.header")}
              trigger={
                <div className={`${styles.itemHeader}`}>
                  <h4 className={styles.headerWrap}>
                    {t("broadcast.edit.field.variables.label")}
                    {options.length === 0 && (
                      <Loader active={true} size={"tiny"} inline />
                    )}
                  </h4>
                </div>
              }
            />
          )}
          {props.isSearchable && (
            <div className={styles.search}>
              <SearchInput
                onChange={(e) => updateSearching(e.target.value)}
                reset={() => updateSearching("")}
                setInputRef={setInputRef}
                hasQuery={searchText.trim() !== ""}
                query={searchText}
                loading={false}
                disabled={isReadOnly || disabled}
                noMargins
              />
            </div>
          )}
          {enablePaymentLink && (
            <>
              {showGroupName && (
                <div className={styles.groupName}>
                  {t("broadcast.edit.field.variables.paymentLink.label")}
                  <InfoTooltip
                    placement="bottom"
                    children={t(
                      "broadcast.tooltip.campaign.variables.paymentLink"
                    )}
                    trigger={
                      <i className={`${iconStyles.icon} ${styles.infoIcon}`} />
                    }
                  />
                </div>
              )}
              {stripePaymentRequestOption ? (
                <div className={styles.editPaymentLink}>
                  <div
                    className={`${styles.item} ${styles.currentPaymentLink}`}
                    onClick={() => insertVariable({ value: "payment_url" })}
                  >
                    {"{{payment_url}}"}
                  </div>
                  <div
                    className={`${styles.item} ${styles.editPaymentLinkBtn}`}
                    onClick={() =>
                      broadcastDispatch({ type: "CLEAR_PAYMENT_LINK" })
                    }
                  >
                    {t("broadcast.edit.field.variables.paymentLink.clearLink")}
                  </div>
                </div>
              ) : (
                <div className={styles.addPaymentItem}>
                  <EcommerceStoresContext standalone>
                    <ShareProduct />
                  </EcommerceStoresContext>
                  <div
                    onClick={() => setIsDisplayGenerateLink(true)}
                    className={styles.addPaymentLink}
                  >
                    <i className={`${iconStyles.icon} ${styles.plusIcon}`} />
                    {t(
                      "broadcast.edit.field.variables.paymentLink.createCustomLink"
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          {showGroupName && (
            <div className={styles.groupName}>
              {t("broadcast.edit.field.variables.general.label")}
            </div>
          )}
          {options.filter(filterOptions).map((option, key) => (
            <div
              key={key}
              className={styles.item}
              onClick={
                isReadOnly || disabled
                  ? undefined
                  : () => insertVariable(option)
              }
            >
              {"{{ "}
              {option.text}
              {" }}"}
            </div>
          ))}
        </div>
      </div>
      {isDisplayGenerateLink && (
        <SendPaymentLinkContext value={{ supportImageUpload: false }}>
          <PaymentLinkDialog
            onClose={() => setIsDisplayGenerateLink(false)}
            onSubmit={(link) =>
              broadcastDispatch({ type: "UPDATE_PAYMENT_LINK", link })
            }
          />
        </SendPaymentLinkContext>
      )}
    </div>
  );
}

function ShareProduct() {
  const { broadcastDispatch } = useContext(BroadcastContext);
  const stores = useEcommerceStores();
  const { t } = useTranslation();

  return (
    <ShareProductButton
      standalone
      storeChoices={stores.storeChoices}
      onSubmitPaymentLink={(link: PaymentLinkSetType) => {
        broadcastDispatch({
          type: "UPDATE_PAYMENT_LINK",
          link,
        });
      }}
      hiddenShareProduct
      triggerButton={
        <div className={styles.addPaymentLink}>
          <i className={`${iconStyles.icon} ${styles.plusIcon}`} />
          {t("broadcast.edit.field.variables.paymentLink.createShopifyLink")}
        </div>
      }
    />
  );
}
