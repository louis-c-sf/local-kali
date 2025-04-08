import { splitWhatsappTemplateByVars } from "./splitWhatsappTemplateByVars";
import { parseWhatsappTemplateVars } from "./parseWhatsappTemplateVars";

export function walkWhatsappTemplateParts(input: string) {
  const vars = parseWhatsappTemplateVars(input);
  const parts = splitWhatsappTemplateByVars(input, vars);
  return parts.map<TemplateASTNodeType>((p) => {
    if (vars.includes(p)) {
      return {
        type: "var",
        name: p,
      };
    }
    return {
      type: "string",
      value: p,
    };
  });
}

export type StringNodeType = {
  type: "string";
  value: string;
};
export type VarNodeType = {
  type: "var";
  name: string;
};

export type TemplateASTNodeType = StringNodeType | VarNodeType;

export function isVarNode(node: TemplateASTNodeType): node is VarNodeType {
  return node.type === "var";
}
