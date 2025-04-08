import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Helmet from "react-helmet";
import { Button } from "component/shared/Button/Button";
import { PreLogin } from "component/Header";
import styles from "./AccessDeniedNonIPWhiteList.module.css";
import { Icon } from "component/shared/Icon/Icon";
import { useGetCurrentIp } from "./hooks/useGetCurrentIp";
import { Dimmer, Loader } from "semantic-ui-react";
import { useAuth0 } from "@auth0/auth0-react";
import { useGetPermissionListByRoleNameQueries } from "api/Setting/CompanyRBACContext";

export const AccessDeniedNonIPWhiteList = () => {
  const { t } = useTranslation();
  const { logout } = useAuth0();
  const currentIpApi = useGetCurrentIp();
  const [ip, setIp] = useState("");

  const { refetch } = useGetPermissionListByRoleNameQueries();

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const getIps = async () => {
      const ip = await currentIpApi.boot();
      setIp(ip ?? "");
    };
    if (currentIpApi.isBooted) {
      return;
    }
    getIps();
  }, [currentIpApi, currentIpApi.isBooted]);

  return (
    <div>
      <Helmet title={t("nav.common.title", { page: t("nav.signup.title") })} />
      <PreLogin />
      <div className={styles.container}>
        {currentIpApi.isLoading ? (
          <Dimmer active inverted>
            <Loader inverted></Loader>
          </Dimmer>
        ) : (
          <>
            <div className={styles.iconBg}>
              <Icon type={"lock"} />
            </div>
            <div className={styles.title}>{t("accessDenied.title")}</div>
            <div className={styles.description}>
              {t("accessDenied.description", {
                ip,
              })}
            </div>
            <Button
              onClick={() =>
                logout({
                  returnTo: window.location.origin,
                })
              }
              primary
            >
              {t("accessDenied.button")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
