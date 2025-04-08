import { axiosObservableInstance } from "AppRootContext";
import { AxiosError, AxiosRequestConfig } from "axios";
import jsFileDownload from "js-file-download";
import { isObject } from "lodash-es";
import { AjaxError } from "rxjs/internal/observable/dom/AjaxObservable";

export const URL = process.env.REACT_APP_API_URL ?? "";

export const COUNTRY_CODE_FETCH_API =
  "https://extreme-ip-lookup.com/json/{publicIP}?key=xDaEkgGArK5VwdGE664V";

export interface ParamType {
  header?: object;
  param: object | string | Array<object>;
  config?: Record<string, unknown>;
}

interface DictParamType {
  header?: object;
  param: object;
}

type ApiErrorType = {
  errorId?: string;
  message?: string;
  errorMessage?: string;
  errorCode?: number;
  errorContext?: {
    output: {
      error_context: {
        error: {
          error_subcode: number;
        };
      };
    };
  };
};
type ApiSimpleErrorType = {
  message: string;
};

export const getExternalResource = async (url: string, param: ParamType) => {
  try {
    const result = await axiosObservableInstance
      .get(url, {
        headers: {
          "Content-Type": "application/json",
        },
        skipAuth: true,
      })
      .toPromise();
    return result.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/**
 * @deprecated Produces not all the types of exceptions and hides their details
 * */
export const post = async (path: string, param: ParamType) => {
  try {
    return await postWithExceptions(path, param);
  } catch (e) {
    const response = (e as AjaxError).response;
    if (response) {
      if (response.data) {
        if (Array.isArray(response.data) || typeof response.data === "object") {
          throw new Error(JSON.stringify(response.data));
        }
      }
      throw new Error(response.data.message);
    } else {
      throw new Error("Incorrect input");
    }
  }
};

export async function putWithExceptions(path: String, param: ParamType) {
  const requestParam = param.param || {};
  const result = await axiosObservableInstance
    .put(`${path}`, requestParam, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        ...param.header,
      },
    })
    .toPromise();
  return result.data;
}

/**
 * @throws AxiosError
 */
export async function postWithExceptions<
  TResult = any,
  TParams extends ParamType = ParamType
>(path: string, param: TParams) {
  const requestParam = param.param || {};
  axiosObservableInstance.defaults.baseURL =
    (param.config?.defaultUrl as string) ?? URL;
  const result = await axiosObservableInstance
    .post<TResult>(path, requestParam, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        ...param.header,
      },
      ...param.config,
    })
    .toPromise();
  return result.data;
}

export const postFiles = async (
  path: String,
  fileInputs: Array<{ name: string; file: File }>,
  param?: DictParamType
) => {
  try {
    let formData = new FormData();

    if (param) {
      for (let paramName in param.param) {
        formData.append(paramName, param.param[paramName]);
      }
    }
    for (let { name, file } of fileInputs) {
      formData.append(name, file);
    }

    const result = await axiosObservableInstance
      .post(`${URL}${path}`, formData, {
        headers: {
          ...param?.header,
          "Content-Type": "multipart/form-data",
        },
      })
      .toPromise();
    return result.data;
  } catch (e) {
    const response = (e as AjaxError).response;
    if (response) {
      if (response.data) {
        if (Array.isArray(response.data) || typeof response.data === "object") {
          throw new Error(JSON.stringify(response.data));
        }
      }
      throw new Error(response.data.message);
    } else {
      throw new Error("Incorrect input");
    }
  }
};

export const downloadAttachmentViaGet = async (
  path: String,
  filename: string,
  isDownload?: boolean
) => {
  const result = await axiosObservableInstance
    .get(`${URL}${path}`, {
      responseType: "blob",
      headers: {
        Accept: "*/*",
        "Cache-Control": "no-cache",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
      },
    })
    .toPromise();
  const mime = result.headers["content-type"];
  console.debug("result.headersresult.headers", result.headers);
  if (isDownload) {
    jsFileDownload(result.data, filename, mime);
  } else {
    return {
      content: result.data,
      mimeType: mime,
    };
  }
};
export const downloadFileViaGet = async (
  path: String,
  filename: string,
  mime: string,
  header?: object
) => {
  const result = await axiosObservableInstance
    .get(`${URL}${path}`, {
      headers: {
        Accept: "*/*",
        "Cache-Control": "no-cache",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
        ...(header || {}),
      },
    })
    .toPromise();

  jsFileDownload(result.data, filename, mime);
};

