import { useTranslation } from "react-i18next";
import { useCallback, useMemo, useRef } from "react";
import CountryType from "../../types/CountryType";
import { assocPath, path } from "ramda";
import { fetchCompanyCountry } from "api/Company/fetchCompanyCountry";

export function useCountryDialList() {
  const { t, i18n } = useTranslation();
  const nameResultCache = useRef<object>({});
  const codeResultCache = useRef<object>({});

  const fetchCountryByCountryName = useCallback(
    async (countryName: string) => {
      const cached = path(
        [i18n.language, countryName],
        nameResultCache.current
      );
      if (cached) {
        return cached as string;
      }
      try {
        const result: CountryType[] = await fetchCompanyCountry({
          countryName,
        });
        if (result.length > 0) {
          const code = result[0].phoneCountryCode;
          nameResultCache.current = assocPath(
            [i18n.language, countryName],
            code,
            nameResultCache.current
          );
          return code;
        }
      } catch (e) {
        console.error(e);
        return;
      }
    },
    [i18n.language]
  );

  const fetchCountryByCountryCode = useCallback(async (countryCode: string) => {
    const cached = path([i18n.language, countryCode], codeResultCache.current);
    if (cached) {
      return cached as string;
    }

    const result: CountryType[] = await fetchCompanyCountry({ countryCode });

    if (result.length > 0) {
      const code = result[0].phoneCountryCode;
      codeResultCache.current = assocPath(
        [i18n.language, countryCode],
        code,
        codeResultCache.current
      );
      return code as string;
    }
  }, []);

  const getCountryCodeByAbbreviationOrName: (
    input: string
  ) => Promise<string | undefined> = useCallback(async (input: string) => {
    if (input.length === 2) {
      const phoneCountryCode = await fetchCountryByCountryCode(input);
      if (phoneCountryCode) {
        return phoneCountryCode;
      }
    } else {
      const phoneCountryCode = await fetchCountryByCountryName(input);
      if (phoneCountryCode) {
        return phoneCountryCode;
      }
    }
  }, []);

  // memo keeps ref and skips any recalculations including translations
  const countryDialList = useMemo(
    () =>
      Object.freeze([
        {
          name: t("countries.AW.name"),
          code: "AW",
          callingCode: "297",
        },
        {
          name: t("countries.AF.name"),
          code: "AF",
          callingCode: "93",
        },
        {
          name: t("countries.AO.name"),
          code: "AO",
          callingCode: "244",
        },
        {
          name: t("countries.AI.name"),
          code: "AI",
          callingCode: "1264",
        },
        {
          name: t("countries.AX.name"),
          code: "AX",
          callingCode: "358",
        },
        {
          name: t("countries.AL.name"),
          code: "AL",
          callingCode: "355",
        },
        {
          name: t("countries.AD.name"),
          code: "AD",
          callingCode: "376",
        },
        {
          name: t("countries.AE.name"),
          code: "AE",
          callingCode: "971",
        },
        {
          name: t("countries.AR.name"),
          code: "AR",
          callingCode: "54",
        },
        {
          name: t("countries.AM.name"),
          code: "AM",
          callingCode: "374",
        },
        {
          name: t("countries.AS.name"),
          code: "AS",
          callingCode: "1684",
        },
        {
          name: t("countries.AG.name"),
          code: "AG",
          callingCode: "1268",
        },
        {
          name: t("countries.AU.name"),
          code: "AU",
          callingCode: "61",
        },
        {
          name: t("countries.AT.name"),
          code: "AT",
          callingCode: "43",
        },
        {
          name: t("countries.AZ.name"),
          code: "AZ",
          callingCode: "994",
        },
        {
          name: t("countries.BI.name"),
          code: "BI",
          callingCode: "257",
        },
        {
          name: t("countries.BE.name"),
          code: "BE",
          callingCode: "32",
        },
        {
          name: t("countries.BJ.name"),
          code: "BJ",
          callingCode: "229",
        },
        {
          name: t("countries.BF.name"),
          code: "BF",
          callingCode: "226",
        },
        {
          name: t("countries.BD.name"),
          code: "BD",
          callingCode: "880",
        },
        {
          name: t("countries.BG.name"),
          code: "BG",
          callingCode: "359",
        },
        {
          name: t("countries.BH.name"),
          code: "BH",
          callingCode: "973",
        },
        {
          name: t("countries.BS.name"),
          code: "BS",
          callingCode: "1242",
        },
        {
          name: t("countries.BA.name"),
          code: "BA",
          callingCode: "387",
        },
        {
          name: t("countries.BL.name"),
          code: "BL",
          callingCode: "590",
        },
        {
          name: t("countries.BY.name"),
          code: "BY",
          callingCode: "375",
        },
        {
          name: t("countries.BZ.name"),
          code: "BZ",
          callingCode: "501",
        },
        {
          name: t("countries.BM.name"),
          code: "BM",
          callingCode: "1441",
        },
        {
          name: t("countries.BO.name"),
          code: "BO",
          callingCode: "591",
        },
        {
          name: t("countries.BR.name"),
          code: "BR",
          callingCode: "55",
        },
        {
          name: t("countries.BB.name"),
          code: "BB",
          callingCode: "1246",
        },
        {
          name: t("countries.BN.name"),
          code: "BN",
          callingCode: "673",
        },
        {
          name: t("countries.BT.name"),
          code: "BT",
          callingCode: "975",
        },
        {
          name: t("countries.BW.name"),
          code: "BW",
          callingCode: "267",
        },
        {
          name: t("countries.CF.name"),
          code: "CF",
          callingCode: "236",
        },
        {
          name: t("countries.CA.name"),
          code: "CA",
          callingCode: "1",
        },
        {
          name: t("countries.CC.name"),
          code: "CC",
          callingCode: "61",
        },
        {
          name: t("countries.CH.name"),
          code: "CH",
          callingCode: "41",
        },
        {
          name: t("countries.CL.name"),
          code: "CL",
          callingCode: "56",
        },
        {
          name: t("countries.CN.name"),
          code: "CN",
          callingCode: "86",
        },
        {
          name: t("countries.CI.name"),
          code: "CI",
          callingCode: "225",
        },
        {
          name: t("countries.CM.name"),
          code: "CM",
          callingCode: "237",
        },
        {
          name: t("countries.CD.name"),
          code: "CD",
          callingCode: "243",
        },
        {
          name: t("countries.CG.name"),
          code: "CG",
          callingCode: "242",
        },
        {
          name: t("countries.CK.name"),
          code: "CK",
          callingCode: "682",
        },
        {
          name: t("countries.CO.name"),
          code: "CO",
          callingCode: "57",
        },
        {
          name: t("countries.KM.name"),
          code: "KM",
          callingCode: "269",
        },
        {
          name: t("countries.CV.name"),
          code: "CV",
          callingCode: "238",
        },
        {
          name: t("countries.CR.name"),
          code: "CR",
          callingCode: "506",
        },
        {
          name: t("countries.CU.name"),
          code: "CU",
          callingCode: "53",
        },
        {
          name: t("countries.CW.name"),
          code: "CW",
          callingCode: "5999",
        },
        {
          name: t("countries.CX.name"),
          code: "CX",
          callingCode: "61",
        },
        {
          name: t("countries.KY.name"),
          code: "KY",
          callingCode: "1345",
        },
        {
          name: t("countries.CY.name"),
          code: "CY",
          callingCode: "357",
        },
        {
          name: t("countries.CZ.name"),
          code: "CZ",
          callingCode: "420",
        },
        {
          name: t("countries.DE.name"),
          code: "DE",
          callingCode: "49",
        },
        {
          name: t("countries.DJ.name"),
          code: "DJ",
          callingCode: "253",
        },
        {
          name: t("countries.DM.name"),
          code: "DM",
          callingCode: "1767",
        },
        {
          name: t("countries.DK.name"),
          code: "DK",
          callingCode: "45",
        },
        {
          name: t("countries.DO.name"),
          code: "DO",
          callingCode: "1809",
        },
        {
          name: t("countries.DO.name"),
          code: "DO",
          callingCode: "1829",
        },
        {
          name: t("countries.DO.name"),
          code: "DO",
          callingCode: "1849",
        },
        {
          name: t("countries.DZ.name"),
          code: "DZ",
          callingCode: "213",
        },
        {
          name: t("countries.EC.name"),
          code: "EC",
          callingCode: "593",
        },
        {
          name: t("countries.EG.name"),
          code: "EG",
          callingCode: "20",
        },
        {
          name: t("countries.ER.name"),
          code: "ER",
          callingCode: "291",
        },
        {
          name: t("countries.EH.name"),
          code: "EH",
          callingCode: "212",
        },
        {
          name: t("countries.ES.name"),
          code: "ES",
          callingCode: "34",
        },
        {
          name: t("countries.EE.name"),
          code: "EE",
          callingCode: "372",
        },
        {
          name: t("countries.ET.name"),
          code: "ET",
          callingCode: "251",
        },
        {
          name: t("countries.FI.name"),
          code: "FI",
          callingCode: "358",
        },
        {
          name: t("countries.FJ.name"),
          code: "FJ",
          callingCode: "679",
        },
        {
          name: t("countries.FK.name"),
          code: "FK",
          callingCode: "500",
        },
        {
          name: t("countries.FR.name"),
          code: "FR",
          callingCode: "33",
        },
        {
          name: t("countries.FO.name"),
          code: "FO",
          callingCode: "298",
        },
        {
          name: t("countries.FM.name"),
          code: "FM",
          callingCode: "691",
        },
        {
          name: t("countries.GA.name"),
          code: "GA",
          callingCode: "241",
        },
        {
          name: t("countries.GB.name"),
          code: "GB",
          callingCode: "44",
        },
        {
          name: t("countries.GE.name"),
          code: "GE",
          callingCode: "995",
        },
        {
          name: t("countries.GG.name"),
          code: "GG",
          callingCode: "44",
        },
        {
          name: t("countries.GH.name"),
          code: "GH",
          callingCode: "233",
        },
        {
          name: t("countries.GI.name"),
          code: "GI",
          callingCode: "350",
        },
        {
          name: t("countries.GN.name"),
          code: "GN",
          callingCode: "224",
        },
        {
          name: t("countries.GP.name"),
          code: "GP",
          callingCode: "590",
        },
        {
          name: t("countries.GM.name"),
          code: "GM",
          callingCode: "220",
        },
        {
          name: t("countries.GW.name"),
          code: "GW",
          callingCode: "245",
        },
        {
          name: t("countries.GQ.name"),
          code: "GQ",
          callingCode: "240",
        },
        {
          name: t("countries.GR.name"),
          code: "GR",
          callingCode: "30",
        },
        {
          name: t("countries.GD.name"),
          code: "GD",
          callingCode: "1473",
        },
        {
          name: t("countries.GL.name"),
          code: "GL",
          callingCode: "299",
        },
        {
          name: t("countries.GT.name"),
          code: "GT",
          callingCode: "502",
        },
        {
          name: t("countries.GF.name"),
          code: "GF",
          callingCode: "594",
        },
        {
          name: t("countries.GU.name"),
          code: "GU",
          callingCode: "1671",
        },
        {
          name: t("countries.GY.name"),
          code: "GY",
          callingCode: "592",
        },
        {
          name: t("countries.HK.name"),
          code: "HK",
          callingCode: "852",
        },
        {
          name: t("countries.HN.name"),
          code: "HN",
          callingCode: "504",
        },
        {
          name: t("countries.HR.name"),
          code: "HR",
          callingCode: "385",
        },
        {
          name: t("countries.HT.name"),
          code: "HT",
          callingCode: "509",
        },
        {
          name: t("countries.HU.name"),
          code: "HU",
          callingCode: "36",
        },
        {
          name: t("countries.ID.name"),
          code: "ID",
          callingCode: "62",
        },
        {
          name: t("countries.IM.name"),
          code: "IM",
          callingCode: "44",
        },
        {
          name: t("countries.IN.name"),
          code: "IN",
          callingCode: "91",
        },
        {
          name: t("countries.IO.name"),
          code: "IO",
          callingCode: "246",
        },
        {
          name: t("countries.IE.name"),
          code: "IE",
          callingCode: "353",
        },
        {
          name: t("countries.IR.name"),
          code: "IR",
          callingCode: "98",
        },
        {
          name: t("countries.IQ.name"),
          code: "IQ",
          callingCode: "964",
        },
        {
          name: t("countries.IS.name"),
          code: "IS",
          callingCode: "354",
        },
        {
          name: t("countries.IL.name"),
          code: "IL",
          callingCode: "972",
        },
        {
          name: t("countries.IT.name"),
          code: "IT",
          callingCode: "39",
        },
        {
          name: t("countries.JM.name"),
          code: "JM",
          callingCode: "1876",
        },
        {
          name: t("countries.JE.name"),
          code: "JE",
          callingCode: "44",
        },
        {
          name: t("countries.JO.name"),
          code: "JO",
          callingCode: "962",
        },
        {
          name: t("countries.JP.name"),
          code: "JP",
          callingCode: "81",
        },
        {
          name: t("countries.KZ.name"),
          code: "KZ",
          callingCode: "76",
        },
        {
          name: t("countries.KZ.name"),
          code: "KZ",
          callingCode: "77",
        },
        {
          name: t("countries.KE.name"),
          code: "KE",
          callingCode: "254",
        },
        {
          name: t("countries.KG.name"),
          code: "KG",
          callingCode: "996",
        },
        {
          name: t("countries.KH.name"),
          code: "KH",
          callingCode: "855",
        },
        {
          name: t("countries.KI.name"),
          code: "KI",
          callingCode: "686",
        },
        {
          name: t("countries.KN.name"),
          code: "KN",
          callingCode: "1869",
        },
        {
          name: t("countries.KR.name"),
          code: "KR",
          callingCode: "82",
        },
        {
          name: t("countries.XK.name"),
          code: "XK",
          callingCode: "383",
        },
        {
          name: t("countries.KW.name"),
          code: "KW",
          callingCode: "965",
        },
        {
          name: t("countries.LA.name"),
          code: "LA",
          callingCode: "856",
        },
        {
          name: t("countries.LB.name"),
          code: "LB",
          callingCode: "961",
        },
        {
          name: t("countries.LR.name"),
          code: "LR",
          callingCode: "231",
        },
        {
          name: t("countries.LY.name"),
          code: "LY",
          callingCode: "218",
        },
        {
          name: t("countries.LC.name"),
          code: "LC",
          callingCode: "1758",
        },
        {
          name: t("countries.LI.name"),
          code: "LI",
          callingCode: "423",
        },
        {
          name: t("countries.LK.name"),
          code: "LK",
          callingCode: "94",
        },
        {
          name: t("countries.LS.name"),
          code: "LS",
          callingCode: "266",
        },
        {
          name: t("countries.LT.name"),
          code: "LT",
          callingCode: "370",
        },
        {
          name: t("countries.LU.name"),
          code: "LU",
          callingCode: "352",
        },
        {
          name: t("countries.LV.name"),
          code: "LV",
          callingCode: "371",
        },
        {
          name: t("countries.MO.name"),
          code: "MO",
          callingCode: "853",
        },
        {
          name: t("countries.MF.name"),
          code: "MF",
          callingCode: "590",
        },
        {
          name: t("countries.MA.name"),
          code: "MA",
          callingCode: "212",
        },
        {
          name: t("countries.MC.name"),
          code: "MC",
          callingCode: "377",
        },
        {
          name: t("countries.MD.name"),
          code: "MD",
          callingCode: "373",
        },
        {
          name: t("countries.MG.name"),
          code: "MG",
          callingCode: "261",
        },
        {
          name: t("countries.MV.name"),
          code: "MV",
          callingCode: "960",
        },
        {
          name: t("countries.MX.name"),
          code: "MX",
          callingCode: "52",
        },
        {
          name: t("countries.MH.name"),
          code: "MH",
          callingCode: "692",
        },
        {
          name: t("countries.MK.name"),
          code: "MK",
          callingCode: "389",
        },
        {
          name: t("countries.ML.name"),
          code: "ML",
          callingCode: "223",
        },
        {
          name: t("countries.MT.name"),
          code: "MT",
          callingCode: "356",
        },
        {
          name: t("countries.MM.name"),
          code: "MM",
          callingCode: "95",
        },
        {
          name: t("countries.ME.name"),
          code: "ME",
          callingCode: "382",
        },
        {
          name: t("countries.MN.name"),
          code: "MN",
          callingCode: "976",
        },
        {
          name: t("countries.MP.name"),
          code: "MP",
          callingCode: "1670",
        },
        {
          name: t("countries.MZ.name"),
          code: "MZ",
          callingCode: "258",
        },
        {
          name: t("countries.MR.name"),
          code: "MR",
          callingCode: "222",
        },
        {
          name: t("countries.MS.name"),
          code: "MS",
          callingCode: "1664",
        },
        {
          name: t("countries.MQ.name"),
          code: "MQ",
          callingCode: "596",
        },
        {
          name: t("countries.MU.name"),
          code: "MU",
          callingCode: "230",
        },
        {
          name: t("countries.MW.name"),
          code: "MW",
          callingCode: "265",
        },
        {
          name: t("countries.MY.name"),
          code: "MY",
          callingCode: "60",
        },
        {
          name: t("countries.YT.name"),
          code: "YT",
          callingCode: "262",
        },
        {
          name: t("countries.NA.name"),
          code: "NA",
          callingCode: "264",
        },
        {
          name: t("countries.NC.name"),
          code: "NC",
          callingCode: "687",
        },
        {
          name: t("countries.NE.name"),
          code: "NE",
          callingCode: "227",
        },
        {
          name: t("countries.NF.name"),
          code: "NF",
          callingCode: "672",
        },
        {
          name: t("countries.NG.name"),
          code: "NG",
          callingCode: "234",
        },
        {
          name: t("countries.NI.name"),
          code: "NI",
          callingCode: "505",
        },
        {
          name: t("countries.NU.name"),
          code: "NU",
          callingCode: "683",
        },
        {
          name: t("countries.NL.name"),
          code: "NL",
          callingCode: "31",
        },
        {
          name: t("countries.NO.name"),
          code: "NO",
          callingCode: "47",
        },
        {
          name: t("countries.NP.name"),
          code: "NP",
          callingCode: "977",
        },
        {
          name: t("countries.NR.name"),
          code: "NR",
          callingCode: "674",
        },
        {
          name: t("countries.NZ.name"),
          code: "NZ",
          callingCode: "64",
        },
        {
          name: t("countries.OM.name"),
          code: "OM",
          callingCode: "968",
        },
        {
          name: t("countries.PK.name"),
          code: "PK",
          callingCode: "92",
        },
        {
          name: t("countries.PA.name"),
          code: "PA",
          callingCode: "507",
        },
        {
          name: t("countries.PN.name"),
          code: "PN",
          callingCode: "64",
        },
        {
          name: t("countries.PE.name"),
          code: "PE",
          callingCode: "51",
        },
        {
          name: t("countries.PH.name"),
          code: "PH",
          callingCode: "63",
        },
        {
          name: t("countries.PW.name"),
          code: "PW",
          callingCode: "680",
        },
        {
          name: t("countries.PG.name"),
          code: "PG",
          callingCode: "675",
        },
        {
          name: t("countries.PL.name"),
          code: "PL",
          callingCode: "48",
        },
        {
          name: t("countries.PR.name"),
          code: "PR",
          callingCode: "1787",
        },
        {
          name: t("countries.PR.name"),
          code: "PR",
          callingCode: "1939",
        },
        {
          name: t("countries.KP.name"),
          code: "KP",
          callingCode: "850",
        },
        {
          name: t("countries.PT.name"),
          code: "PT",
          callingCode: "351",
        },
        {
          name: t("countries.PY.name"),
          code: "PY",
          callingCode: "595",
        },
        {
          name: t("countries.PS.name"),
          code: "PS",
          callingCode: "970",
        },
        {
          name: t("countries.PF.name"),
          code: "PF",
          callingCode: "689",
        },
        {
          name: t("countries.QA.name"),
          code: "QA",
          callingCode: "974",
        },
        {
          name: t("countries.RE.name"),
          code: "RE",
          callingCode: "262",
        },
        {
          name: t("countries.RO.name"),
          code: "RO",
          callingCode: "40",
        },
        {
          name: t("countries.RU.name"),
          code: "RU",
          callingCode: "7",
        },
        {
          name: t("countries.RW.name"),
          code: "RW",
          callingCode: "250",
        },
        {
          name: t("countries.SA.name"),
          code: "SA",
          callingCode: "966",
        },
        {
          name: t("countries.SD.name"),
          code: "SD",
          callingCode: "249",
        },
        {
          name: t("countries.SN.name"),
          code: "SN",
          callingCode: "221",
        },
        {
          name: t("countries.SG.name"),
          code: "SG",
          callingCode: "65",
        },
        {
          name: t("countries.GS.name"),
          code: "GS",
          callingCode: "500",
        },
        {
          name: t("countries.SJ.name"),
          code: "SJ",
          callingCode: "4779",
        },
        {
          name: t("countries.SB.name"),
          code: "SB",
          callingCode: "677",
        },
        {
          name: t("countries.SL.name"),
          code: "SL",
          callingCode: "232",
        },
        {
          name: t("countries.SV.name"),
          code: "SV",
          callingCode: "503",
        },
        {
          name: t("countries.SM.name"),
          code: "SM",
          callingCode: "378",
        },
        {
          name: t("countries.SO.name"),
          code: "SO",
          callingCode: "252",
        },
        {
          name: t("countries.PM.name"),
          code: "PM",
          callingCode: "508",
        },
        {
          name: t("countries.RS.name"),
          code: "RS",
          callingCode: "381",
        },
        {
          name: t("countries.SS.name"),
          code: "SS",
          callingCode: "211",
        },
        {
          name: t("countries.ST.name"),
          code: "ST",
          callingCode: "239",
        },
        {
          name: t("countries.SR.name"),
          code: "SR",
          callingCode: "597",
        },
        {
          name: t("countries.SK.name"),
          code: "SK",
          callingCode: "421",
        },
        {
          name: t("countries.SI.name"),
          code: "SI",
          callingCode: "386",
        },
        {
          name: t("countries.SE.name"),
          code: "SE",
          callingCode: "46",
        },
        {
          name: t("countries.SZ.name"),
          code: "SZ",
          callingCode: "268",
        },
        {
          name: t("countries.SX.name"),
          code: "SX",
          callingCode: "1721",
        },
        {
          name: t("countries.SC.name"),
          code: "SC",
          callingCode: "248",
        },
        {
          name: t("countries.SY.name"),
          code: "SY",
          callingCode: "963",
        },
        {
          name: t("countries.TC.name"),
          code: "TC",
          callingCode: "1649",
        },
        {
          name: t("countries.TD.name"),
          code: "TD",
          callingCode: "235",
        },
        {
          name: t("countries.TG.name"),
          code: "TG",
          callingCode: "228",
        },
        {
          name: t("countries.TH.name"),
          code: "TH",
          callingCode: "66",
        },
        {
          name: t("countries.TJ.name"),
          code: "TJ",
          callingCode: "992",
        },
        {
          name: t("countries.TK.name"),
          code: "TK",
          callingCode: "690",
        },
        {
          name: t("countries.TM.name"),
          code: "TM",
          callingCode: "993",
        },
        {
          name: t("countries.TL.name"),
          code: "TL",
          callingCode: "670",
        },
        {
          name: t("countries.TO.name"),
          code: "TO",
          callingCode: "676",
        },
        {
          name: t("countries.TT.name"),
          code: "TT",
          callingCode: "1868",
        },
        {
          name: t("countries.TN.name"),
          code: "TN",
          callingCode: "216",
        },
        {
          name: t("countries.TR.name"),
          code: "TR",
          callingCode: "90",
        },
        {
          name: t("countries.TV.name"),
          code: "TV",
          callingCode: "688",
        },
        {
          name: t("countries.TW.name"),
          code: "TW",
          callingCode: "886",
        },
        {
          name: t("countries.TZ.name"),
          code: "TZ",
          callingCode: "255",
        },
        {
          name: t("countries.UG.name"),
          code: "UG",
          callingCode: "256",
        },
        {
          name: t("countries.UA.name"),
          code: "UA",
          callingCode: "380",
        },
        {
          name: t("countries.UY.name"),
          code: "UY",
          callingCode: "598",
        },
        {
          name: t("countries.US.name"),
          code: "US",
          callingCode: "1",
        },
        {
          name: t("countries.UZ.name"),
          code: "UZ",
          callingCode: "998",
        },
        {
          name: t("countries.VA.name"),
          code: "VA",
          callingCode: "3906698",
        },
        {
          name: t("countries.VA.name"),
          code: "VA",
          callingCode: "379",
        },
        {
          name: t("countries.VC.name"),
          code: "VC",
          callingCode: "1784",
        },
        {
          name: t("countries.VE.name"),
          code: "VE",
          callingCode: "58",
        },
        {
          name: t("countries.VG.name"),
          code: "VG",
          callingCode: "1284",
        },
        {
          name: t("countries.VI.name"),
          code: "VI",
          callingCode: "1340",
        },
        {
          name: t("countries.VN.name"),
          code: "VN",
          callingCode: "84",
        },
        {
          name: t("countries.VU.name"),
          code: "VU",
          callingCode: "678",
        },
        {
          name: t("countries.WF.name"),
          code: "WF",
          callingCode: "681",
        },
        {
          name: t("countries.WS.name"),
          code: "WS",
          callingCode: "685",
        },
        {
          name: t("countries.YE.name"),
          code: "YE",
          callingCode: "967",
        },
        {
          name: t("countries.ZA.name"),
          code: "ZA",
          callingCode: "27",
        },
        {
          name: t("countries.ZM.name"),
          code: "ZM",
          callingCode: "260",
        },
        {
          name: t("countries.ZW.name"),
          code: "ZW",
          callingCode: "263",
        },
      ]),
    [i18n.language]
  );

  return {
    countryDialList,
    fetchCountryByCountryCode,
    fetchCountryByCountryName,
    getCountryCodeByAbbreviationOrName,
  };
}
