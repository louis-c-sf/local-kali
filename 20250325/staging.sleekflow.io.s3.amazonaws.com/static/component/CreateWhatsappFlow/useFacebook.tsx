import { useState, useEffect, useCallback } from "react";

declare global {
  interface Window {
    FB: {
      login: (response: object, options: object) => void;
      logout: () => void;
      init: (options: object) => void;
    };
    fbAsyncInit: any;
  }
}

const initializeFb = () =>
  // eslint-disable-next-line no-unused-vars
  new Promise((resolve, _reject) => {
    const FB = window.FB;
    if (typeof window.FB !== "undefined") {
      resolve(true);
    } else {
      // eslint-disable-next-line func-names
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: process.env.REACT_APP_FACEBOOK_API_ID,
          xfbml: true,
          version: "v18.0",
        });
        resolve(true);
      };
      // eslint-disable-next-line func-names
      (function (d, s, id) {
        var js,
          fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
          return;
        }
        js = d.createElement(s) as HTMLScriptElement;
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode?.insertBefore(js, fjs);
      })(document, "script", "facebook-jssdk");
    }
  });

const useFacebook = (onReady: () => void) => {
  const [fb, setFB] = useState<object>();
  const [isReady, setReady] = useState(false);

  const initFacebook = useCallback(async () => {
    await initializeFb();
    if (typeof window.FB !== "undefined") {
      setFB(window.FB);
      setReady(true);
      onReady();
    }
  }, []);

  useEffect(() => {
    initFacebook();
  }, [initFacebook]);

  return [fb, isReady];
};

export default useFacebook;
