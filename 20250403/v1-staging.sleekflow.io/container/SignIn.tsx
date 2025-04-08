import React, { useContext, useEffect, useState } from "react";
import { Button, Checkbox, Form } from "semantic-ui-react";
import { Link, withRouter } from "react-router-dom";
import { isAxiosHttpError, post } from "../api/apiRequest";
import { POST_TOKEN_INFO } from "../api/apiPath";
import { Action, UserType } from "../types/LoginType";
import SingleFormContainer from "./SingleFormContainer";
import { object, string } from "yup";
import uuid from "uuid";
import { useTranslation } from "react-i18next";
import useRouteConfig from "../config/useRouteConfig";
import useCompanyChannels from "../component/Chat/hooks/useCompanyChannels";
import { isFreemiumPlan } from "../types/PlanSelectionType";
import useFetchCompany from "../api/Company/useFetchCompany";
import { useAppDispatch, useAppSelector } from "../AppRootContext";
import {
  BROWSER_ID_STORAGE_KEY,
  registerSessionTakeover,
} from "../component/Chat/hooks/Labels/useLimitedInboxLogin";
import { SignalRContext } from "../component/SignalR/SignalRObservable";
import styles from "./SignIn.module.css";
import SeePassword from "../assets/tsx/icons/SeePassword";
import HidePassword from "../assets/tsx/icons/HidePassword";
import {
  cleanUpLogin,
  signUpLoginIn,
  useSessionLifecycle,
} from "../App/lifecycle/useSessionLifecycle";
import { useHistory } from "react-router";
import ChannelSignupButton from "../component/ChannelSignupButton/ChannelSignupButton";
import { equals } from "ramda";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { htmlEscape } from "../lib/utility/htmlEscape";

interface ErrorMsgType {
  [key: string]: string;
}

