import React, { useEffect, useState } from "react";
import ChannelWhatsAppQrCodeGen, {
  WhatsappQrCodeResponseType,
} from "./ChannelWhatsAppQrCodeGen";
import ChannelInfoType from "../../../types/ChannelInfoType";
import {
  buildParamString,
  getWithExceptions,
  post,
  postWithExceptions,
} from "../../../api/apiRequest";
import {
  GET_WHATSAPP_QR_CODE,
  GET_WHATSAPP_QR_CODE_BY_INSTANCE,
  POST_COMPANY_WHATSAPP_CHATAPI_REGISTER_INSTANCE,
  POST_STRIPE_CHECKOUT,
} from "../../../api/apiPath";
import { Button } from "semantic-ui-react";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { PlanDisplayType } from "../../../types/PlanSelectionType";
import CompanyType from "../../../types/CompanyType";
import moment from "moment";
import { useMachine } from "@xstate/react/lib";
import {
  QrAuthEvent,
  QrAuthGeneratorContext,
  QrAuthGeneratorStateSchema,
  qrCodeGeneratorMachine,
  QrCodeLoadedData,
  QrCodeLoadEvent,
} from "./qrCodeGeneratorMachine";
import { AnyEventObject, State } from "xstate";
import { WhatsappFormInputType } from "../ChannelSelection";
import ChannelWhatsappConfirm from "./ChannelWhatsappConfirm";
import { Trans, useTranslation } from "react-i18next";
import { useChannelValidators } from "../Forms/localizable/useChannelValidators";
import { useAppSelector } from "../../../AppRootContext";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

interface ChannelWhatsAppProps {
  stepByStepGuideLink: string;
  connectChannel: Function;
  channelInfo: ChannelInfoType;
  setErrorMsg: Function;
  errMsgList: object;
  formInput: WhatsappFormInputType;
  onChange: (id: string, value: string) => void;
  isPaid: boolean;
  switchToWhatsApp: () => void;
  closeForm: (e: React.MouseEvent) => void;
  updatedWhatsappScanStatus: () => void;
}

export default ChannelWhatsApp;

export function getActiveSubscriptionPlan(
  company: CompanyType,
  selectionPlanList: PlanDisplayType[]
): PlanDisplayType | undefined {
  const foundLatestBill = company.billRecords
    .filter((billRecord) => {
      return (
        billRecord.subscriptionPlan &&
        billRecord.subscriptionPlan.id.toLowerCase().includes("whatsapp")
      );
    })
    .find(
      (billRecord) =>
        moment().utc().diff(moment(billRecord.periodStart)) > 0 &&
        moment(billRecord.periodEnd).diff(moment().utc()) > 0
    );

  if (foundLatestBill) {
    return selectionPlanList.find(
      (selectionPlan) =>
        selectionPlan.planId === foundLatestBill.subscriptionPlan.id
    );
  }
}

export const RESTART_QR_FETCHED = 5000 as const;

export async function retrieveQRCode(
  instanceId?: string
): Promise<WhatsappQrCodeResponseType | undefined> {
  try {
    let path = GET_WHATSAPP_QR_CODE;
    let params: object = {};
    if (instanceId) {
      params = { instance: instanceId };
      path = GET_WHATSAPP_QR_CODE_BY_INSTANCE;
    }

    return await getWithExceptions(path, { param: params });
  } catch (e) {
    console.error("retrieveQRCode:error", e);
    return undefined;
  }
}

