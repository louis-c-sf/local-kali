import React, { useEffect, useState } from "react";
import { Button, Dropdown, Form } from "semantic-ui-react";
import {
  isAjaxHttpError,
  isApiError,
  isAxiosHttpError,
  post,
  postWithExceptions,
} from "../../api/apiRequest";
import {
  POST_COMPANY_INVITE_V2,
  POST_INVITATION_LINK_GENERATE,
  POST_STRIPE_CHECKOUT,
} from "../../api/apiPath";
import { useFlashMessageChannel } from "../BannerMessage/flashBannerMessage";
import { AxiosError } from "axios";
import { array, object, string } from "yup";
import { FormikHelpers, FormikState, useFormik } from "formik";
import { useAccessRulesGuard } from "./hooks/useAccessRulesGuard";
import { useFeaturesGuard } from "./hooks/useFeaturesGuard";
import { equals, isEmpty, pick, unary } from "ramda";
import { ModalForm } from "../shared/ModalForm";
import {
  SharedInvitationLinkResponseType,
  SharedInvitationLinkType,
} from "../../container/InvitationAccept";
import moment from "moment";
import { isFreePlan } from "../../types/PlanSelectionType";
import { CopyField } from "../Channel/CopyField";
import { copyToClipboard } from "../../utility/copyToClipboard";
import { EmailsInput } from "./AddUserModal/EmailsInput";
import { ExpirationInput } from "./AddUserModal/ExpirationInput";
import { fetchStaffList } from "../../api/User/fetchStaffList";
import { fetchCompany } from "../../api/Company/fetchCompany";
import { useStaffRoles } from "./localizable/useStaffRoles";
import { Trans, useTranslation } from "react-i18next";
import { InfoTooltip } from "../shared/popup/InfoTooltip";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { AjaxError } from "rxjs/internal/observable/dom/AjaxObservable";
import { htmlEscape } from "../../lib/utility/htmlEscape";
import useFetchCompany from "api/Company/useFetchCompany";
import inviteUserByEmailRequest from "api/Company/inviteUserByEmailRequest";

interface InviteAddUserModalProps {
  onHidden(...args: any[]): void;

  showModal: boolean;
}

export interface InviteFormType {
  emails: string[];
  role: string;
  teams: number[];
  expireDays: number;
  mode: "email" | "link";
}

export default AddUserModal;

