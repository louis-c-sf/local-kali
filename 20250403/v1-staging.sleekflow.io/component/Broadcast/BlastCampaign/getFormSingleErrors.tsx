import { BlastCampaignFormikType } from "./useBlastCampaignForm";

export function getFormSingleErrors(form: BlastCampaignFormikType) {
  return Object.fromEntries(
    Object.entries(form.errors).map(([fld, err]) => {
      const [firstErr] = [err].flat(2).map(String);
      return [fld, firstErr ?? fld];
    })
  );
}
