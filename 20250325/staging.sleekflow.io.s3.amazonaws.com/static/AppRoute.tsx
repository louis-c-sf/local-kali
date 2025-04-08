import { Redirect, Route, Switch, useLocation } from "react-router";
import React, { useCallback, useEffect } from "react";
import useRouteConfig from "./config/useRouteConfig";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "./AppRootContext";
import { useLocaleSetup } from "./i18n/useLocaleSetup";
import { equals, pick } from "ramda";
import * as Sentry from "@sentry/react";
import { TakeoverScreen } from "./component/Chat/takeover/TakeoverScreen";
import { useLimitedInboxLogin } from "./component/Chat/hooks/Labels/useLimitedInboxLogin";
import { useAccessRulesGuard } from "./component/Settings/hooks/useAccessRulesGuard";
import { useAuth0 } from "@auth0/auth0-react";
import moment from "moment/moment";
import { logoutWithLocale } from "./auth/Auth0ProviderWithRedirect";
import { ErrorBoundary } from "@sentry/react";
import { useAnalytics } from "component/shared/useAnalytics";
import { useGetIsRbacEnabledQuery } from "api/Setting/useGetIsRbacEnabledQuery";

const tryParseJSON = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

function AppRoute() {
  const [userId] = useAppSelector((s) => [s.user?.id], equals);
  const userInfo = useAppSelector((s) => s.loggedInUserDetail, equals);
  const isRbacEnabled = useAppSelector((s) => s.isRbacEnabled);
  const loginDispatch = useAppDispatch();
  const {
    i18n: { language },
  } = useTranslation();
  const { getAccessTokenSilently, user, logout, isAuthenticated } = useAuth0();
  useAnalytics();

  const isRbacEnabledEnv = process.env.REACT_APP_ENABLE_RBAC === "true";
  const { fetchIsRbacEnabled } = useGetIsRbacEnabledQuery({
    isEnabled: isRbacEnabledEnv && isAuthenticated,
  });
  const stringifiedDiveUserInfo =
    user?.["https://app.sleekflow.io/login_as_user"];
  const diveUserInfo: {
    company_id: string;
    expire_at: Date;
    staff_id: number;
    user_id: string;
  } | null = stringifiedDiveUserInfo
    ? tryParseJSON(stringifiedDiveUserInfo)
    : null;

  const diveTimeRemaining = diveUserInfo?.expire_at
    ? moment(diveUserInfo?.expire_at).diff(moment(), "seconds")
    : 0;
  useEffect(() => {
    if (isRbacEnabled === undefined && isRbacEnabledEnv) {
      fetchIsRbacEnabled();
    }
  }, [isRbacEnabled, isRbacEnabledEnv]);
  useEffect(() => {
    // Don't set user obj if unauthenticated or else it will kick the user out of app
    if (!isAuthenticated) {
      return;
    }
    const setUserObj = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        if (accessToken && user) {
          const targetUserId =
            diveTimeRemaining > 0 && diveUserInfo
              ? diveUserInfo.user_id
              : user?.["https://app.sleekflow.io/user_id"];
          loginDispatch({
            user: {
              userAgent: "",
              accessToken,
              id: targetUserId,
              email: user?.email ?? "",
              userName: user?.email ?? "",
              firstName: user?.given_name ?? "",
              lastName: user?.family_name ?? "",
              isAuthenticated: true,
              signalRGroupName: "",
            },
            type: "LOGIN",
          });
        }
      } catch (e) {
        logoutWithLocale(logout, language);
      }
    };
    setUserObj();
  }, [user]);

  const location = useLocation();
  const isTakeoverLocked = useAppSelector((s) => s.session.takeover.locked);
  const accessRuleGuard = useAccessRulesGuard();
  const { authenticatedRoutes, routeTo, publicRoutes } = useRouteConfig();

  useEffect(() => {
    if (!userInfo?.userInfo) {
      return;
    }
    const { id, userName, email, userRole } = userInfo.userInfo;
    Sentry.setUser({
      id: id,
      userId: id,
      username: userName,
      email: email,
      staffId: id,
      // associatedTeams: JSON.stringify(associatedTeams),
      userRole: userRole,
      // createdAt: userInfo.createdAt,
      // roleType: roleType,
      // timeZoneInfo: JSON.stringify(timeZoneInfo),
      status: userInfo.status,
    });
  }, [userInfo?.userInfo]);
  useLocaleSetup();
  useLimitedInboxLogin();

  const RouteRedirect = useCallback(
    function RouteRedirect() {
      return (
        <Redirect to={routeTo(`/inbox/${userId ?? "all"}${location.search}`)} />
      );
    },
    [routeTo, userId, location.search]
  );
  if (
    isTakeoverLocked &&
    !accessRuleGuard.isSuperAdmin() &&
    !user?.["https://app.sleekflow.io/login_as_user_id"]
  ) {
    return <TakeoverScreen />;
  }

  return (
    <ErrorBoundary>
      <Switch>
        {authenticatedRoutes.langRoute.map((route, r) => (
          <Redirect
            exact
            path={route.path}
            to={{
              pathname: `/${language}${route.path}`,
              search: location.search,
              state: { ...location.state },
              key: location.key,
              hash: location.hash,
            }}
            key={`redir${r}`}
          />
        ))}
        {authenticatedRoutes.langRoute.map((route, r) => (
          <Route
            exact
            path={`/${language}${route.path}`}
            component={route.component}
            key={r}
          />
        ))}
        {authenticatedRoutes.noLangRoute.map((route, r) => (
          <Route
            exact
            path={route.path}
            component={route.component}
            key={`noLangRoute${route.path}`}
          />
        ))}
        {publicRoutes.langRoute.map((route) => (
          <Route
            exact
            path={`/${language}${route.path}`}
            component={route.component}
            key={`noLangRoute${route.path}`}
          />
        ))}
        {publicRoutes.langRoute.map((route, r) => (
          <Redirect
            exact
            path={route.path}
            to={{
              pathname: `/${language}${route.path}`,
              search: location.search,
              state: { ...location.state },
              key: location.key,
              hash: location.hash,
            }}
            key={`redir${r}`}
          />
        ))}
        <Route exact path="/" component={RouteRedirect} key={"000"} />
        <Route component={RouteRedirect} />
      </Switch>
    </ErrorBoundary>
  );
}

export default AppRoute;
