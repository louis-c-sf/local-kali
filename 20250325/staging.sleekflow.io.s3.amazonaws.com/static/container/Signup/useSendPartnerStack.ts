import axios from "axios";

const PARTNERSTACK_API_KEY = "pk_bvEwuCDvoz9Qh11y48006zWXdCgsvInk";
const PARTNERSTACK_SECRET_KEY = "sk_KnZllhAJOasP09CPsMOOoiUqKAO81nMy";
const pmsInstance = axios.create({
  baseURL: "https://api.partnerstack.com/api/v2",
  headers: {
    "Content-Type": "application/json",
  },
  auth: {
    username: PARTNERSTACK_API_KEY,
    password: PARTNERSTACK_SECRET_KEY,
  },
});
function useSendPartnerStack() {
  async function sendCustomerData({
    email,
    name,
  }: {
    email: string;
    name: string;
  }) {
    await pmsInstance.post(`/customers`, {
      customer_key: email,
      email,
      name,
      partner_key: localStorage.getItem("partnerKey"),
    });
    localStorage.setItem("partnerKey", "");
  }
  return {
    sendCustomerData,
  };
}
export default useSendPartnerStack;
