export function validatePassword(password: string): PasswordRequirementType[] {
  return validators.reduce<PasswordRequirementType[]>(
    (acc, [rule, test]) => (test(password) ? acc : [...acc, rule]),
    []
  );
}

const CHARS_MIN = 8;

const validators: Array<[PasswordRequirementType, (input: string) => boolean]> =
  [
    ["chars_minimum", (input) => input.trim().length >= CHARS_MIN],
    ["lowercase", (input) => /[a-z]+/.test(input)],
    ["uppercase", (input) => /[A-Z]+/.test(input)],
    ["numeric", (input) => /\d+/.test(input)],
    [
      "special_chars",
      (input) => /[?!@#$%^&*.,:;\-+=_\[\]()<>\\|/]+/.test(input),
    ],
  ];

export const PasswordRequirements = [
  "chars_minimum",
  "special_chars",
  "lowercase",
  "uppercase",
  "numeric",
] as const;

export type PasswordRequirementType = typeof PasswordRequirements[number];
