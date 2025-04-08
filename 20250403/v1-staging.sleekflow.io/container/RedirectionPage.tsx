import React from "react";
import { Container, Dimmer, Loader } from "semantic-ui-react";

function RedirectionPage() {
  return (
    <div className="payment-page">
      <Container className="content">
        <Dimmer active inverted>
          <Loader inverted>
            <div className="content">
              <div>
                “People will forget what you said. They
                <br />
                will forget what you did. But they will
                <br />
                never forget how you made them feel.”
              </div>
              <div className="sub-header">- Maya Angelou</div>
            </div>
          </Loader>
        </Dimmer>
      </Container>
    </div>
  );
}

export default RedirectionPage;
