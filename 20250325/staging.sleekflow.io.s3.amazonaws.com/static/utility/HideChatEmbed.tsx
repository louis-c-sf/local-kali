import React from "react";
import Helmet from "react-helmet";

const HideChatEmbed = () => {
  return (
    <Helmet>
      <style type={"text/css"}>
        {`#travischatwidget{display:none!important;}`}
      </style>
    </Helmet>
  );
};

export default HideChatEmbed;
