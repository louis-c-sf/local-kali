import {
  PasswordRequirementType,
  validatePassword,
  PasswordRequirements,
} from "container/InvitationAccept/validatePassword";
import { partition } from "ramda";
import { useState } from "react";
import { PasswordRulesProps } from "container/InvitationAccept/PasswordRules";

export function usePasswordRulesWidget(props: {
  primaryRules: PasswordRequirementType[];
  minSecondaryRules: number;
  input: string;
}) {
  const [visible, setVisible] = useState(false);
  const [primaryErrors, setPrimaryErrors] = useState<PasswordRequirementType[]>(
    []
  );
  const [secondaryErrors, setSecondaryErrors] = useState<
    PasswordRequirementType[]
  >([]);

  const secondaryRules: PasswordRequirementType[] = PasswordRequirements.filter(
    (r) => !props.primaryRules.includes(r)
  );

  function updateViolations(input: string): {
    errors: PasswordRequirementType[];
    isValid: boolean;
  } {
    const errors = validatePassword(input);
    const [primaryErrors, secondaryErrors] = partition<PasswordRequirementType>(
      (r) => props.primaryRules.includes(r),
      errors
    );

    const issFulfillPrimary =
      primaryErrors.length > 0
        ? props.primaryRules.every((r) => primaryErrors.includes(r))
        : true;
    const isFulfillSecondary =
      secondaryErrors.length <= secondaryRules.length - props.minSecondaryRules;
    setPrimaryErrors(primaryErrors);
    setSecondaryErrors(secondaryErrors);
    return {
      errors,
      isValid: issFulfillPrimary && isFulfillSecondary,
    };
  }

  const componentProps: PasswordRulesProps = {
    primaryErrors,
    secondaryErrors,
    primaryRules: props.primaryRules,
    secondaryRules: secondaryRules,
    secondaryLimit: props.minSecondaryRules,
    visible: visible,
  };

  return {
    updateViolations,
    primaryErrors,
    secondaryErrors,
    componentProps,
    show: () => setVisible(true),
    hide: () => setVisible(false),
  };
}