function ChannelWhatsApp(props: ChannelWhatsAppProps) {
  const { channelInfo } = props;
  const [submitPending, setSubmitPending] = useState(false);
  const stripeCheckout = useAppSelector((s) => s.stripeCheckout);
  const { t } = useTranslation();
  const { whatsappChatApiValidator } = useChannelValidators();
  const flash = useFlashMessageChannel();
  const handlePayment = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!stripeCheckout || stripeCheckout.plans.length === 0) {
      return;
    }

    const subscriptionPlan = stripeCheckout.plans.find((plan) =>
      plan.subscriptionName.toLowerCase().includes("whatsapp")
    );
    if (!subscriptionPlan) {
      console.error(`No plan for Whatsapp`, stripeCheckout);
      return;
    }
    setSubmitPending(true);
    const checkoutResult = await post(POST_STRIPE_CHECKOUT, {
      param: {
        planId: subscriptionPlan.id,
      },
    });

    if (stripeCheckout) {
      const stripe = window.Stripe(stripeCheckout.publicKey);
      if (stripe) {
        try {
          const response = await stripe.redirectToCheckout({
            sessionId: checkoutResult.id,
          });
          if (response?.error?.message) {
            throw new Error(response.error.message);
          }
        } catch (e) {
          flash(t("flash.stripe.error.unknown", { error: `${htmlEscape(e)}` }));
          //todo refresh? next attempt?
        } finally {
          setSubmitPending(false);
        }
      }
    }
  };

  const loadQrCodeService = async (): Promise<QrCodeLoadedData> => {
    const instanceParam: string | undefined = machine.context.instanceId;
    const response: WhatsappQrCodeResponseType | undefined =
      await retrieveQRCode(instanceParam);

    if (
      !response ||
      !(
        (response.qrcode && response.instanceId) ||
        response.result === "authenticated"
      )
    ) {
      throw `Invalid response: ${JSON.stringify(response)}`;
    }

    return {
      qrCode: response?.qrcode,
      instanceId: response.instanceId,
      result: response.result,
    };
  };

  const registerWhatsappInstanceService = async (
    c: QrAuthGeneratorContext,
    e: AnyEventObject
  ): Promise<any> => {
    if (!c.instanceId) {
      console.error("#qra registerWhatsappInstance: Missing instanceId", c, e);
      throw `Missing instanceId`;
    }
    return await postWithExceptions(
      `${POST_COMPANY_WHATSAPP_CHATAPI_REGISTER_INSTANCE}?${buildParamString({
        instance: c.instanceId,
      })}`,
      { param: {} }
    );
  };

  const [machine, sendMachine] = useMachine<
    QrAuthGeneratorContext,
    QrAuthEvent
  >(qrCodeGeneratorMachine, {
    delays: {
      "DELAY.FETCH_QR_TIMEOUT": 60000,
      "DELAY.RESTART_QR_FETCHED": RESTART_QR_FETCHED,
    },

    guards: {
      isFormValid: (c) => whatsappChatApiValidator.isValidSync(c.input),
      isAuthOkResponse: (c, e) => {
        return (
          (e as QrCodeLoadEvent).data.result?.toLowerCase() === "authenticated"
        );
      },
    },

    services: {
      loadQrCode: loadQrCodeService,
      registerWhatsappInstance: registerWhatsappInstanceService,
    },
  });

  useEffect(() => {
    if (machine.nextEvents.includes("OPEN") && props.isPaid) {
      sendMachine({ type: "OPEN" });
    }
    if (Boolean(machine.matches("registered")) && props.isPaid) {
      props.updatedWhatsappScanStatus();
    }
  }, [machine.value, props.isPaid]);

  const onFormChange = async (id: string, value: string) => {
    props.onChange(id, value);
    if (machine.nextEvents.includes("FORM.CHANGE")) {
      sendMachine({
        type: "FORM.CHANGE",
        input: { ...props.formInput, [id]: value },
      });
    }
  };

  return props.isPaid ? (
    Boolean(machine.matches("registered")) ? (
      <PaidContentConfirm machine={machine} closeForm={props.closeForm} />
    ) : (
      <PaidContentQRStage
        channelInfo={channelInfo}
        onChange={onFormChange}
        formInput={props.formInput}
        errMsgList={props.errMsgList}
        machine={machine}
        sendMachine={sendMachine}
        setErrorMsg={props.setErrorMsg}
        switchToWhatsApp={props.switchToWhatsApp}
      />
    )
  ) : (
    <UnpaidContent
      channelInfo={channelInfo}
      loading={submitPending}
      handlePayment={handlePayment}
    />
  );
}

