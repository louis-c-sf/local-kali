import React, { useEffect, useState } from "react";
import { Button, Form } from "semantic-ui-react";
import { withRouter } from "react-router-dom";
import { getWithExceptions, postWithExceptions } from "../api/apiRequest";
import {
  GET_INVITATION_LINK_DETAILS,
  POST_AUTH0_COMPLETE_INVITATION,
  POST_AUTH0_INVITATION_LINK_INVITE,
} from "../api/apiPath";
import PhoneNumber from "../component/PhoneNumber";
import { object, string } from "yup";
import BannerMessage from "../component/BannerMessage/BannerMessage";
import { Trans, useTranslation } from "react-i18next";
import { useFlashMessageChannel } from "../component/BannerMessage/flashBannerMessage";
import { useAppSelector } from "../AppRootContext";
import GoogleSignInContainer from "./GoogleSignInContainer";
import { StaffType } from "../types/StaffType";
import SingleFormContainer from "./SingleFormContainer";
import moment from "moment";
import { useFormik } from "formik";
import { TFunction } from "i18next";
import { useAuth0 } from "@auth0/auth0-react";
import { PasswordInput } from "./SignIn";
import { getCountryCode } from "../api/countryCode";
import { UserType } from "../types/LoginType";
import axios from "axios";
import { logoutWithLocale } from "../auth/Auth0ProviderWithRedirect";
import styles from "./InvitationAccept.module.css";
import { PasswordRules } from "container/InvitationAccept/PasswordRules";
import { usePasswordRulesWidget } from "container/InvitationAccept/usePasswordRulesWidget";
import { useGetDefaultTimezone } from "./Signup/useGetDefaultTimezone";
import TimeZoneComponent from "component/TimeZoneComponent";
import useCompleteEmailInvitation from "api/User/useCompleteEmailInvitation";
import useSubmitInvitationLink from "api/User/useSubmitInvitationLink";
type OldSharedInvitationAcceptParams = {
  user_name: string;
  last_name: string;
  first_name: string;
  position: string;
  time_zone_info_id: string;
  phone_number: string;
  password: string;
};
type SharedInvitationAcceptParams = {
  username: string;
  lastName: string;
  firstName: string;
  displayName: string;
  position: string;
  timeZoneInfoId: string;
  phoneNumber: string;
  password: string;
};
export type SharedInvitationLinkResponseType = {
  data: SharedInvitationLinkInvitationDataType;
  success: boolean;
  date_time: string;
  http_status_code: number;
};
type SharedInvitationLinkInvitationDataType = {
  invitation_id: string;
  company_name: string;
  expiration_date: string;
  generated_by: null;
  location: string;
};
export type SharedInvitationLinkType = {
  invitationId: string;
  role: string;
  teamIds: number[];
  quota: number;
  status: "Enabled" | string;
  expirationDate: string;
  generatedBy: StaffType;
};
const getEmailInviteSchema = (t: TFunction) =>
  object().shape({
    username: string()
      .required(t("form.field.username.error.required"))
      .matches(
        /^[a-zA-Z0-9\-.]+$/,
        t("form.field.username.onlyAllowAlphanumeric")
      ),
    firstName: string()
      .ensure()
      .trim()
      .required(t("form.field.firstName.error.required")),
    lastName: string()
      .ensure()
      .trim()
      .required(t("form.field.lastName.error.required")),
    password: string()
      .ensure()
      .trim()
      .required(t("form.field.password.error.required")),
    position: string().trim().required(t("form.field.position.error.required")),
    phoneNumber: string()
      .ensure()
      .trim()
      .required(t("form.field.phone.error.required")),
  });
const getSharedLinkInviteSchema = (t: TFunction) =>
  object().shape({
    username: string()
      .required(t("form.field.username.error.required"))
      .matches(
        /^[a-zA-Z0-9\-.]+$/,
        t("form.field.username.onlyAllowAlphanumeric")
      ),
    email: string()
      .required(t("form.field.email.error.required"))
      .email(t("form.field.email.error.invalid")),
    firstName: string()
      .ensure()
      .trim()
      .required(t("form.field.firstName.error.required")),
    lastName: string()
      .ensure()
      .trim()
      .required(t("form.field.lastName.error.required")),
    password: string()
      .ensure()
      .trim()
      .required(t("form.field.password.error.required")),
    position: string().trim().required(t("form.field.position.error.required")),
    phoneNumber: string()
      .ensure()
      .trim()
      .required(t("form.field.phone.error.required")),
  });

