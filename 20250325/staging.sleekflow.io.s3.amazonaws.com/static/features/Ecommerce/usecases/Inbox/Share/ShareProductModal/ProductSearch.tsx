import React from "react";
import { useTranslation } from "react-i18next";
import styles from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal.module.css";
import { Input, Icon } from "semantic-ui-react";

export function ProductSearch(props: {
  keydown: (e: React.KeyboardEvent) => void;
  clearSearch: () => void;
  setSearch: (search: string) => void;
  search: string;
}) {
  const { search, setSearch } = props;
  const { t } = useTranslation();
  return (
    <div className={styles.search}>
      <Input
        onKeyDown={props.keydown}
        placeholder={t("chat.shopifyProductsModal.products.search.placeholder")}
        icon={"search"}
        iconPosition={"left"}
        value={props.search}
        onChange={(_, data) => setSearch(data.value)}
      />
      {search.trim() !== "" && (
        <Icon
          className={styles.closeIcon}
          name={"close"}
          onClick={props.clearSearch}
        />
      )}
    </div>
  );
}
