import React, { useCallback, useEffect, useState } from "react";
import { Dropdown, Image, Loader } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { GET_FB_PAGES, GET_IG_PAGES } from "../../../../../api/apiPath";
import { getWithExceptions } from "../../../../../api/apiRequest";
import { FbPostComment, PagesChoiceType } from "./PostCommentTypes";
import { AutomationTypeEnum } from "../../../../../types/AssignmentRuleType";
import FbIcon from "../../../../../assets/images/dummy-channel/facebook.svg";
import IgIcon from "../../../../../assets/images/channels/Instagram.svg";
import styles from "./PagesDropdown.module.css";

const Choice = (props: {
  pageName: string;
  index: number;
  automationType: AutomationTypeEnum;
}) => {
  const { pageName, index, automationType } = props;
  return (
    <Dropdown.Item key={index}>
      <div className="text">
        <Image src={automationType === FbPostComment ? FbIcon : IgIcon} />
        <span className={"text-label"}>{pageName}</span>
      </div>
    </Dropdown.Item>
  );
};

const PagesDropdown = (props: {
  automationType: AutomationTypeEnum;
  setSelectedPageId: (page: string) => void;
  selectedPageId: string;
}) => {
  const { t } = useTranslation();
  const { automationType, setSelectedPageId, selectedPageId } = props;
  const [pagesChoices, setPagesChoices] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const getPagesChoices = useCallback(async () => {
    setIsFetching(true);
    try {
      const { pageInfos } = await getWithExceptions(
        automationType === FbPostComment ? GET_FB_PAGES : GET_IG_PAGES,
        { param: {} }
      );
      if (pageInfos) {
        setPagesChoices(pageInfos);
        if (selectedPageId === "") {
          setSelectedPageId(pageInfos[0].pageId);
        }
      }
    } catch (e) {
      console.error("getPagesChoices e: ", e);
    } finally {
      setIsFetching(false);
    }
  }, [automationType, selectedPageId]);

  const dropdownChoices = pagesChoices.map(
    (choice: PagesChoiceType, index: number) => ({
      key: choice.pageId + index,
      value: choice.pageId,
      content: (
        <Choice
          pageName={choice.pageName}
          index={index}
          automationType={automationType}
        />
      ),
      text: (
        <Choice
          pageName={choice.pageName}
          index={index}
          automationType={automationType}
        />
      ),
    })
  );

  useEffect(() => {
    getPagesChoices();
  }, [getPagesChoices]);

  return (
    <div className={`field section-content-item ${styles.pages}`}>
      <label>
        {automationType === FbPostComment
          ? t(
              "automation.rule.field.conditions.postComment.pages.label.facebook"
            )
          : t(
              "automation.rule.field.conditions.postComment.pages.label.instagram"
            )}
      </label>
      {isFetching ? (
        <Loader active />
      ) : (
        <Dropdown
          fluid
          selection
          options={dropdownChoices}
          value={selectedPageId}
          onChange={(_, { value }) => setSelectedPageId(value as string)}
        />
      )}
    </div>
  );
};
export default PagesDropdown;