export const getQueryParams = (params: string, url: string) => {
  let href = url;
  //this expression is to get the query strings
  let reg = new RegExp("[?&]" + params + "=([^&#]*)", "i");
  let queryString = reg.exec(href);
  return queryString ? queryString[1] : null;
};

const InvitationAccept = withRouter(({ history, match, location }) => {
  const [countryCode, setCountryCode] = useState("");
  const [sharedLinkDetails, setSharedLinkDetails] = useState<
    SharedInvitationLinkType | undefined
  >(undefined);
  const { logout } = useAuth0();
  const searchParams = new URLSearchParams(location.search);
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const flash = useFlashMessageChannel();
  const companyId = useAppSelector((s) => s.company?.id);
  const sharedLinkFormSchema = getSharedLinkInviteSchema(t);
  const emailFormSchema = getEmailInviteSchema(t);
  const sharedLinkIdParam = searchParams.get("sharedLinkId");
  const userId = searchParams.get("userId");
  const tenanthubUserId = searchParams.get("tenanthubUserId");
  const emailCode = searchParams.get("code");
  const inviteMode = sharedLinkIdParam ? "SHARED_LINK" : "EMAIL";
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [timezoneId, setTimezoneId] = useState<string>();
  const [timezoneLoading, setTimezoneLoading] = useState<boolean>(false);
  useGetDefaultTimezone({ setTimezoneId, setTimezoneLoading });
  const loc = searchParams.get("location");
  const isNewSignup = process.env.REACT_APP_ENABLE_NEW_SIGNUP === "true";
  const submitInvitationLink = useSubmitInvitationLink();
  const newUserForm = useFormik({
    initialValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      position: "",
      phoneNumber: "",
      marketingConsentCheckbox: false,
    },
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema:
      inviteMode === "SHARED_LINK" ? sharedLinkFormSchema : emailFormSchema,
    onSubmit: async (values) => {
      const {
        password,
        lastName,
        firstName,
        phoneNumber,
        position,
        email,
        username,
      } = values;
      let timeZoneInfoId = timezoneId ?? "GMT Standard Time";

      if (inviteMode === "SHARED_LINK") {
        // SHARED LINK
        try {
          if (isNewSignup) {
            const submitInvitationLinkResponse =
              await submitInvitationLink.submit({
                location: loc || "eastasia",
                shareableId: sharedLinkIdParam || "",
                invite_shared_user_object: {
                  email,
                  username,
                  lastName,
                  firstName,
                  displayName: `${firstName} ${lastName}`,
                  position,
                  timeZoneInfoId,
                  phoneNumber,
                  password,
                  confirmPassword: password,
                },
              });
            if (submitInvitationLinkResponse.success) {
              newUserForm.setStatus("success");
              // success action
              flash(t("flash.invitation.createUserSuccess"));
              setTimeout(() => {
                logoutWithLocale(logout, language);
              }, 2000);
            } else {
              handleErrorMessage(submitInvitationLinkResponse.message);
            }
          } else {
            if (sharedLinkDetails) {
              await postWithExceptions<
                UserType,
                {
                  param: OldSharedInvitationAcceptParams & {
                    email: string;
                    confirm_password: string;
                  };
                }
              >(
                POST_AUTH0_INVITATION_LINK_INVITE.replace(
                  "{linkId}",
                  sharedLinkDetails.invitationId
                ),
                {
                  param: {
                    email,
                    user_name: username,
                    last_name: lastName,
                    first_name: firstName,
                    position,
                    time_zone_info_id: timeZoneInfoId,
                    phone_number: phoneNumber,
                    password,
                    confirm_password: password,
                  },
                }
              );
              newUserForm.setStatus("success");
              // success action
              flash(t("flash.invitation.createUserSuccess"));
              setTimeout(() => {
                logoutWithLocale(logout, language);
              }, 2000);
            }
          }
        } catch (e) {
          const errorResponse = e.response?.data;
          if (axios.isAxiosError(e) && errorResponse) {
            // partial error message matches
            const errorMessage = errorResponse.message as
              | "Username"
              | "invalid"
              | "Not enough agent quota"
              | string
              | "password"
              | "Password";
            if (
              errorMessage.toLowerCase().includes("username") &&
              errorMessage.includes("invalid")
            ) {
              newUserForm.setErrors({
                username: t("form.field.username.error.invalidUsername"),
              });
              return;
            }
            if (
              errorMessage.toLowerCase().includes("username") &&
              errorMessage.includes("is already taken")
            ) {
              newUserForm.setErrors({
                username: t("form.field.username.error.duplicatedUsername"),
              });
              return;
            }

            if (
              errorMessage.includes("Username") &&
              errorMessage.includes("characters")
            ) {
              newUserForm.setErrors({
                username: t("form.field.username.error.invalidUsername"),
              });
              return;
            }

            if (
              errorMessage.includes("Email") &&
              errorMessage.includes("is already taken")
            ) {
              newUserForm.setErrors({
                email: t("form.field.email.error.registered"),
              });
              return;
            }

            if (errorMessage.includes("Not enough agent quota")) {
              return flash(t("flash.invitation.error.notEngouhAgentQuota"));
            }

            if (
              errorMessage.includes("Password") ||
              errorMessage.includes("password")
            ) {
              newUserForm.setErrors({
                password: t("account.resetPassword.passwordNotStrongEnough"),
              });
              return;
            }
          }
          return flash(t("flash.common.unknownErrorTryLater"));
        }
      } else {
        // EMAIL
        if (emailCode && userId) {
          try {
            if (isNewSignup) {
              setIsEmailSubmitted(true);
            } else {
              await postWithExceptions<
                UserType,
                {
                  param: OldSharedInvitationAcceptParams & {
                    user_Id: string;
                    token: string;
                    location: string;
                    display_name: string;
                  };
                  header: Record<string, string>;
                  config: {
                    skipAuth: boolean;
                  };
                }
              >(POST_AUTH0_COMPLETE_INVITATION, {
                header: { Authorization: "" },
                param: {
                  user_name: username,
                  user_Id: userId,
                  display_name: `${firstName} ${lastName}`,
                  first_name: firstName,
                  last_name: lastName,
                  phone_number: phoneNumber,
                  password,
                  token: emailCode,
                  position,
                  time_zone_info_id: timeZoneInfoId,
                  location: "eastasia",
                },
                config: {
                  skipAuth: true,
                },
              });
              newUserForm.setStatus("success");
              flash(t("flash.invitation.createUserSuccess"));
              setTimeout(() => {
                logout({
                  returnTo: window.location.origin,
                });
              }, 2000);
            }
            return;
          } catch (e) {
            const errorResponse = e.response?.data;
            if (axios.isAxiosError(e) && errorResponse) {
              // partial error message matches
              handleErrorMessage(errorResponse.message);
            }
            return flash(t("flash.common.unknownErrorTryLater"));
          }
        }
        return flash(t("flash.invitation.error.noUserIdOrEmailCode"));
      }
    },
  });
  function handleErrorMessage(message: string) {
    const errorMessage = message as
      | "InvalidUserName"
      | "DuplicateUserName"
      | "Not enough agent quota"
      | string
      | "password"
      | "Password";

    if (
      errorMessage.includes("Invitation disabled") ||
      errorMessage.includes("Expired")
    ) {
      return flash(t("form.invitation.error.invalidToken"));
    }
    if (errorMessage.includes("The specified new username already exists")) {
      newUserForm.setErrors({
        username: t("form.field.username.error.duplicatedUsername"),
      });
      return;
    }
    if (errorMessage.includes("registered a company")) {
      newUserForm.setErrors({
        email: t("form.field.email.error.registered"),
      });
      return;
    }
    if (
      errorMessage.includes("InvalidUserName") ||
      errorMessage.toLowerCase().includes("username")
    ) {
      newUserForm.setErrors({
        username: t("form.field.username.error.invalidUsername"),
      });
      return;
    }

    if (errorMessage.includes("Not enough agent quota")) {
      return flash(t("flash.invitation.error.notEngouhAgentQuota"));
    }

    if (errorMessage.toLowerCase().includes("password")) {
      newUserForm.setErrors({
        password: t("account.resetPassword.passwordNotStrongEnough"),
      });
      return;
    }
    return flash(t("flash.common.unknownErrorTryLater"));
  }
  const { username, firstName, lastName, phoneNumber, password, position } =
    newUserForm.values;
  const submitEmailInvitation = useCompleteEmailInvitation({
    data: {
      username,
      tenanthub_user_id: tenanthubUserId,
      sleekflow_user_id: userId,
      displayName: `${firstName} ${lastName}`,
      firstName,
      lastName,
      phoneNumber,
      password,
      token: emailCode,
      position,
      timeZoneInfoId: timezoneId ?? "GMT Standard Time",
      location: loc,
    },
    enabled: !!userId && !!emailCode && isEmailSubmitted,
  });
  useEffect(() => {
    if (submitEmailInvitation.data) {
      if (submitEmailInvitation.data?.http_status_code !== 200) {
        handleErrorMessage(submitEmailInvitation.data.message);
        setIsEmailSubmitted(false);
      } else {
        if (submitEmailInvitation.data.data?.message === "Invalid token.") {
          handleErrorMessage(submitEmailInvitation.data.data.message);
          setIsEmailSubmitted(false);
        } else {
          newUserForm.setStatus("success");
          flash(t("flash.invitation.createUserSuccess"));
          setTimeout(() => {
            logout({
              returnTo: window.location.origin,
            });
          }, 2000);
          setIsEmailSubmitted(false);
        }
      }
    }
  }, [submitEmailInvitation.data]);
  useEffect(() => {
    let isMounted = true;
    const getSharedLinkDetails = async () => {
      if (!sharedLinkIdParam) {
        return;
      }
      try {
        const result = await getWithExceptions(
          GET_INVITATION_LINK_DETAILS.replace("{linkId}", sharedLinkIdParam),
          { param: { skipAuth: true } }
        );

        if (result.status !== "Enabled") {
          flash(t("form.invitation.error.link.notEnabled"));
        }
        if (moment.utc().isAfter(moment.utc(result.expirationDate))) {
          flash(t("form.invitation.error.link.expired"));
        }
        if (isMounted) {
          setSharedLinkDetails(result);
        }
      } catch (e) {
        console.error("#fetchSharedLinkDetail", e);
        return flash(t("flash.common.unknownErrorTryLater"));
      }
    };
    if (!isNewSignup) {
      getSharedLinkDetails();
    }
    return () => {
      isMounted = false;
    };
  }, [t, sharedLinkIdParam]);

  const passwordRulesWidget = usePasswordRulesWidget({
    input: newUserForm.values.password,
    minSecondaryRules: 3,
    primaryRules: ["chars_minimum"],
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchCountryCode() {
      try {
        const result = await getCountryCode();
        if ("countryCode" in result && isMounted) {
          setCountryCode(result.countryCode);
        }
      } catch (e) {}
    }

    fetchCountryCode();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SingleFormContainer
      headerText={t("form.invitation.header")}
      subHeader={
        <div className="message">{t("form.invitation.subHeader")}</div>
      }
      className="invitation-form"
      isDisplaySignIn={false}
      isDisplaySignUp={false}
      isDisplayFooter={true}
      additonalText={
        <div className="agreement">
          <Trans i18nKey="form.invitation.additionText">
            By creating a SleekFlow account, you’re agreeing to accept the
            SleekFlow
            <a
              className="link2 p7"
              rel="noopener noreferrer"
              target="_blank"
              href="https://sleekflow.io/terms"
            >
              Terms of Service
            </a>
          </Trans>
        </div>
      }
      pageTitle={t("nav.common.title", { page: t("nav.invitation.title") })}
    >
      <BannerMessage />
      {sharedLinkDetails && companyId && (
        <GoogleSignInContainer
          invitationParams={{
            companyId: companyId,
            userRole: sharedLinkDetails.role,
            teamIds: sharedLinkDetails.teamIds,
          }}
          buttonText={t("form.invitation.button.googleSignup")}
          subHeaderText={t("or")}
        />
      )}
      <Form onSubmit={newUserForm.handleSubmit} className={"form"}>
        {inviteMode === "SHARED_LINK" && (
          <Form.Field>
            <Form.Input
              id="email"
              label={t("form.invitation.field.email.label")}
              error={newUserForm.errors.email}
              onChange={newUserForm.handleChange}
              value={newUserForm.values.email}
              placeholder={t("form.invitation.field.email.placeholder")}
            />
          </Form.Field>
        )}
        <Form.Field>
          <Form.Input
            id="username"
            onChange={newUserForm.handleChange}
            value={newUserForm.values.username}
            error={newUserForm.errors.username}
            label={t("form.invitation.field.username.label")}
            placeholder={t("form.invitation.field.username.placeholder")}
          />
          <div className={styles.hint}>
            {t("form.invitation.field.username.hint")}
          </div>
        </Form.Field>
        <Form.Field>
          <Form.Input
            id="firstName"
            label={t("form.invitation.field.firstName.label")}
            onChange={newUserForm.handleChange}
            value={newUserForm.values.firstName}
            error={newUserForm.errors.firstName}
            placeholder={t("form.invitation.field.firstName.placeholder")}
          />
        </Form.Field>
        <Form.Field>
          <Form.Input
            id="lastName"
            label={t("form.invitation.field.lastName.label")}
            onChange={newUserForm.handleChange}
            value={newUserForm.values.lastName}
            error={newUserForm.errors.lastName}
            placeholder={t("form.invitation.field.lastName.placeholder")}
          />
        </Form.Field>
        <Form.Field>
          <div className="label">
            <label htmlFor="password">
              {t("form.invitation.field.password.label")}
            </label>
          </div>
          <PasswordInput
            id="password"
            onChange={(ev) => {
              newUserForm.handleChange(ev);
              const { isValid } = passwordRulesWidget.updateViolations(
                ev.target.value
              );
              if (!isValid) {
                passwordRulesWidget.show();
              }
            }}
            password={newUserForm.values.password}
            placeholder={t("form.invitation.field.password.placeholder")}
          />
          <FieldError text={newUserForm.errors.password ?? ""} />
          <PasswordRules {...passwordRulesWidget.componentProps} />
        </Form.Field>
        <Form.Field>
          <Form.Input
            id="position"
            label={t("form.invitation.field.position.label")}
            onChange={newUserForm.handleChange}
            value={newUserForm.values.position}
            error={newUserForm.errors.position}
            placeholder={t("form.invitation.field.position.placeholder")}
          />
        </Form.Field>
        <div className="field">
          <label className="phoneNumber" htmlFor="phoneNumber">
            <Trans i18nKey={"form.invitation.field.phoneNumber.label"}>
              Mobile number*
              <div className="note">For customer support only</div>
            </Trans>
          </label>
          <PhoneNumber
            countryCode={countryCode}
            fieldName="phoneNumber"
            existValue={newUserForm.values.phoneNumber}
            onChange={(_, phone, code) => {
              newUserForm.setFieldValue("phoneNumber", phone);
            }}
            isError={!!newUserForm.errors.phoneNumber}
          />
          <FieldError text={newUserForm.errors.phoneNumber ?? ""} />
        </div>
        <Form.Field>
          <label>{t("account.form.field.yourTimeZone.label")}</label>
          <TimeZoneComponent
            placeholder={t("account.form.prompt.text", {
              field: t("account.form.field.yourTimeZone.placeholder"),
            })}
            onChange={(id: string) => setTimezoneId(id)}
            currentTimezone={timezoneId}
            defaultLoading={timezoneLoading}
          />
        </Form.Field>
        <Button
          loading={newUserForm.isSubmitting}
          type="submit"
          primary
          disabled={
            newUserForm.isSubmitting || newUserForm.status === "success"
          }
        >
          {t("form.invitation.button.join")}
        </Button>
      </Form>
    </SingleFormContainer>
  );
});

InvitationAccept.displayName = "InvitationAccept";

export default InvitationAccept;

function FieldError(props: { text: string }) {
  return (
    <div className={`field-error ${props.text.length > 0 ? "visible" : ""}`}>
      {props.text}
    </div>
  );
}
