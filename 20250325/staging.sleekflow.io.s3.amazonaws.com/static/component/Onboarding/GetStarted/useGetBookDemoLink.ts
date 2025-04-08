import { useAppSelector } from "AppRootContext";
import { equals } from "ramda";
import { useTranslation } from "react-i18next";

const demoLang = {
  "en-US": "",
  "zh-HK": "/zh-hk",
  "zh-CN": "/zh-cn",
};
function tryEncodeURL(jsonObject: Record<string, unknown>) {
  if (Object.keys(jsonObject).length) {
    try {
      return encodeToBinary(JSON.stringify(jsonObject));
    } catch (e) {
      console.warn(e);
      return "";
    }
  }
  return "";
}
function encodeToBinary(str: string): string {
  return window.btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    })
  );
}
export default function useGetBookDemoLink(): string {
  const userInfo = useAppSelector((s) => s?.currentStaff?.userInfo, equals);
  const companyName = useAppSelector((s) => s?.company?.companyName);
  const {
    i18n: { language },
  } = useTranslation();

  const paramsObj = {
    firstName: userInfo?.firstName || "",
    lastName: userInfo?.lastName || "",
    businessEmail: userInfo?.email || "",
    phoneNumber: userInfo?.phoneNumber || "",
    companyName: companyName || "",
  };

  const searchParams = new URLSearchParams({ info: tryEncodeURL(paramsObj) });
  return `https://sleekflow.io${demoLang[language]}/book-a-demo?${searchParams}`;
}
