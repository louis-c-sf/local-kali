import React from "react";
import { Checkbox } from "semantic-ui-react";
import styles from "./InboxManagement.module.css";
import { useCompanyPolicies } from "./CompanyPoliciesContext";

type InboxSettingsPolicies =
  | "view_conversations:view_default_channels_messages_only"
  | "assign_conversations:remain_collaborator_when_reassigned"
  | "send_message:become_collaborator_when_reply"
  | "view_conversations:unassigned_conversations_notifications";

export interface RbacCheckboxGroupProps {
  policy: InboxSettingsPolicies;
  disabled?: boolean;
}

export const RbacCheckboxGroup = ({
  policy,
  disabled,
}: RbacCheckboxGroupProps) => {
  const {
    toggledRoles,
    toggleRole,
    data: rolesWithPolicies,
  } = useCompanyPolicies();

  return (
    <div className={styles.checkboxGroup}>
      {rolesWithPolicies?.map((r) => (
        <Checkbox
          key={`${r.role_id}-${policy}`}
          label={r.role_name}
          disabled={disabled}
          checked={
            toggledRoles.has(`${policy}|${r.role_id}`)
              ? !r.permissionSet.has(policy)
              : r.permissionSet.has(policy)
          }
          onChange={() => toggleRole(r.role_id, policy)}
        />
      ))}
    </div>
  );
};
