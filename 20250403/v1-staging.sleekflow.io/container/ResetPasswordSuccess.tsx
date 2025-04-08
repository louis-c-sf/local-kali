import React, { useState } from "react";
import { Button } from "semantic-ui-react";
import { Redirect } from "react-router-dom";
import SuccessFormContainer from "./SuccessFormContainer";
import { useLocation } from "react-router";

const ResetPasswordReset = () => {
  const [isRedirect, setRedirect] = useState(false);
  const location = useLocation();
  const email = location.search.substring(
    location.search.indexOf("email=") + 6
  );
  return isRedirect ? (
    <Redirect to={"/"} />
  ) : (
    <SuccessFormContainer
      pageTitle={"Reset Password Success | SleekFlow"}
      isDisplayIcon={true}
      headerText={"Success"}
    >
      <div className="content">
        <div>
          We’ve reset your password associated with the account {email}. Please
          sign in again from the button below.
        </div>
        <Button content="Sign In" onClick={() => setRedirect(true)} />
      </div>
    </SuccessFormContainer>
  );
};

export default ResetPasswordReset;
