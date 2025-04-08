import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCurrentPath } from "../hooks/useCurrentPath";
import styles from "./TopSearches.module.css";
import mappingData from "../assets/mappingData.json";
import mainStyles from "./pages/MainPage.module.css";

const ArticleRow = (props: {
  title: string;
  description: string;
  url: string;
}) => {
  const { title, description, url } = props;
  const handleClickArticle = () => {
    window.open(`${mappingData.domain}/${url}`, "docs.sleekflow.io");
  };
  return (
    <li onClick={handleClickArticle}>
      <div className={styles.rowTitle}>{title}</div>
      <div className={styles.rowDescription}>{description}</div>
    </li>
  );
};
const TopSearches = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const { currentPath } = useCurrentPath();

  useEffect(() => {
    if (currentPath !== "") {
      setArticles(mappingData.pages[currentPath].articles);
    }
  }, [currentPath]);

  type articleRow = {
    url: string;
    title: string;
    description: string;
  };

  return (
    <div
      className={`${styles.container} ${mainStyles.boxWrapper} ${mainStyles.boxShadow}`}
    >
      <div className={styles.header}>
        {t("nav.helpCenter.mainPage.topSearches.title")}
      </div>
      <ul>
        {articles.map((row: articleRow, index) => (
          <ArticleRow
            key={index}
            title={row.title}
            description={row.description}
            url={row.url}
          />
        ))}
      </ul>
    </div>
  );
};
export default TopSearches;
