import axios from 'axios';

export const axiosClient = axios.create({
  /**
   *   the optional chain is needed to prevent type error when running playwright tests. Ideally utility functions
   *   should be isolated in their own separate files with no imports from files that require env variables
   *   to prevent this error
   */
  baseURL: import.meta.env?.VITE_API_BASE_URL,
});
export const useAxios = () => {
  return axiosClient;
};