function AddUserModal(props: InviteAddUserModalProps) {
  const { onHidden, showModal } = props;
  const {
    stripeCheckout,
    company,
    currentPlan,
    settings,
    userWorkspaceLocation,
  } = useAppSelector(
    pick([
      "stripeCheckout",
      "company",
      "currentPlan",
      "settings",
      "userWorkspaceLocation",
    ]),
    equals
  );
  const loginDispatch = useAppDispatch();
  const [httpError, setHttpError] = useState<AjaxError>();
  const [loading, setLoading] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>();
  const [errMsg, setErrMsg] = useState("");
  const location = useAppSelector((s) => s.userWorkspaceLocation);
  const loginStaffId = useAppSelector((s) => s.loggedInUserDetail, equals);
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();
  const { staffRole, proPlanStaffRole } = useStaffRoles();
  const { refreshCompany } = useFetchCompany();
  const accessRulesGuard = useAccessRulesGuard();
  const featuresGuard = useFeaturesGuard();
  const inviteQuota =
    featuresGuard.getMaxInviteUsers() - featuresGuard.getInvitedUsersCount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isNewSignup = process.env.REACT_APP_ENABLE_NEW_SIGNUP === "true";
  const form = useFormik<InviteFormType>({
    validateOnBlur: false,
    validateOnChange: false,
    initialValues: {
      emails: [],
      role: "admin",
      expireDays: 30,
      teams: [],
      mode: "link",
    },
    onSubmit: async () => {
      onConfirm();
    },
    validationSchema: object({
      emails: array(string()).when("mode", {
        is: "email",
        then: array(string())
          .required(t("settings.user.modal.add.field.email.error.required"))
          .max(
            inviteQuota,
            t("settings.user.modal.add.field.email.error.outOfQuota", {
              count: featuresGuard.getMaxInviteUsers(),
            })
          ),
      }),
      role: string().required(
        t("settings.user.modal.add.field.role.error.required")
      ),
    }),
  });

  const enabledRoleChoices = featuresGuard.canUseTeams()
    ? staffRole
    : proPlanStaffRole;
  const usersPayload = form.values.emails.map((email) => ({
    email,
    userRole: accessRulesGuard.canAssignAnyRole() ? form.values.role : "Staff",
  }));

  useEffect(() => {
    if (isSubmitting) {
      inviteUserByEmailRequest({
        data: {
          invite_users: usersPayload,
          team_ids: form.values.teams,
          location: userWorkspaceLocation || "eastasia",
        },
      })
        .then((res) => {
          const error = res.filter((s) => s.http_status_code === 500);
          setIsSubmitting(false);
          if (error.length > 0) {
            form.setErrors({
              emails: error[0].message,
            });
          } else {
            form.resetForm();
            flash(t("flash.settings.user.invited"));
            fetchStaffList(loginDispatch);
            refreshCompany();
            onClose();
          }
        })
        .catch((e) => {
          console.debug("errorerror", e);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  }, [isSubmitting]);
  async function onConfirm() {
    setLoading(true);
    const timeZoneInfoId = company?.timeZoneInfo.id || "GMT Time Zone";
    if (!(company && company.billRecords.length > 0)) {
      return;
    }
    if (
      stripeCheckout &&
      featuresGuard.getMaxInviteUsers() ===
        featuresGuard.getInvitedUsersCount() &&
      !isFreePlan(currentPlan)
    ) {
      const currentBillRecord = company?.billRecords[0];
      const result = await post(POST_STRIPE_CHECKOUT, {
        param: {
          planId: currentBillRecord.subscriptionPlan.extraChatAgentPlan,
          data: unescape(
            JSON.stringify({
              email: form.values.emails.join(","),
              timeZoneInfoId,
            })
          ),
        },
      });

      const stripe = window.Stripe(stripeCheckout.publicKey);
      if (stripe) {
        stripe.redirectToCheckout({ sessionId: result.id });
      }

      onClose();
    } else {
      try {
        if (isNewSignup) {
          setIsSubmitting(true);
        } else {
          const result = await post(POST_COMPANY_INVITE_V2, {
            param: {
              inviteUsers: usersPayload,
              teamIds: form.values.teams,
            },
          });
          if (result) {
            form.resetForm();
          }
          flash(t("flash.settings.user.invited"));
          fetchStaffList(loginDispatch);
          const res = await fetchCompany();
          loginDispatch({ type: "ADD_COMPANY", company: { ...res } });
          onClose();
        }
      } catch (e) {
        if (isAjaxHttpError(e)) {
          setHttpError(e);
        } else if (isApiError(e)) {
          const message = e.message || "Unknown error";
          form.setErrors({
            emails: message,
          });
          flash(htmlEscape(message));
        } else {
          const errorJSON = JSON.parse(e.message);
          console.error(errorJSON);
          if (Array.isArray(errorJSON)) {
            for (let error of errorJSON) {
              if (error.code) {
                if (error.code.toLowerCase() === "duplicateemail") {
                  setErrMsg(t("settings.user.modal.add.error.unique"));
                }
              }
            }
          }
        }
      } finally {
        setLoading(false);
      }
    }
  }

  const onClose = () => {
    onHidden();
    setHttpError(undefined);
    setErrMsg("");
    form.resetForm();
  };

  let title = "";
  let subTitle = "";

  if (form.values.mode === "email") {
    title = t("settings.user.modal.add.title.email");
  } else {
    title = t("settings.user.modal.add.title.link");
    subTitle = t("settings.user.modal.add.subtitle.email");
  }

  const switchToEmailMode = async () => {
    form.setFieldValue("mode", "email");
    form.setErrors({});
    setLoading(false);
  };

  const switchToLinkMode = async () => {
    form.setFieldValue("mode", "link");
    form.setErrors({});
  };

  async function isCopyFormValid(
    form: FormikState<InviteFormType> & FormikHelpers<InviteFormType>
  ) {
    const errors = await form.validateForm();
    return Object.values(errors).every(isEmpty);
  }

  useEffect(() => {
    if (!showModal) {
      return;
    }
    if (form.values.mode === "link" && isCopyFormValid(form)) {
      fetchInviteLink();
    } else {
      setInvitationLink("");
    }
  }, [showModal, form.values.mode, form.values.expireDays]);

  async function fetchInviteLink() {
    setLoading(true);
    try {
      const url = new URL(window.location.href.toString());
      const urlLocation = location || "eastasia";
      if (isNewSignup) {
        const linkGenerated: SharedInvitationLinkResponseType =
          await postWithExceptions(
            "/v1/tenant-hub/authorized/Companies/GenerateInviteLink",
            {
              param: {
                data: {
                  Role: form.values.role,
                  TeamIds: form.values.teams,
                  ExpirationDate: moment
                    .utc()
                    .add(form.values.expireDays, "days")
                    .toISOString(false),
                },
                location: urlLocation,
                sleekflow_user_id: loginStaffId?.userInfo.id || "",
                // Quota: 10, todo remove?
              },
            }
          );
        setInvitationLink(
          `${url.origin}/company/Invitation/Accept/?sharedLinkId=${linkGenerated.data.invitation_id}&location=${urlLocation}`
        );
      } else {
        const linkGenerated: SharedInvitationLinkType =
          await postWithExceptions(POST_INVITATION_LINK_GENERATE, {
            param: {
              Role: form.values.role,
              TeamIds: form.values.teams,
              ExpirationDate: moment
                .utc()
                .add(form.values.expireDays, "days")
                .toISOString(false),
              // Quota: 10, todo remove?
            },
          });
        setInvitationLink(
          `${url.origin}/company/Invitation/Accept/?sharedLinkId=${linkGenerated.invitationId}`
        );
      }
    } catch (e) {
      if (isAjaxHttpError(e)) {
        setHttpError(e);
      } else if (isApiError(e)) {
        const ERROR_MESSAGES = {
          SHARED_INVITE_EXCEEDED_COMPANY_QUOTA: t(
            "settings.user.modal.add.error.inviteCompanyQuota"
          ),
          SHARED_INVITE_DISABLED: t(
            "settings.user.modal.add.error.inviteDisabled"
          ),
          SHARED_INVITE_EXCEEDED_INVITATION_QUOTA: t(
            "settings.user.modal.add.error.inviteInvitationQuota"
          ),
          SHARED_INVITE_EXPIRED: t(
            "settings.user.modal.add.error.inviteExpired"
          ),
        };
        const message =
          ERROR_MESSAGES[e.errorId ?? ""] ??
          (e.message || t("system.error.unknown"));
        flash(message as string);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalForm
      opened={showModal}
      onCancel={onClose}
      onConfirm={form.submitForm}
      title={title}
      confirmText={t("form.button.send")}
      subTitle={subTitle}
      cancelText={t("form.button.cancel")}
      isLoading={false}
      actions={() => (
        <ModalActions
          loading={loading || isSubmitting}
          invitationLink={invitationLink}
          inviteMode={form.values.mode}
          switchToEmailMode={switchToEmailMode}
          switchToLinkMode={switchToLinkMode}
          onClose={onClose}
          onEmailSend={form.submitForm}
        />
      )}
    >
      <Form>
        {form.values.mode === "email" && <EmailsInput form={form} />}
        <Form.Input
          label={t("settings.user.modal.add.field.role.label")}
          error={form.errors.role}
        >
          <InfoTooltip
            placement={"left"}
            children={<Trans i18nKey={"settings.tooltip.field.role"} />}
            trigger={
              <Dropdown
                scrolling
                upward={false}
                options={enabledRoleChoices}
                selection
                fluid
                value={form.values.role}
                onChange={(_, data) =>
                  form.setFieldValue("role", data.value as string[])
                }
              />
            }
          />
        </Form.Input>
        {featuresGuard.canUseTeams() && accessRulesGuard.canEditAnyTeam() && (
          <Form.Input
            label={t("settings.user.modal.add.field.team.label")}
            error={form.errors.teams}
          >
            <InfoTooltip
              placement={"left"}
              children={t("settings.tooltip.invite.team")}
              trigger={
                <Dropdown
                  multiple
                  search
                  fluid
                  upward={false}
                  scrolling
                  selection
                  placeholder={t(
                    "settings.user.modal.add.field.team.placeholder"
                  )}
                  value={form.values.teams}
                  noResultsMessage={t("form.field.dropdown.noResults")}
                  onChange={(_, { value }) => {
                    form.setFieldValue(
                      "teams",
                      (value as string[]).map(unary(parseInt))
                    );
                  }}
                  options={settings.teamsSettings.teams.map((team) => {
                    return {
                      value: team.id,
                      content: team.name,
                      text: team.name,
                    };
                  })}
                />
              }
            />
          </Form.Input>
        )}
        {form.values.mode === "link" && (
          <Form.Input
            label={t("settings.user.modal.add.field.expiration.label")}
          >
            <ExpirationInput
              value={form.values.expireDays}
              onChange={(value) => {
                form.setFieldValue("expireDays", value);
              }}
            />
          </Form.Input>
        )}
        {form.values.mode === "link" && (
          <Form.Input>
            <div className="field">
              <CopyField
                text={invitationLink ?? ""}
                label={t("settings.user.modal.add.field.link.label")}
                long={true}
                onCopy={() => {
                  flash(t("flash.settings.user.invite.copied"));
                }}
              />
            </div>
          </Form.Input>
        )}

        {errMsg && <FieldError text={errMsg} />}
        {httpError && <Error error={httpError} />}
      </Form>
    </ModalForm>
  );
}

function ModalActions(props: {
  inviteMode: InviteFormType["mode"];
  loading: boolean;
  switchToLinkMode: () => void;
  switchToEmailMode: () => void;
  invitationLink: string | undefined | null;
  onClose: () => void;
  onEmailSend: () => void;
}) {
  const { invitationLink, inviteMode, loading } = props;
  const { switchToEmailMode, switchToLinkMode, onClose, onEmailSend } = props;

  const flash = useFlashMessageChannel();
  const { t } = useTranslation();

  if (inviteMode === "link") {
    return (
      <>
        <div className="extras">
          <InfoTooltip
            placement={"left"}
            children={t("settings.tooltip.invite.sendEmail")}
            trigger={
              <span className={"action"} onClick={switchToEmailMode}>
                {t("settings.user.modal.add.button.sendEmail")}
              </span>
            }
          />
        </div>
        <Button
          primary
          onClick={
            loading
              ? undefined
              : () => {
                  if (!invitationLink) {
                    return;
                  }
                  copyToClipboard(invitationLink);
                  flash(t("flash.settings.user.invite.copied"));
                }
          }
          loading={loading}
          disabled={!invitationLink}
          content={t("form.button.copy")}
        />
        <Button
          onClick={loading ? undefined : onClose}
          disabled={false}
          content={t("form.button.cancel")}
        />
      </>
    );
  } else {
    return (
      <>
        <div className="extras">
          <span className={"action"} onClick={switchToLinkMode}>
            {t("settings.user.modal.add.button.inviteLink")}
          </span>
        </div>
        <Button
          primary
          loading={loading}
          content={t("form.button.send")}
          onClick={
            loading
              ? undefined
              : () => {
                  onEmailSend();
                }
          }
        />
        <Button
          onClick={loading ? undefined : onClose}
          disabled={false}
          content={t("form.button.cancel")}
        />
      </>
    );
  }
}

function Error(props: { error: AxiosError | AjaxError }) {
  let { response } = props.error;
  let showMessage: string | undefined;
  if (isAxiosHttpError(props.error)) {
    if (response?.data?.message && !response?.data.code) {
      showMessage = response.data.message;
    }
  } else if (isAjaxHttpError(props.error)) {
    if (response?.response?.message && !response?.code) {
      showMessage = response.response.message;
    }
  }
  const { t } = useTranslation();

  switch (response?.status) {
    case 400:
      showMessage = showMessage ?? t("settings.user.modal.add.error.400");
      break;
    case 500:
      showMessage = showMessage ?? t("settings.user.modal.add.error.500");
      break;
  }

  return <div className="error">{showMessage}</div>;
}

function FieldError(props: { text: string }) {
  return (
    <div className={`field-error ${props.text.length > 0 ? "visible" : ""}`}>
      {props.text}
    </div>
  );
}
