import { AbstractConditionField } from "./fields/AbstractConditionField";
import { Dropdown, GridColumn, Input } from "semantic-ui-react";
import { DateField } from "./fields/DateField";
import { TextField } from "./fields/TextField";
import { ChannelsValueDropdown } from "../../shared/ChannelsValueDropdown";
import { ChannelField } from "./fields/ChannelField";
import React from "react";
import { BooleanField } from "./fields/BooleanField";
import { DateConditionField } from "./input/DateConditionField";
import { EmailField } from "./fields/EmailField";
import { HashTagField } from "./fields/HashTagField";
import { useTranslation } from "react-i18next";
import { LanguageField } from "./fields/LanguageField";
import { getQueryMatcher } from "../../../container/Settings/filters/getQueryMatcher";
import { DropdownOptionType } from "../../Chat/ChannelFilterDropdown";
import { implementsHasChoices } from "../../../types/AssignmentRuleType";
import { ListField } from "./fields/ListField";
import { ListValueInput } from "./ConditionForm/ListValueInput";
import { HashTagsValueInput } from "./ConditionForm/HashTagsValueInput";
import { DynamicChoiceField } from "./fields/DynamicChoiceField";
import { LanguageDropdown } from "component/shared/input/LanguageDropdown";
import { UserLanguageField } from "component/AssignmentRules/AutomationRuleEdit/fields/UserLanguageField";

type ConditionValueInputProps = {
  field: AbstractConditionField;
  onChange: (value: any) => void;
  utcOffset: number;
};

export function ConditionValueInput(props: ConditionValueInputProps) {
  const { field, onChange, utcOffset } = props;
  const { t } = useTranslation();

  if (!field.isRequireInput()) {
    return (
      <GridColumn width={"8"} className={"value-column"}>
        <div className={"ui input"}>&nbsp;</div>
      </GridColumn>
    );
  }

  if (field instanceof TextField) {
    return (
      <GridColumn width={"8"} className={"value-column"}>
        <Input
          type={"text"}
          value={field.toInputValueType() ?? ""}
          onChange={(_, data) => onChange(data.value)}
        />
      </GridColumn>
    );
  } else if (field instanceof EmailField) {
    return (
      <GridColumn width={"8"} className={"value-column"}>
        <div className="ui input">
          <Dropdown
            fluid
            allowAdditions
            search
            onAddItem={(_, data) => {
              const fieldValue = field.toInputValueType() as string[];
              const nextValue = data.value as string;
              onChange([...fieldValue, nextValue]);
            }}
            onChange={(_, data) => onChange(data.value)}
            selection
            upward={false}
            value={field.toInputValueType()}
            options={field.getChoices()}
            multiple
            noResultsMessage={t("form.field.email.noResults")}
          />
        </div>
      </GridColumn>
    );
  } else if (field instanceof DateField) {
    return (
      <DateConditionField
        field={field}
        onChange={onChange}
        utcOffset={utcOffset}
      />
    );
  } else if (field instanceof ChannelField) {
    return (
      <GridColumn width={"8"} className={"value-column"}>
        <div className="ui input">
          <ChannelsValueDropdown
            value={field.toInputValueType()}
            multiple
            excludeAll
            fluid
            onChange={(data) => onChange(data)}
          />
        </div>
      </GridColumn>
    );
  } else if (field instanceof BooleanField) {
    if (field.getFormConditionOperator() === "Equals") {
      return (
        <GridColumn width={"3"}>
          <div className="ui input">
            <Dropdown
              fluid
              options={[
                {
                  value: "true",
                  text: t("profile.field.type.boolean.true"),
                  key: 0,
                },
                {
                  value: "false",
                  text: t("profile.field.type.boolean.false"),
                  key: 1,
                },
              ]}
              upward={false}
              value={
                field.toInputValueType() === true
                  ? "true"
                  : field.toInputValueType() === false
                  ? "false"
                  : undefined
              }
              onChange={(_, data) => onChange(data.value)}
            />
          </div>
        </GridColumn>
      );
    } else {
      return <div></div>;
    }
  } else if (field instanceof DynamicChoiceField) {
    return (
      <GridColumn width={"8"} className={"value-column"}>
        <div className="ui input">
          <Dropdown
            fluid
            allowAdditions
            search
            onAddItem={(_, data) => {
              const fieldValue = field.toInputValueType() as string[];
              const nextValue = data.value as string;
              onChange([...fieldValue, nextValue]);
            }}
            onChange={(_, data) => {
              onChange(data.value);
            }}
            selection
            upward={false}
            value={field.toInputValueType()}
            options={field.getChoices()}
            multiple
            noResultsMessage={t("form.field.tags.noResults")}
          />
        </div>
      </GridColumn>
    );
  } else if (field instanceof HashTagField) {
    return (
      <GridColumn width={"8"} className={"value-column"}>
        <div className="ui input">
          <HashTagsValueInput field={field} onChange={onChange} />
        </div>
      </GridColumn>
    );
  } else if (
    field instanceof LanguageField ||
    field instanceof UserLanguageField
  ) {
    return (
      <GridColumn width={"8"} className={"value-column"}>
        <div className="ui input">
          <LanguageDropdown
            fluid
            scrolling
            icon={"search"}
            className={"icon-left"}
            search={(options, value) => {
              const matcher = getQueryMatcher(
                (o: DropdownOptionType) => o.meta ?? o.value
              );
              return options.filter(matcher(value));
            }}
            noResultsMessage={t("form.field.dropdown.noResults")}
            selection={true}
            upward={false}
            value={field.toInputValueType()}
            multiple={field.isMultiple()}
            selectOnBlur={false}
            onChange={(_, data) => onChange(data.value)}
          />
        </div>
      </GridColumn>
    );
  } else if (field instanceof ListField) {
    return (
      <GridColumn width={"8"} className={"value-column"}>
        <div className="ui input">
          <ListValueInput field={field} onChange={onChange} />
        </div>
      </GridColumn>
    );
  } else if (implementsHasChoices(field)) {
    const isSearch = field.getChoices().length > 20;
    return (
      <GridColumn width={"8"} className={"value-column"}>
        <div className="ui input">
          <Dropdown
            fluid
            scrolling
            icon={isSearch ? "search" : undefined}
            className={isSearch ? "icon-left" : undefined}
            search={isSearch}
            noResultsMessage={t("form.field.dropdown.noResults")}
            selection={true}
            upward={false}
            value={field.toInputValueType()}
            options={field.getChoices()}
            multiple={field.isMultiple()}
            onChange={(_, data) => onChange(data.value)}
          />
        </div>
      </GridColumn>
    );
  }

  return <div className={"ui input"}>{t("system.status.unknown")}</div>;
}
