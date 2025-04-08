import React, { ErrorInfo, useEffect } from "react";
import styles from "./GlobalBoundary.module.css";
import WindowImg from "./assets/window.svg";
import { Button, Image } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import * as Sentry from "@sentry/browser";
import { useAppSelector } from "AppRootContext";
import { equals } from "ramda";
import { flushRecords } from "utility/debug/actionsLoggerMiddleware";
import { Link } from "react-router-dom";

export const DISPLAY_ERROR_LOG_COMPANY_ID = [
  "4c543d7e-bb9c-43f0-87b7-cb9fe90870b0",
  "820a5a3f-1f6a-4d58-8247-cb8b81655c80",
  "07959d97-3a5a-4155-a240-e9f47dba13fa",
  "2c89da3c-ade0-4d32-a456-4c061425df05",
];
const ErrorContent = (props: {
  redirectLink?: string;
  onClick?: () => void;
  error?: Error;
  errorInfo?: ErrorInfo;
}) => {
  const [_, addressLang] = window.location.pathname.split("/");
  const {
    redirectLink = `/${addressLang}/inbox/all`,
    error,
    errorInfo,
  } = props;
  const { t } = useTranslation();
  const search = window.location.search;
  const searchParams = new URLSearchParams(search);
  const errorContent = searchParams.get("error_description");
  const user = useAppSelector((s) => s.loggedInUserDetail, equals);
  const companyId = useAppSelector((s) => s.company?.id ?? "");

  useEffect(() => {
    Sentry.captureException(error, (scope) => {
      if (user) {
        const { userInfo } = user;
        scope.setUser({
          id: [
            userInfo.firstName,
            userInfo.lastName,
            userInfo.userName,
            user.staffId,
          ].join(" "),
          ip_address: scope.getUser()?.ip_address,
        });
      }
      scope.setContext("globalBoundary", {
        componentStack: errorInfo?.componentStack,
      });
      scope.setContext("redux", {
        actionsLog: flushRecords(100),
      });
      return scope;
    });
  }, [error, errorInfo, user]);

  return (
    <div className={styles.boundary}>
      <div className={styles.content}>
        <Image src={WindowImg} />
        <h1>{t("boundaryError.head")}</h1>
        <div className={styles.details}>
          {errorContent ? (
            errorContent
          ) : (
            <>
              <p>{t("boundaryError.body")}</p>
              <p>{t("boundaryError.body2")}</p>
            </>
          )}
        </div>
        <div className={styles.actions}>
          {props.onClick ? (
            <Button
              className={"button-small"}
              onClick={props.onClick}
              primary
              as={"span"}
            >
              {t("boundaryError.button.inbox")}
            </Button>
          ) : (
            <Link to={redirectLink}>
              <Button className={"button-small"} primary as={"span"}>
                {t("boundaryError.button.inbox")}
              </Button>
            </Link>
          )}
        </div>
        {error && DISPLAY_ERROR_LOG_COMPANY_ID.includes(companyId) && (
          <div className={styles.errorInfo}>
            <details style={{ whiteSpace: "pre-wrap" }}>
              {error && error.toString()}
              <br />
              {errorInfo?.componentStack}
            </details>
          </div>
        )}
      </div>
    </div>
  );
};
export default ErrorContent;