export const downloadFileViaPost = async (
  path: String,
  params: {},
  filename: string,
  mime: string,
  header?: object
) => {
  const result = await axiosObservableInstance
    .post(`${URL}${path}`, params, {
      headers: {
        Accept: "*/*",
        "Cache-Control": "no-cache",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
        ...(header || {}),
      },
    })
    .toPromise();

  jsFileDownload(result.data, filename, mime);
};

export const get = async (path: String, param: ParamType) => {
  try {
    return await getWithExceptions(path, param);
  } catch (e) {
    console.error("get API Error", e);
  }
};

export function getWithExceptions$(
  path: String,
  { header, param, config }: ParamType,
  signal?: AbortSignal
) {
  const paramString = Object.keys(param || [])
    .map((key) => `${key}=${param[key]}`)
    .join("&");

  return axiosObservableInstance.get(`${path}?${paramString}`, {
    headers: {
      "Content-Type": "application/json",
      ...{ ...header },
    },
    ...config,
    signal,
  });
}

export function postWithExceptions$(
  path: String,
  param: ParamType,
  config?: AxiosRequestConfig<any> | undefined
) {
  return axiosObservableInstance.post(`${path}`, param.param, {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      ...param.header,
    },
    ...config,
  });
}

/**
 * @param path
 * @param param
 * @throws {AjaxError}
 */
export async function getWithExceptions(path: String, param: ParamType) {
  const result = await getWithExceptions$(path, param).toPromise();
  return result.data;
}

/**
 * Warning: not for using in the get***() methods for now, until API expects for unescaped query.
 * @param query
 */
export function buildParamString(
  query: string | Record<string, string> | undefined
): string {
  return new URLSearchParams(query).toString();
}

export async function getBatch(
  ...requests: { path: string; param: ParamType }[]
) {
  return Promise.all(
    requests.map((request) => getWithExceptions(request.path, request.param))
  );
}

export const deleteMethodWithExceptions = async (
  path: String,
  param: ParamType
) => {
  const result = await axiosObservableInstance
    .delete(`${URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
      },
      data: param.param || {},
    })
    .toPromise();
  return result.data;
};

export const deleteMethod = async (path: String, param: ParamType) => {
  try {
    return await deleteMethodWithExceptions(path, param);
  } catch (e) {}
};

export const putMethodWithExceptions = async (
  path: String,
  param: ParamType
) => {
  const requestParam = param.param || {};

  const result = await axiosObservableInstance
    .put(`${URL}${path}`, requestParam, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        ...param.header,
      },
    })
    .toPromise();
  return result.data;
};

export const putMethod = async (path: String, param: ParamType) => {
  try {
    return putMethodWithExceptions(path, param);
  } catch (e) {}
};

export function parseHttpError(e: any): string | ApiErrorType {
  if (typeof e === "string") {
    return e;
  }
  if (isAxiosHttpError(e)) {
    console.log("isAxiosHttpError(e): ", isAxiosHttpError(e));
    const data = e?.response?.data;
    console.log("data: ", data);
    if (isApiError(data)) {
      console.log("isApiError(data): ", isApiError(data));
      return data;
    }
    //@ts-ignore
    if (typeof data?.message === "string") {
      //@ts-ignore
      return data.message;
    } else {
      return e?.response?.statusText ?? "Unknown error";
    }
  } else if (isAjaxHttpError(e)) {
    console.log("isAjaxHttpError(e): ", isAjaxHttpError(e));
    const data = e?.response?.response;
    console.log("data: ", data);
    if (isApiError(data)) {
      return data;
    }
    if (typeof data?.message === "string") {
      return data.message;
    } else {
      return e?.message ?? "Unknown error";
    }
  }
  return "Undefined error";
}

export function isApiSimpleError(error: any): error is ApiSimpleErrorType {
  return isObject(error) && (error as any).message !== undefined;
}

export function isApiError(error: any): error is ApiErrorType {
  if (typeof error !== "object") {
    return false;
  }
  return (
    (typeof error.message === "string" && typeof error.errorId === "string") ||
    (typeof error.errorMessage === "string" &&
      typeof error.errorCode === "number")
  );
}

export function isAxiosHttpError(e: any): e is AxiosError<any> {
  return (
    !isAjaxHttpError(e) && (e as AxiosError<any>)?.response?.data !== undefined
  );
}

export function isAjaxHttpError(e: any): e is AjaxError {
  return (e as AjaxError).xhr !== undefined;
}
