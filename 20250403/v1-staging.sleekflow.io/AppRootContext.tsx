import React, {
  ComponentProps,
  ComponentType,
  useCallback,
  useEffect,
} from "react";
import {
  Provider,
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import { Dispatch, Store } from "redux";
import { Action, LoginType } from "./types/LoginType";
import { RegionContext } from "core/models/Region/useSupportedRegions";
import { useAuth0 } from "@auth0/auth0-react";
import { AUTH0_LOCALE_MAPPING_REVERSE } from "./auth/Auth0ProviderWithRedirect";
import { Dimmer, Loader } from "semantic-ui-react";
import useRouteConfig from "./config/useRouteConfig";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";
import Auth0ErrorScreen from "./App/errorBoundaries/Auth0ErrorScreen";
import { Redirect, useHistory } from "react-router";
import { useQueryData } from "./api/apiHook";
import { POST_AUTH0_IS_COMPANY_REGISTERED } from "api/apiPath";
import { Axios } from "axios-observable";
import { URL as apiBaseUrl } from "./api/apiRequest";
import { fetchWebVersion } from "api/Setting/fetchWebVersion";
import { WEB_VERSION_V2_URL } from "auth/Auth0ProviderWithRedirect";
import mixpanel from "mixpanel-browser";
import { VersionDic } from "container/Settings/Profile/types";
import { UserWorkspaceResponseType } from "api/User/postUserWorkspace";
import { CompanyRBACProvider } from "api/Setting/CompanyRBACContext";

export const v2LanguageMap = {
  "zh-HK": "zh-HK",
  "zh-CN": "zh-CN",
  "pt-BR": "pt-BR",
  "en-US": "en",
  "id-ID": "id",
} as const;

const redirectV2ModuleMap = {
  inbox: {
    targetUrl: ["/inbox/*", "/inbox"],
    redirectUrl: "inbox",
  },
  contacts: {
    targetUrl: ["/contacts/*", "/contacts"],
    redirectUrl: "contacts",
  },
  broadcasts: {
    targetUrl: ["/campaigns/*", "/campaigns"],
    redirectUrl: "broadcasts",
  },
  settings: {
    targetUrl: ["/settings/*", "/settings"],
    redirectUrl: "settings",
  },
  analytics: {
    targetUrl: ["/analytics/*", "/analytics"],
    redirectUrl: "analytics",
  },
  channels: {
    targetUrl: ["/channels/*", "/channels"],
    redirectUrl: "channels",
  },
};

export const axiosObservableInstance = Axios.create({
  baseURL: apiBaseUrl,
});
const withWorkspaceLocation = (Component: ComponentType<any>) => {
  return (props: ComponentProps<any>): JSX.Element => {
    const { matchesCurrentRoute } = useRouteConfig();
    const shouldCheckWorkspaceLocation =
      !matchesCurrentRoute("/company/Invitation/Accept") &&
      !matchesCurrentRoute(`/payment-result/success`) &&
      !matchesCurrentRoute("/payment-result/cancel") &&
      !matchesCurrentRoute("/setup-company");

    const workspace = useQueryData<UserWorkspaceResponseType>(
      "/v1/tenant-hub/UserWorkspaces/GetUserWorkspaces",
      {},
      {
        config: {
          baseURL: process.env.REACT_APP_SLEEKFLOW_API_URL,
        },
        protocol: "post",
        enabled: shouldCheckWorkspaceLocation,
      }
    );

    if (!shouldCheckWorkspaceLocation) {
      return <Component {...props} />;
    }

    if (!workspace.data) {
      return (
        <Dimmer active inverted>
          <Loader inverted></Loader>
        </Dimmer>
      );
    }

    // TODO: ignore error for now, add back error checking later once BE api is stable
    // if (workspace.error) {
    //   throw new Error("cannot find user location");
    // }

    const userLocationWorkspace = workspace.data.data.user_workspaces.find(
      (w) => w.is_default
    );

    // TODO: ignore error for now, add back error checking later once BE api is stable
    // if (!userLocationWorkspace) {
    //   throw new Error("cannot find user location");
    // }
    // get access token from auth0 to axios
    // get access token from auth0 to axios
    axiosObservableInstance.interceptors.request.use(
      async (config) => {
        try {
          if (userLocationWorkspace) {
            config.headers = {
              ...config.headers,
              "X-Sleekflow-Location": userLocationWorkspace.server_location,
            };
          }
          return config;
        } catch (e) {
          return config;
        }
      },
      (error) => {
        return error;
      }
    );

    return (
      <Component
        {...props}
        userLocationWorkspace={userLocationWorkspace?.server_location}
      />
    );
  };
};

export function swapKeysAndValues(obj: Record<string, string>) {
  const swapped = Object.entries(obj).map(([key, value]) => [value, key]);

  return Object.fromEntries(swapped);
}

const withAuth0AccessToken = (Component: ComponentType<any>) => {
  const MyComp = (props: ComponentProps<any>): JSX.Element => {
    const {
      i18n: { language },
    } = useTranslation();
    const { matchesCurrentRoute } = useRouteConfig();

    const {
      user,
      getAccessTokenSilently,
      isLoading,
      error,
      isAuthenticated,
      loginWithRedirect,
    } = useAuth0();
    const { search } = window.location;
    const searchParams = new URLSearchParams(search);
    const locale = searchParams.get("locale");
    const backFromV2 = searchParams.get("back_from_v2") === "true";
    const backFromV2FormSession = sessionStorage.getItem("backFromV2");
    const { routeTo } = useRouteConfig();
    const history = useHistory();
    const getCorrectLangCode = () => {
      if (!window.location.pathname.split("/")[1]) {
        return AUTH0_LOCALE_MAPPING_REVERSE[language];
      }
      return window.location.pathname.split("/")[1] === "zh-HK"
        ? "zh-TW"
        : window.location.pathname.split("/")[1];
    };
    const checkDefaultWebVersionRedirect = useCallback(async () => {
      const userId =
        user?.["https://app.sleekflow.io/login_as_user_id"] ??
        user?.["https://app.sleekflow.io/user_id"];
      if (backFromV2 || backFromV2FormSession || !userId) {
        return;
      }
      const redirectTarget = Object.values(redirectV2ModuleMap).find((item) => {
        return item.targetUrl.some((url) => matchesCurrentRoute(url));
      });
      const isReloadOrNavigateBrowserHistory = performance
        .getEntriesByType("navigation")
        .map((nav) => nav.toJSON())
        .find((nav) => ["reload", "back_forward"].includes(nav.type));
      try {
        const result = await fetchWebVersion(userId);
        mixpanel.people.set({
          "Default Version": result.version,
        });
        if (
          result.version === VersionDic.v2 &&
          redirectTarget &&
          !isReloadOrNavigateBrowserHistory
        ) {
          window.location.replace(
            `${WEB_VERSION_V2_URL}/${v2LanguageMap[language]}/${redirectTarget.redirectUrl}`
          );
        }
      } catch (e) {
        console.error(e);
      }
    }, [matchesCurrentRoute, user]);

    useEffect(() => {
      if (backFromV2) {
        sessionStorage.setItem("backFromV2", "true");
        sessionStorage.setItem("backFromV2ForLogin", "true");
      }
      const onbeforeunloadFn = () => {
        sessionStorage.removeItem("backFromV2");
      };
      window.addEventListener("beforeunload", onbeforeunloadFn);
      return () => {
        window.removeEventListener("beforeunload", onbeforeunloadFn);
      };
    }, [backFromV2]);

    if (isLoading) {
      return (
        <Dimmer active inverted>
          <Loader inverted></Loader>
        </Dimmer>
      );
    }

    if (error) {
      return <Auth0ErrorScreen error={error} emailAddress={user?.email} />;
    }

    checkDefaultWebVersionRedirect();

    /* HACK: Wanted to use withAuthenticationGuard from auth0 but seems it doesn't play
     * nice with react router 5 so protecting routes at this level
     * */
    if (
      !isAuthenticated &&
      // check if routes are public
      !matchesCurrentRoute("/company/Invitation/Accept") &&
      !matchesCurrentRoute(`/payment-result/success`) &&
      !matchesCurrentRoute("/payment-result/cancel") &&
      !matchesCurrentRoute("/error/unexpected") &&
      !matchesCurrentRoute("/company/shopify/redirect/url") &&
      !matchesCurrentRoute("/company/shopify/install") &&
      !matchesCurrentRoute("/company/shopify/email/auth")
    ) {
      loginWithRedirect({
        appState: {
          locale: locale ?? window.location.pathname.split("/")[1],
        },
        ui_locales: getCorrectLangCode(),
      });

      return (
        <Dimmer active inverted>
          <Loader inverted></Loader>
        </Dimmer>
      );
    }

    axiosObservableInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            loginWithRedirect({
              appState: {
                locale: locale ?? window.location.pathname.split("/")[1],
              },
              ui_locales: getCorrectLangCode(),
            });
          } else if (error.response?.status === 403) {
            history.push(routeTo("/access-denied"));
          }
        }
        throw error;
      }
    );

    // get access token from auth0 to axios
    axiosObservableInstance.interceptors.request.use(
      async (config) => {
        try {
          const accessToken = await getAccessTokenSilently();
          // config.baseURL = config.url?.includes("/v1/tenant-hub")
          //   ? process.env.REACT_APP_SLEEKFLOW_API_URL
          //   : process.env.REACT_APP_API_URL;
          config.baseURL = config.url?.includes("/v1/tenant-hub")
            ? process.env.REACT_APP_SLEEKFLOW_API_URL
            : process.env.REACT_APP_API_URL;
          if (accessToken && !config.skipAuth) {
            config.headers = {
              ...config.headers,
              authorization: `Bearer ${accessToken}`,
            };
          }
          return config;
        } catch (e) {
          config.baseURL = config.url?.includes("/v1/tenant-hub")
            ? process.env.REACT_APP_SLEEKFLOW_API_URL
            : process.env.REACT_APP_API_URL;
          return config;
        }
      },
      (error) => {
        return error;
      }
    );

    return <Component {...props} />;
  };

  return MyComp;
};
type CompanyRegisteredResponse = {
  data: {
    is_company_registered: boolean;
    http_status_code: number;
    success: boolean;
  };
  success: boolean;
};
const withCompanyCheck = (Component: ComponentType<any>) => {
  return (props: ComponentProps<any>): JSX.Element => {
    const { matchesCurrentRoute, routeTo } = useRouteConfig();
    const isCompanyRegistered = useQueryData<CompanyRegisteredResponse>(
      POST_AUTH0_IS_COMPANY_REGISTERED,
      {},
      {
        protocol: "post",
        enabled:
          !matchesCurrentRoute("/company/Invitation/Accept") &&
          !matchesCurrentRoute(`/payment-result/success`) &&
          !matchesCurrentRoute("/payment-result/cancel") &&
          !matchesCurrentRoute("/company/shopify/install") &&
          !matchesCurrentRoute("/company/shopify/redirect/url") &&
          !matchesCurrentRoute("/error/unexpected") &&
          !matchesCurrentRoute("/company/shopify/email/auth"),
      }
    );
    if (
      isCompanyRegistered.data &&
      isCompanyRegistered.data?.data?.is_company_registered &&
      isCompanyRegistered.data.success &&
      matchesCurrentRoute("/setup-company")
    ) {
      return <Redirect to={routeTo("/inbox")} />;
    }

    if (
      isCompanyRegistered.data &&
      !isCompanyRegistered.data?.data?.is_company_registered &&
      isCompanyRegistered.data.success &&
      !matchesCurrentRoute("/setup-company")
    ) {
      return <Redirect to={routeTo("/setup-company")} />;
    }

    if (
      isCompanyRegistered.data?.data &&
      isCompanyRegistered.data?.data?.http_status_code &&
      isCompanyRegistered.data?.data?.http_status_code !== 200
    ) {
      const error = isCompanyRegistered.data.data.http_status_code;
      if (error !== 401) {
        throw new Error("error determining whether user has company");
      }
    }
    if (isCompanyRegistered.loading) {
      return (
        <Dimmer active inverted>
          <Loader inverted></Loader>
        </Dimmer>
      );
    }

    return <Component {...props} />;
  };
};

const AppRootContext = (props: {
  value: Store<LoginType, Action>;
  // this prop is injected via withWorkspaceLocation HOC above
  userLocationWorkspace?: string;
  children: any;
}) => {
  let { value, children } = props;

  if (props.userLocationWorkspace) {
    value.dispatch({
      type: "COMPANY.USER_WORKSPACE_LOCATION.LOAD",
      userWorkspaceLocation: props.userLocationWorkspace,
    });
  }
  return (
    <Provider store={value}>
      <RegionContext>
        <CompanyRBACProvider>{children}</CompanyRBACProvider>
      </RegionContext>
    </Provider>
  );
};
export const useAppDispatch = () => useDispatch<Dispatch<Action>>();
export const useAppSelector: TypedUseSelectorHook<LoginType> = useSelector;

export default withAuth0AccessToken(
  withCompanyCheck(withWorkspaceLocation(AppRootContext))
);