const SignIn: React.ComponentClass<any, any> = withRouter(({ history }) => {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [password, setPassword] = useState("");
  const [user, currentPlan] = useAppSelector(
    (s) => [s.user, s.currentPlan],
    equals
  );
  const loginDispatch = useAppDispatch();
  const [loading, isLoading] = useState(false);
  const [errMsgList, setErrMsgList] = useState<ErrorMsgType>({});
  const { t } = useTranslation();
  const channels = useCompanyChannels();
  const { routeTo } = useRouteConfig();
  const connectedChannelNames = channels.map((channel) => channel.type);
  const formValidator = object().shape({
    email: string().trim().required(t("form.signin.field.email.rule.required")),
    password: string()
      .trim()
      .required(t("form.signin.field.password.rule.required")),
  });
  const { company, refreshCompany } = useFetchCompany();
  const { connection } = useContext(SignalRContext);
  const { performLogout } = useSessionLifecycle();
  const flash = useFlashMessageChannel();
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      if (!company) {
        refreshCompany();
      }
    }
  }, [JSON.stringify(company)]);

  useEffect(() => {
    if (user?.id && connection?.connectionId) {
      if (user.signalRGroupName) {
        const browserIdGenerated = uuid();
        registerSessionTakeover(browserIdGenerated, true)
          .then(() => {
            connection.invoke("DeviceAddToGroup", browserIdGenerated);
            loginDispatch({ type: "INBOX.SESSION.STARTED" });
            window.localStorage.setItem(
              BROWSER_ID_STORAGE_KEY,
              browserIdGenerated
            );
            if (
              isFreemiumPlan(currentPlan) &&
              connectedChannelNames.length === 1
            ) {
              history.push(routeTo(`/channels`));
            } else {
              history.push(routeTo(`/inbox/${user.id}`));
            }
          })
          .catch((e) => {
            console.error(e);
            if (isAxiosHttpError(e) && e?.response?.status === 401) {
              performLogout();
              e?.response?.data?.message &&
                flash(htmlEscape(e?.response?.data?.message));
              isLoading(false);
            } else {
              history.push(routeTo(`/signup`));
            }
          });
      } else {
        history.push(routeTo(`/signup`));
      }
    }
  }, [user?.id, company?.id, currentPlan.id, connection?.connectionId]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    isLoading(true);
    try {
      await formValidator.validate({
        email,
        password,
      });
      setErrMsgList({});
    } catch (e) {
      setErrMsgList({ [e.path]: e.message });
      isLoading(false);
      return;
    }
    try {
      const result: UserType = await post(POST_TOKEN_INFO, {
        param: {
          Email: email,
          Password: password,
          RememberMe: true,
        },
        header: {},
      });

      if (result) {
        window.dataLayer.push({
          event: "login",
          login: result.email,
          company: result.signalRGroupName,
        });
        const value: Action = { user: result, type: "LOGIN" };
        signUpLoginIn(result);
        loginDispatch(value);
        if (value.user.signalRGroupName) {
          refreshCompany();
        } else {
          history.push({
            pathname: routeTo(`/signup`),
            state: {
              signUpInfo: {
                email: result.email,
                firstName: result.firstName,
                lastName: result.lastName,
              },
            },
          });
        }
      } else {
        setErrorMsg(t("form.signin.error.incorrectMailOrPwd"));
      }
    } catch (e) {
      setErrorMsg(t("form.signin.error.incorrectMailOrPwd"));
      cleanUpLogin();
      isLoading(false);
    }
  };

  useEffect(() => {
    if (company) {
      isLoading(false);
    }
  }, [refreshCompany, Boolean(company)]);

  const pageTitle = t("nav.menu.prelogin.signin");

  return (
    <SingleFormContainer
      isDisplaySignUp={true}
      subHeader={<AdditionalSignInOption className="desktop-google-in" />}
      headerText={t("form.signin.title")}
      pageTitle={t("nav.common.title", { page: pageTitle })}
      isDisplaySignIn={false}
      isDisplayFooter={true}
      additonalText={<AdditionalSignInOption className="mobile-google-in" />}
    >
      <Form id="signInForm" className="form">
        <Form.Field>
          <div className="label">
            <label>{t("form.signin.field.email.label")}</label>
          </div>
          <Form.Input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="name@company.com"
          />
          <FieldError text={errMsgList["email"] || ""} />
        </Form.Field>
        <Form.Field>
          <div className="label">
            <label>{t("form.signin.field.password.label")}</label>
          </div>
          <PasswordInput
            password={password}
            placeholder={t("form.signin.field.password.placeholder")}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FieldError text={errMsgList["password"] || errorMsg || ""} />
        </Form.Field>
        <div className="row">
          <Form.Field>
            <Checkbox label={t("form.signin.action.remember")} />
            <Link to={routeTo(`/forgot_password`)}>
              {t("form.signin.action.forgotPwd")}
            </Link>
          </Form.Field>
        </div>
        <Button primary loading={loading} type="submit" onClick={handleSubmit}>
          {t("form.signin.action.logIn")}
        </Button>
      </Form>
    </SingleFormContainer>
  );
});
export default SignIn;

export function FieldError(props: { text: string }) {
  return (
    <div className={`field-error ${props.text.length > 0 ? "visible" : ""}`}>
      {props.text}
    </div>
  );
}

export function PasswordInput(props: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  password: string;
  placeholder: string;
  id?: string;
  error?: boolean;
}) {
  const {
    placeholder,
    password,
    onChange,
    id = "password",
    error = false,
  } = props;
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Form.Input
      id={id}
      className={styles.password}
      type={showPassword ? "text" : "password"}
      placeholder={placeholder}
      autocomplete={"off"}
      onChange={onChange}
      value={password}
      error={error}
    >
      <input />
      <div
        className={`${styles.iconWrap} ${showPassword ? styles.active : ""}`}
        onClick={() => setShowPassword((s) => !s)}
      >
        {showPassword ? <HidePassword /> : <SeePassword />}
      </div>
    </Form.Input>
  );
}

function AdditionalSignInOption(props: { className: string }) {
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  return (
    <div className={props.className}>
      <ChannelSignupButton
        buttonText={t("form.signin.button.googleSignIn")}
        subHeaderText={""}
        type="google"
        className="google-sign-container"
      />
      <ChannelSignupButton
        buttonText={t("form.signin.button.shopifySignIn")}
        subHeaderText={t("form.signin.button.mailSignIn")}
        type="shopify"
        onClick={() =>
          window.open(
            "https://accounts.shopify.com/store-login",
            "_blank",
            "noopener noreferrer"
          )
        }
      />
    </div>
  );
}
