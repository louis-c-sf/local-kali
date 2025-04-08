import React, { useState, useEffect, useContext } from "react";
import { Form, Button, Header, Container, Image } from "semantic-ui-react";
import Helmet from "react-helmet";
import Success from "../assets/images/success-verify.svg";
import Sleekflow_logo_2x from "../assets/images/Sleekflow_logo_svg.svg";
import "../style/css/success-form.css";
interface SingleFormContainerProps {
  children: any;
  isDisplayIcon: boolean;
  headerText: string;
  pageTitle: string;
}
const SuccessFormContainer = (props: SingleFormContainerProps) => {
  const { children, isDisplayIcon, headerText, pageTitle } = props;
  return (
    <div className="succuess-form">
      <Helmet title={`${pageTitle}`} />
      <Container className="form-container">
        <a href="https://sleekflow.io" target="_blank">
          <Image className="logo" src={Sleekflow_logo_2x} />
        </a>
        <div className="contaner-without-bg">
          <div className="header">{headerText}</div>
          {isDisplayIcon && <Image src={Success} />}
          {props.children}
        </div>
      </Container>
      <div className="footer">
        <a target="_blank" href="https://sleekflow.io">
          SleekFlow
        </a>
        <a target="_blank" href="https://sleekflow.io/terms">
          Terms
        </a>
        <a target="_blank" href="https://sleekflow.io/privacy">
          Privacy
        </a>
      </div>
    </div>
  );
};

export default SuccessFormContainer;
