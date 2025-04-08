import React, { ReactNode, useState, useEffect } from "react";
import styles from "./PasswordRules.module.css";
import { PasswordRequirementType } from "container/InvitationAccept/validatePassword";
import { useTranslation } from "react-i18next";

export type PasswordRulesProps = {
  primaryRules: PasswordRequirementType[];
  secondaryRules: PasswordRequirementType[];
  primaryErrors: PasswordRequirementType[];
  secondaryErrors: PasswordRequirementType[];
  secondaryLimit: number;
  visible: boolean;
};

export function PasswordRules(props: PasswordRulesProps): JSX.Element | null {
  const { t } = useTranslation();

  const [curtainNode, setCurtainNode] = useState<HTMLElement | null>(null);
  const [contentsNode, setContentsNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    //measure the max height, animation is in CSS
    if (!(contentsNode && curtainNode)) {
      return;
    }
    const contentHeight = contentsNode.offsetHeight;
    curtainNode.style.setProperty("--maxCurtainHeight", `${contentHeight}px`);
  }, [contentsNode, curtainNode]);

  const ruleTranslations: Record<PasswordRequirementType, ReactNode> = {
    chars_minimum: t("form.invitation.field.password.violation.chars_minimum", {
      chars: 8,
    }),
    lowercase: t("form.invitation.field.password.violation.lowercase"),
    numeric: t("form.invitation.field.password.violation.numeric"),
    uppercase: t("form.invitation.field.password.violation.uppercase"),
    special_chars: t("form.invitation.field.password.violation.special_chars"),
  };

  function renderRulesGroup(
    rules: PasswordRequirementType[],
    errors: PasswordRequirementType[]
  ) {
    return rules.map((rule) => {
      const isValid = !errors.includes(rule);
      return (
        <div
          key={rule}
          className={`${styles.item} 
              ${isValid ? styles.valid : styles.invalid}
              `}
        >
          <div className={styles.tick} />
          <div className={styles.label}>{ruleTranslations[rule]}</div>
        </div>
      );
    });
  }

  return (
    <div
      className={`
        ${styles.root}
        ${props.visible ? styles.visible : styles.hidden}
      `}
    >
      <div className={styles.curtain} ref={setCurtainNode}>
        <div className={styles.frame}>
          <div className={styles.body} ref={setContentsNode}>
            <div className={styles.groupLabel} key={"groupPrimary"}>
              {t("form.invitation.field.password.violation.group.primary")}
            </div>
            {renderRulesGroup(props.primaryRules, props.primaryErrors)}
            <div className={styles.groupLabel} key={"groupSecondary"}>
              {t("form.invitation.field.password.violation.group.secondary", {
                limit: 3,
              })}
            </div>
            {renderRulesGroup(props.secondaryRules, props.secondaryErrors)}
          </div>
        </div>
      </div>
    </div>
  );
}
