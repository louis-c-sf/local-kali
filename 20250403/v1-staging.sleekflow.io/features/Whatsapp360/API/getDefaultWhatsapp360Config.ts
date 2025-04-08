import CompanyType from "../../../types/CompanyType";

export function getDefaultWhatsapp360Config(company: CompanyType) {
  const configs = company?.whatsApp360DialogConfigs ?? [];
  const [defaultConfig] = configs;
  return defaultConfig;
}
