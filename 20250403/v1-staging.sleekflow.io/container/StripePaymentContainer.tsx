import React, { useEffect, useState } from "react";
import { post } from "../api/apiRequest";
import { POST_OTHER_STRIPE_CHECKOUT } from "../api/apiPath";
import { Dimmer } from "semantic-ui-react";
import { useLocation, useParams } from "react-router";
import useStripeCheckout from "../api/User/useStripeCheckout";
import { useAppDispatch } from "../AppRootContext";

interface PaymentRequestParam {
  planId: string;
  email: string | undefined;
  trial?: string;
}

const StripePaymentContainer = () => {
  const loginDispatch = useAppDispatch();
  const { paymentId, trial } = useParams();
  const location = useLocation();
  const [loading, isLoading] = useState(true);
  const [isFail, setIsFail] = useState(false);
  const email = location.search.substring(
    location.search.indexOf("email=") + 6
  );
  const { stripeCheckout, refreshStripeCheckout } = useStripeCheckout();

  useEffect(() => {
    refreshStripeCheckout();
  }, []);
  const redirectToStripe = async () => {
    let param: PaymentRequestParam = {
      planId: paymentId || "",
      email: email || "",
    };
    if (trial) {
      param = {
        ...param,
        trial,
      };
    }
    try {
      const checkoutResult = await post(POST_OTHER_STRIPE_CHECKOUT, {
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
              setIsFail(true);
            } else {
              setIsFail(false);
            }
          } catch (e) {
            // setBannerMessage(`Payment system error: ${e}`);
            //todo refresh? next attempt?
            redirectToStripe();
          } finally {
            isLoading(false);
          }
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
      <div></div>
    </Dimmer.Dimmable>
  );
};

export default StripePaymentContainer;
