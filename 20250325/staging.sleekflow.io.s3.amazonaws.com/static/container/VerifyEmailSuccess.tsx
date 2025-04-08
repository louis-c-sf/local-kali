import React, { useState, useEffect } from "react";
import { Button } from "semantic-ui-react";
import { withRouter, Redirect } from "react-router-dom";
import queryString from "query-string";
import { get } from "../api/apiRequest";
import { GET_COMPANY_STAFF_BY_ID } from "../api/apiPath";
import SuccessFormContainer from "./SuccessFormContainer";
import { StaffType } from "../types/StaffType";

export default withRouter(({ location }) => {
  const [isRedirect, setRedirect] = useState(false);
  const [email, setEmail] = useState("");
  const { userId, code } = queryString.parse(location.search);
  const fetchUserDetail = async () => {
    try {
      const result: StaffType[] = await get(
        GET_COMPANY_STAFF_BY_ID.replace("{staffId}", userId as string),
        { param: {} }
      );
      setEmail(result[0].userInfo.email);
    } catch (e) {
      console.debug("resultresultresult", e);
    }
    // setEmail(result.userInfo.email);
  };
  useEffect(() => {
    fetchUserDetail();
  }, []);
  return isRedirect ? (
    <Redirect to={"/"} />
  ) : (
    <SuccessFormContainer
      pageTitle={"Verify Email Success | SleekFlow"}
      isDisplayIcon={true}
      headerText={"Email Verified!"}
    >
      <div className="content">
        <div>
          We’ve successfully verified your email address {email || ""}. You can
          now continue to set up your SleekFlow Account.
        </div>
        <Button content="Go to SleekFlow" onClick={() => setRedirect(true)} />
      </div>
    </SuccessFormContainer>
  );
});
