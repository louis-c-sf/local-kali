import React from "react";
import { useLocation } from "react-router-dom";
import { getCurrentPath } from "../helpers/getCurrentPath";
import { useTranslation } from "react-i18next";

export const useCurrentPath = () => {
  const location = useLocation();
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const currentPath = getCurrentPath(lang, location.pathname);
  return { currentPath };
};
