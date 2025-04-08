import {
  getWithExceptions$,
  ParamType,
  postWithExceptions$,
} from "./apiRequest";
import { useEffect, useState } from "react";
import { AxiosRequestConfig } from "axios";

// Reference: https://beta.reactjs.org/learn/you-might-not-need-an-effect#fetching-data
export function useQueryData<T>(
  apiPath: string,
  param?: ParamType["param"],
  options?: {
    config?: AxiosRequestConfig;
    enabled?: boolean;
    protocol?: "get" | "post";
  }
) {
  const [data, setData] = useState<T>();
  const [status, setStatus] = useState<
    "loading" | "idle" | "error" | "success"
  >("idle");
  const [errorRes, setErrorRes] = useState<any>(null);
  const loading = status === "loading";
  const error = status === "error";
  useEffect(() => {
    const abortController = new AbortController();

    async function getData() {
      try {
        if (options?.enabled || options?.enabled === undefined) {
          setStatus("loading");
          let result;
          if (options?.protocol === "post") {
            result = await postWithExceptions$(
              apiPath,
              {
                header: options?.config?.headers,
                param: param ?? {},
              },
              { signal: abortController.signal, ...options.config }
            ).toPromise();
          } else {
            result = await getWithExceptions$(
              apiPath,
              {
                header: options?.config?.headers,
                param: param ?? {},
              },

              abortController.signal
            ).toPromise();
          }

          setErrorRes(null);
          setData(result.data);
          setStatus("success");
        }
      } catch (e) {
        setErrorRes(e);
        setStatus("error");
      }
    }

    getData();
    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPath, options?.enabled, JSON.stringify(param)]);

  return { data, loading, error, errorRes, status };
}
