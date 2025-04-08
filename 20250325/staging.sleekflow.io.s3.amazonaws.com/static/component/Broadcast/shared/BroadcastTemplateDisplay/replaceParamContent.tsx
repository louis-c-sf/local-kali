import { getMatchedVariables } from "lib/utility/getMatchedVariables";

export function replaceParamContent(
  replaceContent: string,
  params: string[],
  templateContent: string
) {
  const matchedPatterns = getMatchedVariables(templateContent).map(
    (pattern) => pattern[0]
  );

  if (params.length > 0) {
    return params.reduce((acc, curr, index) => {
      if (matchedPatterns[index]) {
        if (acc.includes(matchedPatterns[index])) {
          return acc.replace(
            matchedPatterns[index],
            replaceContent.replace(
              `{{param}}`,
              curr ? curr : matchedPatterns[index]
            )
          );
        }
        return (
          acc +
          templateContent.replace(
            matchedPatterns[index],
            replaceContent.replace(
              `{{param}}`,
              curr ? curr : matchedPatterns[index]
            )
          )
        );
      } else {
        return acc.replace(curr, replaceContent.replace(`{{param}}`, curr));
      }
    }, templateContent);
  } else {
    return templateContent;
  }
}