function PaidContentQRStage(props: {
  channelInfo: ChannelInfoType;
  errMsgList: {};
  formInput: {};
  onChange: (id: string, value: string) => void;
  machine: State<
    QrAuthGeneratorContext,
    QrAuthEvent,
    QrAuthGeneratorStateSchema
  >;
  sendMachine: (event: QrAuthEvent) => void;
  setErrorMsg: Function;
  switchToWhatsApp: () => void;
}) {
  const { machine, sendMachine, channelInfo } = props;
  const { t } = useTranslation();

  const submitEnabled =
    machine.nextEvents.includes("REGISTER") && machine.context.instanceId;
  return (
    <>
      <div className="column column-primary">
        <div className="description">
          <h4>{t("channels.form.whatsapp.header")}</h4>
          <ol className="steps">
            <li>
              <Trans i18nKey={"channels.form.whatsapp.steps.open"}>
                Open <span className="highlight">WhatsApp</span>
                or <span className="highlight">WhatsApp Business App</span> on
                your Phone
              </Trans>
            </li>
            <li>
              <Trans i18nKey={"channels.form.whatsapp.steps.settings"}>
                Tap <span className="highlight">Menu</span>
                or <span className="highlight">Settings</span>
                and select
                <span className="highlight">WhatsApp Web/ Desktop</span>
              </Trans>
            </li>
            <li>
              <Trans i18nKey={"channels.form.whatsapp.steps.logout"}>
                Log out from all devices and click Scan QR Code
              </Trans>
            </li>
            <li>
              <Trans i18nKey={"channels.form.whatsapp.steps.capture"}>
                Point your phone to this screen to capture code
              </Trans>
            </li>
          </ol>
          <div className="guide-actions">
            <a
              className="button-secondary ui button"
              href={`${channelInfo.stepByStepGuideLink}`}
              target="_blank"
            >
              {t("channels.form.whatsapp.action.guide")}
            </a>
          </div>
        </div>
      </div>

      <div className="column column-secondary">
        <ChannelWhatsAppQrCodeGen sendMachine={sendMachine} machine={machine} />
        <Button
          className={"button1 action-button "}
          disabled={!submitEnabled}
          onClick={() =>
            submitEnabled ? sendMachine({ type: "REGISTER" }) : undefined
          }
        >
          {t("channels.form.whatsapp.action.finish")}
        </Button>
      </div>
    </>
  );
}

export function PaidContentConfirm(props: {
  machine: State<
    QrAuthGeneratorContext,
    QrAuthEvent,
    QrAuthGeneratorStateSchema
  >;
  closeForm: (e: React.MouseEvent) => void;
}) {
  const { machine, closeForm } = props;

  return (
    <ChannelWhatsappConfirm
      isBeta={false}
      isDisplayCloseBtn={true}
      instanceId={machine.context.instanceId}
      closeForm={closeForm}
    />
  );
}

function UnpaidContent(props: {
  channelInfo: ChannelInfoType;
  loading: boolean;
  handlePayment: (e: React.MouseEvent) => Promise<void>;
}) {
  const { channelInfo, handlePayment, loading } = props;
  const { t } = useTranslation();

  return (
    <>
      <div className="column column-primary">
        <div className="description">
          <h3>
            <Trans i18nKey={"channels.form.whatsapp.unpaid.header"}>
              Chat API is a paid WhatsApp API provided by Third-Party and
              requires a subscription fee of&nbsp;29&nbsp;USD/Month. It is the
              best option if you want to experience the SleekFlow Platform
              capability and send campaign messages.
            </Trans>
          </h3>
          <ol>
            <li>
              <Trans i18nKey={"channels.form.whatsapp.unpaid.points.number"}>
                You will be using your existing number from WhatsApp Business.
              </Trans>
            </li>
            <li>
              <Trans i18nKey={"channels.form.whatsapp.unpaid.points.retain"}>
                This integration retains all your messages, contacts and files
                you have in your existing WhatsApp Account.
              </Trans>
            </li>
            <li>
              <Trans i18nKey={"channels.form.whatsapp.unpaid.points.marketing"}>
                You should not use this channel to broadcast marketing messages
                to numbers who have not contacted you before.
              </Trans>
            </li>
            <li>
              <Trans i18nKey={"channels.form.whatsapp.unpaid.points.start"}>
                It is a quick and simple process to start your WhatsApp Strategy
                with a scan of QR code.
              </Trans>
            </li>
          </ol>
          <div className="guide-actions">
            <a
              className="button-secondary ui button"
              href={`${channelInfo.stepByStepGuideLink}`}
              target="_blank"
            >
              {t("channels.form.whatsapp.action.guide")}
            </a>
          </div>
        </div>
      </div>
      <div className="column column-secondary">
        <Button
          className={"formButton"}
          onClick={handlePayment}
          loading={loading}
        >
          {t("channels.form.whatsapp.action.pay")}
        </Button>
        {/* <TermsFooter/> */}
      </div>
    </>
  );
}
