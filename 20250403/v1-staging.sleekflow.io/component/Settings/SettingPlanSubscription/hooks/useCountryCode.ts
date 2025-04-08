import { fetchCompanyCountry } from "api/Company/fetchCompanyCountry";
import useFetchCompany from "api/Company/useFetchCompany";
import { useEffect, useState } from "react";
import { getCountryCode } from "../../../../api/countryCode";

export const useCountryCode = () => {
  const [{ loading, countryCode }, setCountryCode] = useState({
    loading: true,
    countryCode: "",
  });
  const { company } = useFetchCompany();
  useEffect(() => {
    let isMounted = true;
    const fetchCountryCode = async () => {
      try {
        const countryCodeFromIp = await getCountryCode();
        if ("countryCode" in countryCodeFromIp && isMounted) {
          return setCountryCode({
            loading: false,
            countryCode: countryCodeFromIp.countryCode,
          });
        }
      } catch (e) {
        if (isMounted && company?.companyCountry) {
          const result = await fetchCompanyCountry({
            countryName: company.companyCountry,
          });
          if (result.length) {
            return setCountryCode({
              countryCode: result[0].id,
              loading: false,
            });
          }
        }
        console.error(e);
      } finally {
        setCountryCode((prev) => ({ ...prev, loading: false }));
      }
    };
    fetchCountryCode();

    return () => {
      isMounted = false;
    };
  }, [company?.companyCountry]);

  return {
    loading,
    countryCode,
  };
};
