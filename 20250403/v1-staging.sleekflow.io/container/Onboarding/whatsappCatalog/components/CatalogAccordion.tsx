import React from "react";
import { Accordion, Icon, AccordionTitleProps } from "semantic-ui-react";
import styles from "./CatalogAccordion.module.css";
import { useTranslation } from "react-i18next";

export default function CatalogAccordion(props: {
  id: string;
  activeItem: string;
  changeActiveItem?: (active: string) => void;
  catalogName: string;
  businessAccountName: string;
  children: React.ReactNode;
  catalogTitleLabel?: string;
}) {
  const {
    activeItem,
    changeActiveItem,
    catalogName,
    businessAccountName,
    children,
    id,
    catalogTitleLabel,
  } = props;
  const { t } = useTranslation();

  const click = (e: unknown, titleProps: AccordionTitleProps) => {
    const { index } = titleProps;
    const newIndex = activeItem === index || !index ? "" : String(index);
    changeActiveItem && changeActiveItem(newIndex);
  };

  return (
    <Accordion>
      <Accordion.Title active={activeItem === id} index={id} onClick={click}>
        <Icon name="dropdown" />
        {catalogName}
      </Accordion.Title>
      <Accordion.Content active={activeItem === id}>
        <div className={`container ${styles.catalogTitleWrapper}`}>
          <div className={styles.catalogTitleLabel}>
            {catalogTitleLabel ??
              t(
                "onboarding.whatsappCatalog.connectWhatsappPhoneNumber.connectedWaba"
              )}
          </div>
          <h1 className={styles.catalogTitle}>{businessAccountName}</h1>
        </div>
        {children}
      </Accordion.Content>
    </Accordion>
  );
}
