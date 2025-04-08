import React from "react";
import { Header, Container, Image } from "semantic-ui-react";
import SleekflowImage from "../component/SleekflowImage";
import Success from "../assets/images/success.svg";
import { withRouter } from "react-router-dom";
import Helmet from "react-helmet";

export default withRouter(({ location }) => {
  return (
    <div className="success">
      <Container className="content">
        <Helmet title={`You’ve successfully signed up for our early review!`} />
        <SleekflowImage />
        <Header as="h4">Success!</Header>
        <Image src={Success} />
        <div className="content p2">
          <div>
            Congratulations! You’ll be qualified for our exclusive early bird
            discounts. You will be first one to get product updates and notified
            when we launch!{" "}
          </div>
          <div>
            Go back to{" "}
            <a className="link2 p2" href="https://sleekflow.io">
              Sleekflow
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
});
