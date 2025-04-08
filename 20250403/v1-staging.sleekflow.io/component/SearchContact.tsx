import React, { useEffect, ReactNode } from "react";
import { Image } from "semantic-ui-react";
import userIcon from "../assets/images/user.svg";
import { SearchCategoryItemType } from "../types/ProfileSearchType";
import { getSearchParts } from "../utility/string";
export default function SearchContact(props: SearchCategoryItemType) {
  const { image, title, description, id, searchValue } = props;
  const matchTitle = getSearchParts(searchValue ?? "", title);
  let titleContent: ReactNode = title;
  if (matchTitle) {
    titleContent = (
      <>
        {matchTitle[0]}
        <span className={"bold"}>{matchTitle[1]}</span>
        {matchTitle[2]}
      </>
    );
  }
  const matchDescription = getSearchParts(searchValue ?? "", description);
  let descriptionContent: ReactNode = description;
  if (matchDescription) {
    descriptionContent = (
      <>
        {matchDescription[0]}
        <span className={"bold"}>{matchDescription[1]}</span>
        {matchDescription[2]}
      </>
    );
  }

  return (
    <div key={id} className={`search-contact`}>
      <div className="pic">
        <Image src={image ? image : userIcon} size="tiny" />
      </div>
      <div className="content">
        <div className="name">{titleContent}</div>
        <div className="description">{descriptionContent}</div>
      </div>
    </div>
  );
}
