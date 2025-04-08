export function splitWhatsappTemplateByVars(template: string, vars: string[]) {
  return nextVar(template, [...vars]);
}

function nextVar(text: string, vars: string[]): string[] {
  const acc: string[] = [];
  if (vars.length === 0) {
    return [...acc, text];
  }

  const [varCurrent, ...restVars] = vars;
  if (!text.includes(varCurrent)) {
    return nextVar(text, restVars);
  }
  const [beforeVar, afterVar] = text.split(varCurrent, 2);

  if (afterVar === "") {
    return [...acc, beforeVar, varCurrent];
  }

  return [...acc, beforeVar, varCurrent, ...nextVar(afterVar, restVars)];
}
