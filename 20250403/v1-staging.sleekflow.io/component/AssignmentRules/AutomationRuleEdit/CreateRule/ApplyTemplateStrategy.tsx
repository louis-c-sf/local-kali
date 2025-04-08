import React, { useState } from "react";
import styles from "./ApplyTemplateStrategy.module.css";
import viewStyles from "./StepView.module.css";
import { StepView } from "./StepView";
import { Trans, useTranslation } from "react-i18next";
import { Dropdown, DropdownItemProps } from "semantic-ui-react";
import { CreateRuleActionType } from "./createRuleReducer";
import { useAutomationRulesLocalized } from "../localizable/useAutomationRulesLocalized";
import { RuleTemplateType } from "../templates";
import { AutomationTypeEnum } from "../../../../types/AssignmentRuleType";
import { adjust, allPass, assoc, map, pipe, reduce, uniq } from "ramda";
import { getQueryMatcher } from "../../../../container/Settings/filters/getQueryMatcher";
import { TypeLabel } from "./TypeLabel";
import { SearchInput } from "../../../shared/input/SearchInput";
import { StepGrid } from "./StepGrid";
import { FlowIcon } from "./FlowIcon";

type FilterValueType = { label: string; types: AutomationTypeEnum[] };

export function ApplyTemplateStrategy(props: {
  dispatch: (action: CreateRuleActionType) => void;
  onTemplateChosen: (t: RuleTemplateType) => void;
  templates: RuleTemplateType[];
}) {
  const { dispatch, onTemplateChosen, templates } = props;
  const { t } = useTranslation();
  const { automationTypeNameMap } = useAutomationRulesLocalized();

  const [filter, setFilter] = useState<{
    trigger: AutomationTypeEnum[];
    search: string;
  }>({
    trigger: [],
    search: "",
  });

  const templateTypeChoices: DropdownItemProps[] = pipe(
    map((t: RuleTemplateType) => t.prototype.automationType),
    uniq,
    reduce<AutomationTypeEnum, FilterValueType[]>((acc, next) => {
      const automationTypeName = automationTypeNameMap[next];
      const groupIndex = acc.findIndex((a) => a.label === automationTypeName);
      if (groupIndex === -1) {
        return [...acc, { label: automationTypeName, types: [next] }];
      }
      return adjust(
        groupIndex,
        (g) => ({ ...g, types: [...g.types, next] }),
        acc
      );
    }, []),
    map<FilterValueType, DropdownItemProps>((t) => ({
      content: <TypeLabel automationType={t.types[0]} name={t.label} />,
      text: <TypeLabel automationType={t.types[0]} name={t.label} />,
      key: t.label,
      value: t.types.join(),
      // active: innerJoin(equals, t.types, filter.trigger ?? []).length > 0,
    }))
  )(templates);

  const matchingSearch = getQueryMatcher((i: RuleTemplateType) => {
    return [i.name, i.tooltip, i.prototype.automationType].join();
  });

  function setTriggerFilter(trigger: AutomationTypeEnum[]) {
    setFilter(assoc("trigger", trigger));
  }

  function setSearchFilter(search: string) {
    setFilter(assoc("search", search));
  }

  const results = templates.filter(
    allPass([
      (t: RuleTemplateType) =>
        filter.trigger.length === 0
          ? true
          : filter.trigger.includes(t.prototype.automationType),
      (t: RuleTemplateType) =>
        filter.search ? matchingSearch(filter.search)(t) : true,
    ])
  );

  return (
    <StepView
      header={t("automation.create.applyTemplate.header")}
      subheader={
        <Trans i18nKey={"automation.create.applyTemplate.subheader"}>
          Our curated templates help you set up with your automated flow
          quickly. Not sure which template to choose? Learn more about our
          templates{" "}
          <a
            className={viewStyles.external}
            href={
              "docs.sleekflow.io/using-the-platform/automation/templates"
            }
            rel={"noreferrer noopener"}
            target={"_blank"}
          >
            here
          </a>
          .
        </Trans>
      }
      backAction={() => dispatch({ type: "RESET" })}
      alternativeActionText={t("automation.create.strategy.customize.header")}
      alternativeAction={() =>
        dispatch({
          type: "CHANGE_STRATEGY",
          strategy: "customize",
        })
      }
      fixedContent={
        <div className={styles.filter}>
          <div className={styles.field}>
            <div className={styles.label}>
              {t("automation.create.triggerType.label")}
            </div>
            <div className={styles.input}>
              <Dropdown
                options={templateTypeChoices}
                className={"selection"}
                selectOnBlur={false}
                value={filter.trigger.join()}
                trigger={
                  <>
                    {filter.trigger.length > 0 ? (
                      <TypeLabel
                        automationType={filter.trigger[0]}
                        name={automationTypeNameMap[filter.trigger[0]]}
                        onClose={() => setTriggerFilter([])}
                      />
                    ) : (
                      <div className={"default text"}>
                        {t("automation.create.triggerType.placeholder")}
                      </div>
                    )}
                  </>
                }
                onChange={(_, data) => {
                  setTriggerFilter(
                    (data.value as string).split(",") as AutomationTypeEnum[]
                  );
                }}
              />
            </div>
          </div>
          <div className={styles.field}>
            <div className={styles.input}>
              <SearchInput
                hasQuery={filter.search !== ""}
                loading={false}
                noMargins
                query={filter.search}
                onChange={(e) => setSearchFilter(e.target.value)}
                reset={() => setSearchFilter("")}
                placeholder={t("automation.create.searchTemplate.placeholder")}
              />
            </div>
          </div>
        </div>
      }
      scrollableContent={
        <StepGrid.Grid
          size={"small"}
          tagged
          columns={3}
          key={results.map((r) => r.name).join()}
        >
          {results.map((template) => (
            <StepGrid.Item
              onClick={() => onTemplateChosen(template)}
              key={template.name}
            >
              {template.pictograms && (
                <StepGrid.Pictogram>
                  <div className={styles.pictograms}>
                    <div className={styles.from}>
                      {template.pictograms.from.map((i) => (
                        <FlowIcon name={i} key={i} />
                      ))}
                    </div>
                    <div className={styles.link} />
                    <div className={styles.to}>
                      {template.pictograms.to.map((i) => (
                        <FlowIcon name={i} key={i} />
                      ))}
                    </div>
                  </div>
                </StepGrid.Pictogram>
              )}
              <StepGrid.Header>{template.name}</StepGrid.Header>
              <StepGrid.Body>{template.tooltip}</StepGrid.Body>
              <StepGrid.Footer>
                <TypeLabel
                  automationType={template.prototype.automationType}
                  name={
                    automationTypeNameMap[template.prototype.automationType]
                  }
                />
              </StepGrid.Footer>
            </StepGrid.Item>
          ))}
        </StepGrid.Grid>
      }
    />
  );
}
