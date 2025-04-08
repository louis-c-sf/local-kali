import React, { useEffect, useReducer } from "react";
import signupReducer, { defaultState } from "./signupReducer";
import SignupContext from "./SignupContext";
import SignupRegisterInfo from "./Steps/SignupRegisterInfo";
import SignupChannel from "./Steps/SignupChannel";
import SignupDemoVideo from "./Steps/SignupDemoVideo";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import { PreLogin } from "../../component/Header";
import { Avatar } from "../../component/shared/Avatar/Avatar";
import { Button } from "../../component/shared/Button/Button";
import { useAuth0 } from "@auth0/auth0-react";
import styles from "./Signup.module.css";
import { logoutReturnTo } from "component/Header/UserProfileDropdown";

const STEPS = [<SignupRegisterInfo />, <SignupChannel />, <SignupDemoVideo />];

export const RegisterCompanyLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { logout, user } = useAuth0();
  const { t } = useTranslation();
  const name =
    user?.name ||
    `${user?.given_name ? user.given_name : ""} ${
      user?.family_name ? user.family_name : ""
    }`;
  return (
    <>
      <PreLogin
        rightSideNav={
          <>
            <div className={styles.profileContainer}>
              <Avatar name={name} size={"24px"} />
              <div className={styles.avatarName}>{name}</div>
            </div>

            <Button
              primary
              onClick={() =>
                logout(
                  logoutReturnTo(
                    user?.["https://app.sleekflow.io/connection_strategy"]
                  )
                )
              }
            >
              {t("logout")}
            </Button>
          </>
        }
      />
      {children}
    </>
  );
};

function Signup() {
  const [signupState, signupDispatch] = useReducer(signupReducer, defaultState);
  const { t } = useTranslation();

  return (
    <div className="signup single-form">
      <Helmet title={t("nav.common.title", { page: t("nav.signup.title") })} />
      <RegisterCompanyLayout>
        <SignupContext.Provider
          value={{
            ...signupState,
            signupDispatch,
          }}
        >
          {STEPS[signupState.steps]}
        </SignupContext.Provider>
      </RegisterCompanyLayout>
    </div>
  );
}

export default Signup;
