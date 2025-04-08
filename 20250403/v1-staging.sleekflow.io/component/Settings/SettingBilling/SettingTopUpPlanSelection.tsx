import React from "react";
import { TopUpCreditType } from "./SettingTwilioTopUp";

export default function SettingTopUpPlanSelection(props: {
  submitPayment: (planId: string) => void;
  topUpPlans?: TopUpCreditType[];
}) {
  if (!props.topUpPlans) {
    return null;
  }
  return (
    <div className="topup-container two-column">
      {props.topUpPlans.map((topup) => {
        return (
          <div
            className="ui button item"
            onClick={() => props.submitPayment(topup.id)}
          >
            {topup.currency} {topup.price}
          </div>
        );
      })}
    </div>
  );
}
