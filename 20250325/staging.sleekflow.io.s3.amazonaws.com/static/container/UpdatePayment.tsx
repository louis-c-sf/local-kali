import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import useRouteConfig from "../config/useRouteConfig";
import RedirectionPage from "./RedirectionPage";

function UpdatePayment() {
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const location = useLocation();
  useEffect(() => {
    setTimeout(() => {
      history.push({
        pathname: routeTo("/settings/plansubscription"),
        state: {
          updatedPayment: location.pathname.includes("success"),
        },
      });
    }, 2000);
  }, []);

  return <RedirectionPage />;
}

export default UpdatePayment;
