import React from "react";
import { DropdownProps, Dropdown, DropdownItemProps } from "semantic-ui-react";
import langData from "config/localizable/iso_639-1_normalized.json";

interface LanguageDropdownPropsType extends DropdownProps {}

const langDataChoices: DropdownItemProps[] = langData.map((d, i) => ({
  value: d.code,
  text: d.native,
  meta: `${d.code} ${d.native} ${d.eng}`, // search index
  key: i,
}));

//todo add zh_CHS / zh_CHT native names

export function LanguageDropdown(props: LanguageDropdownPropsType) {
  return <Dropdown {...props} options={langDataChoices} />;
}
