import { postWithExceptions } from "api/apiRequest";

type ResponseType = {
  id: string;
  companyId: string;
  staffId: string;
  userId: string;
  total: number;
  progress: number;
  isCompleted: false;
  isDismissed: false;
  taskType: number;
  updatedAt: string;
  createdAt: string;
  taskStatus: number;
};

export const submitContactListByCampaignId = async function (props: {
  campaignId: string;
  newContactListName: string;
}): Promise<ResponseType> {
  const { campaignId, newContactListName } = props;
  return await postWithExceptions(
    `/CrmHub/GetContactListByCampaignId?campaignId=${campaignId}&newContactListName=${newContactListName}`,
    { param: {} }
  );
};
