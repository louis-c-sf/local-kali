import React, { useEffect } from "react";
import { PreLogin } from "../../component/Header";
import MailImg from "./assets/mail-05.svg";
import { Image } from "semantic-ui-react";
import styles from "./Auth0ErrorScreen.module.css";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { Button } from "../../component/shared/Button/Button";
import { useAuth0 } from "@auth0/auth0-react";
import { logoutWithLocale } from "../../auth/Auth0ProviderWithRedirect";
import * as Sentry from "@sentry/browser";
import mixpanel from "mixpanel-browser";
import { logoutReturnTo } from "component/Header/UserProfileDropdown";

const getErrors = ({
  t,
  emailAddress,
}: {
  t: TFunction;
  emailAddress: string | undefined;
}) => ({
  "You need to first verify the email.": {
    title: t("auth0ErrorScreen.verifyEmailTitle"),
    description: t("auth0ErrorScreen.verifyEmailDescription", {
      emailAddress,
    }),
  },
  error_conflict_username: {
    title: t("auth0ErrorScreen.usernameExistsTitle"),
    description: t("auth0ErrorScreen.usernameExistsDescription", {
      emailAddress,
    }),
  },
  error_conflict_email_and_not_verified: {
    title: t("auth0ErrorScreen.verifyEmailTitle"),
    description: t("auth0ErrorScreen.verifyEmailDescription", {
      emailAddress,
    }),
  },
  error_email_and_not_verified: {
    title: t("auth0ErrorScreen.verifyEmailTitle"),
    description: t("auth0ErrorScreen.verifyEmailDescription", {
      emailAddress,
    }),
  },
  "Username already exists.": {
    title: t("auth0ErrorScreen.usernameExistsTitle"),
    description: t("auth0ErrorScreen.usernameExistsDescription", {
      emailAddress,
    }),
  },
  error_user_must_complete_invitation: {
    title: t("auth0ErrorScreen.invitedUserTitle"),
    description: t("auth0ErrorScreen.invitedUserDescription", {
      emailAddress,
    }),
  },
  "Invited user must complete the invitation before login. Please check your email and follow the instruction to complete the invitation.":
    {
      title: t("auth0ErrorScreen.invitedUserTitle"),
      description: t("auth0ErrorScreen.invitedUserDescription", {
        emailAddress,
      }),
    },
  error_new_shopify_user: {
    title: t("auth0ErrorScreen.verifyNewShopifyAccount"),
    description: t("auth0ErrorScreen.verifyNewShopifyAccountDescription", {
      emailAddress,
    }),
  },
});

const Auth0ErrorScreen = ({
  emailAddress,
  error,
}: {
  emailAddress: string | undefined;
  error?: Error;
}) => {
  const search = window.location.search;
  const searchParams = new URLSearchParams(search);
  const errorContent = searchParams.get("error_description");
  const { logout } = useAuth0();
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const mappedErrors = getErrors({ t, emailAddress });
  useEffect(() => {
    if (!error) {
      return;
    }
    console.error(`Auth0 Error ${error}`);
    Sentry.captureException(error);
  }, [error]);

  return (
    <>
      <PreLogin />
      <div className={styles.pageWrapper}>
        <div className={styles.iconWrapper}>
          <Image src={MailImg} />
        </div>
        <p className={styles.errorTitle}>
          {errorContent
            ? mappedErrors[errorContent]?.title
            : t("boundaryError.head")}
        </p>
        {errorContent && mappedErrors[errorContent]?.description ? (
          <p className={styles.errorDescription}>
            {mappedErrors[errorContent]?.description}
          </p>
        ) : (
          <>
            <p>{t("boundaryError.body")}</p>
            <p>{t("boundaryError.body2")}</p>
          </>
        )}
        <Button
          primary
          onClick={() => {
            logoutWithLocale(() => {
              mixpanel.reset();
              logout(
                logoutReturnTo(
                  errorContent?.includes("adfs")
                    ? "adfs"
                    : errorContent?.includes("oidc")
                    ? "oidc"
                    : ""
                )
              );
            }, language);
          }}
        >
          {t("back")}
        </Button>
      </div>
    </>
  );
};

export default Auth0ErrorScreen;
