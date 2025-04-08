import React, { ReactNode, useEffect, useState } from "react";
import styles from "./Header.module.css";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../component/shared/Button/Button";
import { useSalesforceObjectLink } from "../../API/Objects/useSalesforceObjectLink";
import { Icon } from "../../../../component/shared/Icon/Icon";
import { LeadNormalizedType } from "../../API/Leads/fetchLeads";
import { useObjectsGridContext } from "../ObjectsGrid/ObjectsGridContext";
import { Avatar } from "../../../../component/shared/Avatar/Avatar";

export function Header(props: {
  data: LeadNormalizedType;
  statusText: ReactNode;
  name: string;
  buttons?: ReactNode;
  openCreateListNameModule: () => void;
  hasAddToContactListButton: boolean;
}) {
  const { data, hasAddToContactListButton } = props;
  const { t } = useTranslation();

  const { getObjectUrl } = useObjectsGridContext();
  const [linkBooted, setLinkBooted] = useState<string>();
  const { fetchLink } = useSalesforceObjectLink({
    getLeadUrl: getObjectUrl,
  });

  function openSalesforceLink() {
    if (linkBooted === undefined) {
      return;
    }
    window.open(linkBooted, "_blank");
  }

  useEffect(() => {
    fetchLink(data.id)
      .then((link) => {
        if (link) {
          setLinkBooted(link);
        }
      })
      .catch(console.error);
  }, [data.id]);

  return (
    <div className={styles.root}>
      <div className={styles.details}>
        <div className={styles.pic}>
          <Avatar name={props.name} size={"56px"} />
        </div>
        <div>
          <div className={styles.name}>{props.name}</div>
          <div className={styles.status}>{props.statusText}</div>
        </div>
      </div>
      <div className={styles.actions}>
        <Button
          blue
          disabled={linkBooted === undefined}
          className={styles.button}
          onClick={openSalesforceLink}
          content={
            <>
              {t("salesforce.actions.openInSalesforce")}
              <span className={styles.icon}>
                <Icon type={"extLinkBlue"} />
              </span>
            </>
          }
        />
        {hasAddToContactListButton && (
          <Button
            primary
            className={styles.button}
            onClick={props.openCreateListNameModule}
            content={<>{t("salesforce.actions.addToContactList")}</>}
          />
        )}
        {props.buttons}
      </div>
    </div>
  );
}
