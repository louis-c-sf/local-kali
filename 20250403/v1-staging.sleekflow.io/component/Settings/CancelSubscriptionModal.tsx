import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  DropdownItemProps,
  DropdownProps,
  Form,
  Modal,
} from "semantic-ui-react";
import moment from "moment";
import { get, postWithExceptions } from "../../api/apiRequest";
import {
  GET_CANCEL_SUBSCRIPTION,
  POST_CANCEL_SUBSCRIPTION,
} from "../../api/apiPath";
import Textarea from "react-textarea-autosize";
import { useFlashMessageChannel } from "../BannerMessage/flashBannerMessage";
import { Trans, useTranslation } from "react-i18next";
import { usePlansLocalized } from "../../config/localizable/usePlansLocalized";
import { isPremiumPlan, isProPlan } from "../../types/PlanSelectionType";
import { ExcludedAddOn } from "./SettingPlanSubscription/SettingPlan/SettingPlan";
import { useAppSelector } from "../../AppRootContext";
import { pick } from "ramda";

interface ConfirmSendProps {
  show: boolean;

  onConfirm(...args: any[]): void;

  onCancel(...args: any[]): void;
}

const CancelSubscriptionModal = (prop: ConfirmSendProps) => {
  const [loading, setLoading] = useState(true);
  const { show, onCancel, onConfirm } = prop;
  const { selectedTimeZone, currentPlan, company } = useAppSelector(
    pick(["selectedTimeZone", "company", "currentPlan"])
  );
  const [cancelReasons, setCancelReasons] = useState<DropdownItemProps[]>([]);
  const [otherReason, setOtherReason] = useState("");
  const [planTitle, setPlanTitle] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const { monthlyPlanList, yearlyPlanList } = usePlansLocalized();
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();
  const latestBillRecord = company?.billRecords.find(ExcludedAddOn);
  const fetchCancellationReasons = async () => {
    try {
      const result: string[] = await get(GET_CANCEL_SUBSCRIPTION, {
        param: {},
      });
      if (result.length > 0) {
        const items = result.map((res) => {
          return {
            key: "",
            value: res,
            text: res,
          };
        });
        setCancelReasons(items);
      }
    } catch (e) {
      console.error(`fetchCancellationReasons error: ${e}`);
    }
  };
  useEffect(() => {
    fetchCancellationReasons();
  }, []);
  useEffect(() => {
    let planTitle = "";
    if (currentPlan?.id) {
      if (isProPlan(currentPlan)) {
        planTitle =
          yearlyPlanList.find(isProPlan)?.planTitle ??
          monthlyPlanList.find(isProPlan)?.planTitle ??
          currentPlan.id;
      } else {
        planTitle =
          yearlyPlanList.find(isPremiumPlan)?.planTitle ??
          monthlyPlanList.find(isPremiumPlan)?.planTitle ??
          currentPlan.id;
      }

      setPlanTitle(planTitle);
    }
  }, [currentPlan?.id]);
  const changeSelectedReason = (
    e: React.SyntheticEvent,
    data: DropdownProps
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const { value } = data;
    setSelectedReason(value as string);
  };
  const handleConfirmationReason = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedReason) {
      try {
        setLoading(true);
        if (selectedReason.toLowerCase() === "other") {
          if (otherReason) {
            const result = await postReasons();
            if (result) {
              onConfirm();
              flash(t("flash.subscription.cancelled"));
            }
          }
        } else {
          const result = await postReasons();
          if (result) {
            onConfirm();
            flash(t("flash.subscription.cancelled"));
          }
        }
        setSelectedReason("");
        setOtherReason("");
      } catch (e) {
        console.error(`handleConfirmationReason error: ${e}`);
      } finally {
        setLoading(false);
      }
    }
  };
  const postReasons = async () => {
    const result = await postWithExceptions(POST_CANCEL_SUBSCRIPTION, {
      param: {
        Resaon: selectedReason,
        Value: otherReason,
      },
    });
    return result;
  };
  const otherReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setOtherReason(value);
  };

  return (
    <Modal
      open={show}
      closeOnDimmerClick={false}
      dimmer={"inverted"}
      className={"modal-confirm"}
      size={"small"}
      onClose={onCancel}
    >
      <Modal.Header>{t("settings.plan.modal.cancel.header")}</Modal.Header>
      <Modal.Content>
        <div className="cancel-suscription no-scrollbars">
          <Trans
            i18nKey={"account.subscription.warn.expiration"}
            values={{
              plan: planTitle,
              date: latestBillRecord?.periodEnd
                ? moment
                    .utc(latestBillRecord.periodEnd)
                    .utcOffset(selectedTimeZone)
                    .format("LLL")
                : "",
            }}
          >
            <p>
              Your <span className="bold">[name] Plan</span>will end on{" "}
              <span className="bold">[date]</span>, and you will no longer be
              charged for your subscription.
            </p>
          </Trans>
          <Form>
            <div className="bold title">
              {t("settings.plan.modal.cancel.field.reason.label")}*
            </div>
            <Dropdown
              selectOnBlur={false}
              placeholder={t(
                "settings.plan.modal.cancel.field.reason.placeholder"
              )}
              options={cancelReasons}
              text={selectedReason}
              value={selectedReason}
              onChange={changeSelectedReason}
              upward={false}
              scrolling
            />

            <div className="bold title">
              {t("settings.plan.modal.cancel.field.note.label")}
            </div>
            <Textarea
              rows={2}
              minRows={2}
              maxRows={2}
              placeholder={t(
                "settings.plan.modal.cancel.field.note.placeholder"
              )}
              value={otherReason}
              onChange={otherReasonChange}
            />
          </Form>
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button primary loading={loading} onClick={handleConfirmationReason}>
          {t("settings.plan.modal.cancel.button.confirm")}
        </Button>
        <Button onClick={onCancel}>
          {t("settings.plan.modal.cancel.button.cancel")}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};
export default CancelSubscriptionModal;
