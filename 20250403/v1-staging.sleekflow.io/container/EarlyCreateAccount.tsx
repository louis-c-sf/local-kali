import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  DropdownProps,
  Form,
  Header,
} from "semantic-ui-react";
import Helmet from "react-helmet";
import { post } from "../api/apiRequest";
import { POST_ACCOUNT_REGISTER } from "../api/apiPath";
import { Link, withRouter } from "react-router-dom";
import PhoneNumber from "../component/PhoneNumber";
import { UserType } from "../types/LoginType";
import Cookie from "js-cookie";
import queryString from "query-string";
import CreateAccountSidebar from "../component/CreateAccount/CreateAccountSidebar";
import PlanSelectionDiscount from "../component/PlanSelectionDiscount";
import { useAppDispatch } from "../AppRootContext";

interface AccountRegisterRequestType {
  email: string;
  password: string;
  confirmPassword: string;
  dipslayName: string;
  lastName: string;
  firstName: string;
  phoneNumber: string;
}
interface ErrorMsgListResponseType {
  [key: string]: string[] | string;
}
interface ErrorMsgType {
  [key: string]: string;
}
export default withRouter(({ history, match, location }) => {
  const { planId } = match.params;
  const [errMsgList, setErrMsgList] = useState<ErrorMsgType>({});
  const { email } = queryString.parse(location.search);
  const [errMsg, setErrMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [selectedCompanySize, setSelectedCompanySize] = useState("");
  const [isPhoneNumberError, setPhoneNumberError] = useState(false);
  const [companySizes, setCompanySizes] = useState([
    {
      value: "",
      text: "",
    },
    {
      value: "1-10",
      text: "1-10",
    },
    {
      value: "11-50",
      text: "11-50",
    },
    {
      value: "51-200",
      text: "51-200",
    },
    {
      value: "201-500",
      text: "201-500",
    },
    {
      value: "501-1000",
      text: "501-1000",
    },
    {
      value: "> 1000",
      text: "> 1000",
    },
  ]);
  const [registerInfo, setRegisterInfo] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    lastName: "",
    firstName: "",
    displayName: "",
    phoneNumber: "",
    companyName: "",
  });
  const [fullName, setFullName] = useState("");
  const [registerCompanyInfo, setRegisterCompanyInfo] = useState({
    timeZone: -(new Date().getTimezoneOffset() / 60),
    subscriptionPlanId: planId,
  });
  const [loading, isLoading] = useState(false);

  const [activeItem, setActiveItem] = useState("");
  const loginDispatch = useAppDispatch();
  useEffect(() => {
    setActiveItem("account");
    if (email) {
      setRegisterInfo({ ...registerInfo, email: email as string });
    }
    if (planId) {
      setRegisterCompanyInfo({
        ...registerCompanyInfo,
        subscriptionPlanId: planId,
      });
    }
  }, []);
  const updateRegisterInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, id } = e.target;
    setRegisterInfo({ ...registerInfo, [id]: value });
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.debug("handleSumbit", registerInfo);
    if (isPhoneNumberError) {
      setErrMsg("Please enter the country code");
    } else {
      isLoading(true);
      setIsError(false);
      try {
        const {
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
          displayName,
          phoneNumber,
        } = registerInfo;
        const result: UserType = await post(POST_ACCOUNT_REGISTER, {
          param: {
            firstName,
            lastName,
            email,
            password,
            displayName,
            phoneNumber,
          },
        });
        Cookie.set("accessToken", result.accessToken);
        localStorage.setItem("accessToken", result.accessToken);
        Cookie.set("user", result);
        loginDispatch({ user: result, type: "LOGIN" });
        isLoading(false);
        setActiveItem("plan");
      } catch (e) {
        setIsError(true);
        const resultStr = e.message;
        try {
          const result = JSON.parse(e.message);
          // isLoading(false);
          // if (Array.isArray(result)) {
          //   setMsg(result[0].code);
          // }else {
          if (Array.isArray(result)) {
            const errList = result.map((res) => res.description);
            setErrMsgList({ description: errList.join("\n") });
          } else {
            const errList = result as ErrorMsgListResponseType;
            const errFields = Object.keys(errList);
            for (let i = 0; i < errFields.length; i++) {
              if (errFields[i] === "code") continue;
              if (typeof errList[errFields[i]] === "string") {
                const value = errList[errFields[i]] as string;
                errMsgList[errFields[i].toLowerCase()] = value;
              } else {
                const value = errList[errFields[i]] as string[];
                errMsgList[errFields[i].toLowerCase()] = value.join(",");
              }
            }
            // setErrMsgList(msg => errMsgList);
            console.debug("result", result, errMsgList);
            setErrMsgList(errMsgList);
          }

          // }
          // if (setErrorMsg) {

          // }
        } catch (e) {
          // if (setErrorMsg) {
          setErrMsg(resultStr);
          // }
        }
        isLoading(false);
      }
    }
  };

  const updatePhoneNumber = (
    id: string,
    phoneNumberVal: string,
    countryCode: string
  ) => {
    if (phoneNumberVal) {
      if (countryCode) {
        setRegisterInfo({ ...registerInfo, [id]: phoneNumberVal });
        setPhoneNumberError(false);
      } else {
        setPhoneNumberError(true);
      }
    } else {
      setPhoneNumberError(false);
    }
    // if (activeItem === "account") {
    // } else {
    //   setRegisterCompanyInfo({...registerCompanyInfo, [id]: phoneNumberVal});
    // }
  };
  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const lastNameIndex = value.lastIndexOf(" ");
    if (lastNameIndex > -1) {
      setRegisterInfo({
        ...registerInfo,
        firstName: value.substring(0, lastNameIndex),
        lastName: value.substring(lastNameIndex + 1),
        displayName: value.substring(0, lastNameIndex),
      });
    } else {
      setRegisterInfo({
        ...registerInfo,
        firstName: value,
        displayName: value,
      });
    }
    setFullName(value);
  };
  const handleCompanySizeChange = (
    e: React.SyntheticEvent,
    data: DropdownProps
  ) => {
    const { value } = data;
    if (value) {
      setSelectedCompanySize(value as string);
    }
  };
  return (
    <div className="signup">
      <Helmet
        title={`${
          activeItem === "plan" ? "Select Plan" : "Sign up for Early Preview"
        } | SleekFlow`}
      />
      {/* <CreateAccountBreadcrumb activeItem={activeItem}/> */}
      <div className={`form-container`}>
        <div className={`${(activeItem === "plan" && "hide") || ""}`}>
          <CreateAccountSidebar />
          <div className="content">
            <div className="message">
              Already a beta tester?{" "}
              <Link to="/signin" className="p2 link2">
                Sign in
              </Link>
              .
            </div>
            <div className="main-content">
              <Header as="h4" content={"Sign up for early preview"} />
              <div className="message">
                Be the first one to experience our powerful tools and get 20%
                off after your 30-day free trial.
              </div>
              {errMsg && <div className="error">{errMsg}</div>}
              {errMsgList && errMsgList["description"] && (
                <div className="error">{errMsgList["description"]}</div>
              )}
              <Form className={`signup form`}>
                <Form.Field>
                  <label htmlFor="name">
                    First Name and last name*
                    {isError &&
                      errMsgList &&
                      (errMsgList["firstname"] ||
                        errMsgList["lastname"] ||
                        errMsgList["displayname"]) && (
                        <div className="error">
                          {errMsgList["firstname"] ||
                            errMsgList["lastname"] ||
                            errMsgList["displayname"]}
                        </div>
                      )}
                  </label>
                  <Form.Input
                    id="name"
                    onChange={handleName}
                    value={fullName}
                    placeholder="Your full name"
                  />
                </Form.Field>
                <Form.Field>
                  <label htmlFor="companyName">
                    Company name*
                    {isError && errMsgList && errMsgList["companyname"] && (
                      <div className="error">{errMsgList["companyname"]}</div>
                    )}
                  </label>
                  <Form.Input
                    id="companyName"
                    onChange={updateRegisterInput}
                    value={registerInfo["companyName"]}
                    placeholder="Your company name"
                  />
                </Form.Field>
                <Form.Field>
                  <label htmlFor="email">
                    Email*
                    {isError && errMsgList && errMsgList["email"] && (
                      <div className="error">{errMsgList["email"]}</div>
                    )}
                  </label>
                  <Form.Input
                    id="email"
                    onChange={updateRegisterInput}
                    value={registerInfo["email"]}
                    placeholder="name@company.com"
                  />
                </Form.Field>
                <Form.Field>
                  <label htmlFor="password">
                    Password*
                    {isError && errMsgList && errMsgList["password"] && (
                      <div className="error">{errMsgList["password"]}</div>
                    )}
                  </label>
                  <Form.Input
                    id="password"
                    onChange={updateRegisterInput}
                    value={registerInfo["password"]}
                    type="password"
                  />
                </Form.Field>
                <div className="field">
                  <label htmlFor="companySize">
                    Company size (optional)
                    {isError && errMsgList && errMsgList["companysize"] && (
                      <div className="error">{errMsgList["companysize"]}</div>
                    )}
                  </label>
                  <Dropdown
                    upward
                    options={companySizes}
                    text={selectedCompanySize}
                    placeholder={"Select"}
                    onChange={handleCompanySizeChange}
                  />
                </div>
                <div className="field">
                  {errMsgList && errMsgList["phonenumber"] && (
                    <div className="error">{errMsgList["phonenumber"]}</div>
                  )}
                  <label htmlFor="phoneNumber">Phone number (optional)</label>
                  <PhoneNumber
                    isError={isPhoneNumberError}
                    fieldName={"phoneNumber"}
                    onChange={updatePhoneNumber}
                  />
                </div>
                <Button loading={loading} type="submit" onClick={handleSubmit}>
                  Get SleekFlow Social CRM
                </Button>
                <div className="agreement">
                  By creating a SleekFlow account, you’re agreeing to accept the
                  SleekFlow{" "}
                  <a className="link2 p7" href="https://sleekflow.io/terms">
                    Terms of Service
                  </a>
                </div>
                <hr />
                <div className="privacy">
                  We’re committed to your privacy. SleekFlow uses the
                  information you provide to us to contact you about our
                  relevant content, products and services. You may unsubscribe
                  from these communications at any time. For more information,
                  check out our{" "}
                  <a href="https://sleekflow.io/privacy" className="p7 link2">
                    Privacy Policy
                  </a>
                  .
                </div>
              </Form>
            </div>
          </div>
        </div>
        <PlanSelectionDiscount
          phoneNumber={registerInfo.phoneNumber}
          companyName={registerInfo.companyName || ""}
          companySize={selectedCompanySize}
          activeItem={activeItem}
          planId={planId}
        />
      </div>
    </div>
  );
});
