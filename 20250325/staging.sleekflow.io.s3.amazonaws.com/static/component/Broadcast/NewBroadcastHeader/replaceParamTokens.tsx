function addFieldNameToParams(
  content: string,
  profileFieldNames: string[]
): string[] {
  let params: string[] = [];
  profileFieldNames.forEach((fieldName) => {
    const fieldNameToken = new RegExp(`\{\{${fieldName}\}\}`, "ig");
    if (fieldNameToken.test(content)) {
      params.push(fieldName);
    }
  });
  return params;
}

export function replaceParamTokens(
  content: string,
  fieldNames: string[],
  previousNumber: number = 0
) {
  let submitContent = content;
  const checkParams = addFieldNameToParams(submitContent, fieldNames);
  for (let i in checkParams) {
    let paramRegex = new RegExp(`\\{\\{${checkParams[i]}\\}\\}`, "ig");
    submitContent = submitContent.replace(
      paramRegex,
      `{${Number(i) + previousNumber}}`
    );
  }
  return {
    submitContent,
    checkParams: checkParams.map((p) => (p === "payment_url" ? p : `@${p}`)),
    number: checkParams.length + 1,
  };
}
