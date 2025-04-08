import produce from "immer";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Button, Image } from "semantic-ui-react";
import { POST_SAVE_SURVEY_INFO } from "../api/apiPath";
import { postWithExceptions } from "../api/apiRequest";
import WhiteTickImg from "../assets/images/white-tick.svg";
import useRouteConfig from "../config/useRouteConfig";

interface SurveyType {
  question: string;
  name: string;
  isDisplayTwoColumn: boolean;
  selectedAnswer: string;
  expandable: boolean;
  customFieldName: string;
  items: itemType;
}

interface itemType {
  [key: string]: {
    text: string;
    value: string;
  };
}

const formatCompanySize = (comSize: string) => {
  switch (comSize) {
    case "one":
      return "1";
    case "smallest":
      return "2-5";
    case "verySmall":
      return "6-10";
    case "small":
      return "11-50";
    case "medium":
      return "51-200";
    case "big":
      return "201-1000";
    case "veryBig":
      return "1001-10000";
    case "biggest":
      return "10000+";
    default:
      return "unknown";
  }
};

export default function Questionnaires() {
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const to = t("questionnaires.companySize.to");
  const [surveys, setSurveys] = useState<Array<SurveyType>>([
    {
      question: t("questionnaires.companySize.question"), //"How many people work at your company?",
      name: "companySize",
      isDisplayTwoColumn: true,
      selectedAnswer: "",
      expandable: true,
      customFieldName: "Company Size",
      items: {
        one: {
          text: "1",
          value: "1",
        },
        smallest: {
          text: `2 ${to} 5`,
          value: "2 - 5",
        },
        verySmall: {
          text: `6 ${to} 10`,
          value: "6 - 10",
        },
        small: {
          text: `11 ${to} 50`,
          value: "11 - 50",
        },
        medium: {
          text: `51 ${to} 200`,
          value: "51 - 200",
        },
        big: {
          text: `201 ${to} 1,000`,
          value: "201 - 1,000",
        },
        veryBig: {
          text: `1,001 ${to} 10,000`,
          value: "1,001 - 10,000",
        },
        biggest: {
          text: "10,000+",
          value: "10,000+",
        },
      },
    },
    {
      question: t("questionnaires.companyType.question"), //"Which field do you wish to use SleekFlow for?",
      name: "companyType",
      isDisplayTwoColumn: false,
      selectedAnswer: "",
      expandable: false,
      customFieldName: "Field",
      items: {
        sales: {
          text: t("questionnaires.companyType.sales"),
          value: "Sales",
        },
        marketing: {
          text: t("questionnaires.companyType.marketing"),
          value: "Marketing",
        },
        customerSupport: {
          text: t("questionnaires.companyType.customerSupport"),
          value: "Support",
        },
      },
    },
    {
      question: t("questionnaires.requiredWhatsapp.question"), //Are you planning to use WhatsApp on our Platform?
      name: "requiredWhatsapp",
      isDisplayTwoColumn: false,
      selectedAnswer: "",
      expandable: false,
      customFieldName: "WhatsApp Usage",
      items: {
        yes: {
          text: t("questionnaires.requiredWhatsapp.yes"),
          value: "Yes",
        },
        alreadyHave: {
          text: t("questionnaires.requiredWhatsapp.alreadyTwilioAccount"), // Yes; I already have an Twilio account
          value: "Yes; I already have an Twilio account",
        },
        no: {
          text: t("questionnaires.requiredWhatsapp.no"),
          value: "No",
        },
      },
    },
  ]);
  const onExpandableClick = (
    expandableStatus: boolean,
    selectedIndex: number
  ) => {
    setSurveys(
      surveys.map((question, index) => {
        let updatedExpandableStatus = !expandableStatus;
        if (question.selectedAnswer === "") {
          updatedExpandableStatus = true;
        }
        return {
          ...question,
          expandable: selectedIndex === index ? updatedExpandableStatus : false,
        };
      })
    );
  };
  const handleSelectedAnswer = (
    e: React.MouseEvent,
    index: number,
    itemKey: string
  ) => {
    e.stopPropagation();
    setSurveys(
      produce(surveys, (draft) => {
        draft[index].selectedAnswer = itemKey;
        draft[index].expandable = false;
        if (index + 1 < draft.length) {
          draft[index + 1].expandable = true;
        }
      })
    );
  };

  function normaliseResponse(survey: SurveyType) {
    return {
      CustomFieldName: survey.customFieldName,
      CustomValue: survey.items[survey.selectedAnswer].value,
    };
  }

  const handleSignup = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const survey = surveys.map(normaliseResponse);
    await postWithExceptions(POST_SAVE_SURVEY_INFO, {
      param: { survey },
    });
    // if (surveys[2].selectedAnswer === "no") {
    //   history.push(routeTo("/channels"));
    //   return;
    // } else if (surveys[2].selectedAnswer === "alreadyHave") {
    //   history.push({
    //     pathname: routeTo("/channels"),
    //     state: {
    //       channelName: "twilio_whatsapp"
    //     }
    //   })
    //   return;
    // } else {
    if (
      ["one", "smallest", "verySmall", "small"].includes(
        surveys[0].selectedAnswer
      )
    ) {
      history.push({
        pathname: routeTo("/onboarding-flow"),
        state: {
          size: 50,
        },
      });
      return;
    } else {
      history.push({
        pathname: routeTo("/onboarding-flow"),
        state: {
          size: 60,
        },
      });
      return;
    }
  };
  return (
    <div className="questionnaires container">
      <div className="header">{t("questionnaires.header")}</div>
      <div className="subHeader">{t("questionnaires.subHeader")}</div>
      <div className="container">
        {surveys.map((question, index: number) => (
          <div
            className={`expandableSelection ${
              question.expandable ? "selected" : ""
            }`}
            onClick={(e) => onExpandableClick(question.expandable, index)}
          >
            <div className="question-container">
              <span
                className={`image ${
                  question.selectedAnswer === "" ? "empty" : "chosen"
                }`}
              >
                <Image src={WhiteTickImg} />
              </span>
              <div className="question">{question.question}</div>
            </div>
            <div
              className={`answer ${
                question.isDisplayTwoColumn ? "two-column" : ""
              }`}
            >
              {Object.keys(question.items).map((item, itemIndex) => (
                <div
                  onClick={(e) => handleSelectedAnswer(e, index, item)}
                  className={`ui button item ${
                    question.selectedAnswer === item ? "selected" : ""
                  }`}
                >
                  {question.items[item].text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="action">
        <Button
          disabled={surveys.some((question) => question.selectedAnswer === "")}
          className="ui button primary"
          onClick={handleSignup}
        >
          {t("questionnaires.button.finishSignUp")}
        </Button>
      </div>
    </div>
  );
}
