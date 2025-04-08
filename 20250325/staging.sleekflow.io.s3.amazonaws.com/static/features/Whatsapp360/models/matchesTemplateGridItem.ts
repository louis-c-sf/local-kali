import { whereEq } from "ramda";
import { TemplateGridItemType } from "../components/TemplatesGrid/TemplatesGrid";

export function matchesTemplateGridItem(
  id: string,
  language: string
): (data: TemplateGridItemType) => boolean {
  return whereEq({ id, language });
}
