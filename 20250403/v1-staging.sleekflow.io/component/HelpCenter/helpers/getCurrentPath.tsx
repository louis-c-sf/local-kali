import mappingData from "../assets/mappingData.json";

export const getCurrentPath = (lang: string, pathname: string) => {
  const filterLangReg = new RegExp(lang + "/(.*)");
  const filteredLangMatch = pathname.match(filterLangReg);
  const filteredLangPath = filteredLangMatch ? filteredLangMatch[1] : "";
  if (mappingData.pages.hasOwnProperty(filteredLangPath)) {
    return filteredLangPath;
  } else {
    const filterExtraPathReg = new RegExp("(.*)/");
    const filteredExtraMatch = filteredLangPath.match(filterExtraPathReg);
    const filteredExtraPath = filteredExtraMatch ? filteredExtraMatch[1] : "";
    if (mappingData.pages.hasOwnProperty(filteredExtraPath)) {
      return filteredExtraPath;
    } else {
      return "noMatched";
    }
  }
};
