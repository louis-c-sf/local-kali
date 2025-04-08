import React, { useEffect, useState } from "react";
import { post } from "../api/apiRequest";
import {
  POST_ALIPAY_ONEOFF_STRIPE_CHECKOUT,
  POST_OTHER_ONEOFF_STRIPE_CHECKOUT,
} from "../api/apiPath";
import { useLocation, useParams } from "react-router";
import { Button, Dimmer, Loader } from "semantic-ui-react";
import useStripeCheckout from "../api/User/useStripeCheckout";

export interface PaymentRequestParam {
  amount: string;
  currency: string;
  name: string;
  email: string | undefined;
}

const StripePaymentOneoffContainer = () => {
  const { currency, amount, paymentMethod } = useParams<{
    paymentMethod: string;
    currency: string;
    amount: string;
  }>();
  const location = useLocation();
  const urlParam = new URLSearchParams(location.search);
  const email = urlParam.get("email");
  const name = urlParam.get("name");
  const [loading, isLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const { stripeCheckout, refreshStripeCheckout } = useStripeCheckout();
  const clickToRefresh = () => {
    document.location.reload();
  };
  useEffect(() => {
    refreshStripeCheckout();
  }, []);

  const redirectToStripe = async () => {
    if (!amount || !currency || !email || !name) {
      setIsError(true);
      setErrMsg("Missing required information");
      isLoading(false);
      return;
    }
    let param: PaymentRequestParam = {
      amount: amount,
      currency: currency,
      name: name || "",
      email: email || "",
    };
    try {
      let pathname = POST_OTHER_ONEOFF_STRIPE_CHECKOUT;
      if (paymentMethod === "alipay") {
        pathname = POST_ALIPAY_ONEOFF_STRIPE_CHECKOUT;
      }
      const checkoutResult = await post(pathname, {
        param: {
          ...param,
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
              console.error("response?.error?", response);
              setErrMsg("Stripe Error response");
              setIsError(true);
              isLoading(false);
            }
          } catch (e) {
            // setBannerMessage(`Payment system error: ${e}`);
            //todo refresh? next attempt?
            redirectToStripe();
          }
        } else {
          setIsError(true);
          isLoading(false);
        }
      }
    } catch (e) {
      redirectToStripe();
    }
  };
  useEffect(() => {
    if (stripeCheckout) {
      redirectToStripe();
    } else {
      refreshStripeCheckout();
    }
  }, [stripeCheckout]);
  return (
    <Dimmer.Dimmable className="no-scrollbars payment-page" dimmed={loading}>
      <Dimmer active={loading} inverted>
        <Loader active />
      </Dimmer>
      <div className="form-container">
        {errMsg && <div className="field-error">{errMsg}</div>}
        {isError && <Button onClick={clickToRefresh}>Refresh the Page</Button>}
      </div>
    </Dimmer.Dimmable>
  );
};

export default StripePaymentOneoffContainer;
