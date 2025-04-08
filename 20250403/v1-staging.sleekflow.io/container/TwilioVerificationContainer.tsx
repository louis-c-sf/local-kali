import React, { useEffect, useState } from "react";
import Helmet from "react-helmet";
import { Container } from "semantic-ui-react";
import { postWithExceptions } from "../api/apiRequest";
import { POST_TWILIO_VERIFICATION } from "../api/apiPath";
import { useHistory } from "react-router";
import { getWhatsAppSupportUrl } from "utility/getWhatsAppSupportUrl";

export async function twilioVerified(
  referenceId: string,
  email: string,
  isVerified: boolean
) {
  return postWithExceptions(POST_TWILIO_VERIFICATION, {
    param: {
      referenceId: referenceId,
      email: email,
      isVerified: isVerified,
    },
  });
}

function TwilioVerificationContainer() {
  const params = new URLSearchParams(document.location.search.substring(1));
  const [error, setError] = useState("");
  const history = useHistory();
  const referenceId = params.get("referenceId") ?? "";
  const email = params.get("email") ?? "";
  const isVerified = params.get("isverified") ?? "";
  useEffect(() => {
    twilioVerified(referenceId, email, Boolean(isVerified)).catch((e) => {
      setError("Server Error");
      console.error(`POST_TWILIO_VERIFICATION error ${e}`);
    });
  }, []);
  return (
    <div className="twilio-verification">
      <Container className="content">
        <Helmet title={`Received Facebook Verification!`} />
        <div className="header">
          We have received your
          <br />
          Facebook verification update
        </div>
        <span className="success">&#x2705;</span>
        <div className="content p2">
          <div>Still have questions about your application?</div>
          <a
            className="link3"
            target="_blank"
            rel="noopener noreferrer"
            href={getWhatsAppSupportUrl()}
          >
            Contact our support team {">"}
          </a>
        </div>
        <div className="ui button primary" onClick={() => history.push("/")}>
          Go to SleekFlow
        </div>
        {error && <div className="error">{error}</div>}
      </Container>
    </div>
  );
}

export default TwilioVerificationContainer;
