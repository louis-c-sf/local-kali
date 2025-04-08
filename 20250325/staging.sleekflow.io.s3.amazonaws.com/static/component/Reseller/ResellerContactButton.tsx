import React from "react";
import { useAppSelector } from "../../AppRootContext";
import { equals } from "ramda";
import { htmlEscape } from "../../lib/utility/htmlEscape";

const ResellerContactButton: React.FC = ({ children }) => {
  const resellerEmail = useAppSelector(
    (s) => s.company?.reseller?.contactEmail,
    equals
  );
  return <a href={`mailto:${htmlEscape(resellerEmail ?? "")}`}>{children}</a>;
};

export default ResellerContactButton;
