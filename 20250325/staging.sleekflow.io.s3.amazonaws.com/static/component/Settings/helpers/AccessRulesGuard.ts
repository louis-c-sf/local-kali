import CompanyType, { SleekflowCompanyType } from "../../../types/CompanyType";
import { UsageType, UserType } from "../../../types/LoginType";
import moment from "moment";
import { both, complement, path } from "ramda";
import { matchesStaff, TeamType } from "../../../types/TeamType";
import {
  isEnterprisePlan,
  isFreemiumPlan,
  isFreeOrFreemiumPlan,
  isFreePlan,
  isPremiumPlan,
  isProPlan,
  isStandardPlan,
  PlanType,
} from "../../../types/PlanSelectionType";
import { MainMenuItemType } from "../../Header/Menu/localizable/useMainMenus";
import { StaffType } from "../../../types/StaffType";
import { ExcludedAddOn } from "../SettingPlanSubscription/SettingPlan/SettingPlan";
import { User } from "@auth0/auth0-react";
import { LOCATION_STORAGE_KEY } from "component/Header/PostLogin";

export const isSuperAdministrator = (staff: StaffType) => {
  return staff.userInfo.id === process.env.REACT_APP_ADMIN_ID;
};

function matchesUserId(userId: string) {
  return (staff: StaffType) => staff.userInfo.id === userId;
}

export function isAdminRole(user: StaffType) {
  return ["admin", "demoadmin"].includes(user.roleType.toLowerCase());
}

export function isTeamAdminRole(user: StaffType) {
  return user.roleType.toLowerCase() === "teamadmin";
}

export function isStaffRole(user: StaffType) {
  return user.roleType.toLowerCase() === "staff";
}

export function isOwner(staffList: StaffType[], user: UserType) {
  if (staffList.length > 0) {
    return staffList[0].userInfo.id === user.id;
  }
  return true;
}

export class AccessRulesGuard {
  constructor(
    private readonly userId: string,
    private readonly loggedInUserDetail: StaffType | undefined,
    private readonly companyStaff: StaffType[],
    private readonly company: CompanyType | undefined,
    private readonly currentPlan: PlanType,
    private readonly usage: UsageType | undefined,
    private readonly auth0User: User | undefined
  ) {}

  isOpenBookMeetingBanner() {
    if (this.isResellerClient()) {
      return false;
    }
    if (!this.company || !this.loggedInUserDetail) {
      return false;
    }
    if (this.company.billRecords.length === 0) {
      return false;
    }
    if (this.company.billRecords.length === 1) {
      const [currentPlan] = this.company.billRecords;
      return (
        (isFreemiumPlan(currentPlan.subscriptionPlan) ||
          isFreePlan(currentPlan.subscriptionPlan)) &&
        moment(currentPlan.periodStart).add(7, "days").isAfter(moment())
      );
    }
    if (this.company.billRecords.length > 0) {
      return !(
        this.company.billRecords.filter(
          (b) =>
            b.subscriptionPlan &&
            (isPremiumPlan(b.subscriptionPlan) ||
              isStandardPlan(b.subscriptionPlan) ||
              isProPlan(b.subscriptionPlan) ||
              isEnterprisePlan(b.subscriptionPlan))
        ).length > 0
      );
    }
    return false;
  }

  isSocialLoginUser() {
    return (
      this.auth0User?.["https://app.sleekflow.io/connection_strategy"] !==
      "auth0"
    );
  }

  isBalanceActive() {
    let isBalanceActive = false;
    if (this.company) {
      const now = moment.utc();

      isBalanceActive =
        this.company.billRecords
          .filter(ExcludedAddOn)
          .some(
            (billRecord) =>
              moment(billRecord.periodStart).diff(now) <= 0 &&
              moment(billRecord.periodEnd).diff(now) >= 0 &&
              !/free/i.test(billRecord.subscriptionPlan.id.toLowerCase())
          ) || isFreemiumPlan(this.company.billRecords[0].subscriptionPlan);
    }
    return isBalanceActive;
  }

  private companyHasOtherAdmins(staffId: string) {
    if (!this.loggedInUserDetail) {
      return false;
    }
    return this.companyStaff.some(
      both(complement(matchesUserId(staffId)), isAdminRole)
    );
  }

  isPaid() {
    if (!this.company) {
      return false;
    }
    if (this.company.billRecords.length === 0) {
      return false;
    }
    const [currentPlan] = this.company.billRecords.filter(ExcludedAddOn);
    if (
      isFreemiumPlan(currentPlan.subscriptionPlan) ||
      isFreePlan(currentPlan.subscriptionPlan)
    ) {
      return false;
    } else {
      return true;
    }
  }

  isShopifyNeedToPay() {
    if (!this.company) {
      return false;
    }
    if (this.company.isGlobalPricingFeatureEnabled) {
      return false;
    }
    const currentPurchasedShopifyRecords = this.company.billRecords.filter(
      (b) =>
        b.subscriptionPlan.id.includes("shopify_integration") &&
        moment().isSameOrBefore(moment(b.periodEnd))
    );
    const currentShopifyStore = this.company.shopifyConfigs?.length ?? 0;
    if (currentPurchasedShopifyRecords.length === 0) {
      return true;
    }
    if (currentShopifyStore > currentPurchasedShopifyRecords.length) {
      return true;
    }
    return false;
  }

  canDeleteUser() {
    if (this.isSuperAdmin()) {
      return true;
    }
    if (this.isAdmin() || this.isTeamAdmin()) {
      return true;
    }
    return false;
  }

  canEditUser() {
    if (this.isSuperAdmin()) {
      return true;
    }
    if (this.isAdmin() || this.isTeamAdmin()) {
      return true;
    }
    return false;
  }

  canSeeOnlyOwnTeamConversation() {
    return (
      this.loggedInUserDetail !== undefined &&
      isTeamAdminRole(this.loggedInUserDetail)
    );
  }

  canEditRole(staffId: string, fromRole: string, toRole: string): boolean {
    if (this.isSuperAdmin()) {
      return true;
    }
    if (!this.company) {
      return false;
    }
    if (this.company.billRecords.length === 0) {
      return false;
    }
    const [currentPlan] = this.company.billRecords.filter(ExcludedAddOn);
    if (toRole.toLowerCase() === "teamadmin") {
      const subscriptionPlan = currentPlan.subscriptionPlan;
      return !(
        isFreemiumPlan(subscriptionPlan) ||
        isProPlan(subscriptionPlan) ||
        isFreePlan(subscriptionPlan)
      );
    }
    switch (fromRole.toLowerCase()) {
      case "admin":
        if (toRole.toLowerCase() !== "admin") {
          return this.isAdmin() && this.companyHasOtherAdmins(staffId);
        }
        return this.isAdmin();
      case "teamadmin":
        return this.isBalanceActive() || this.isAdmin();
      case "staff":
        return this.isAdmin();
      default:
        return false;
    }
  }

  canAssignAnyRole() {
    return this.isAdmin() || this.isSuperAdmin();
  }

  canSeeOtherAssigneesConversation() {
    return (
      this.isAdmin() ||
      (this.loggedInUserDetail !== undefined &&
        isTeamAdminRole(this.loggedInUserDetail))
    );
  }

  canAccessPlanAndSubscription() {
    return this.isAdmin() && !this.isResellerClient();
  }

  isSuperAdmin() {
    return Boolean(
      this.loggedInUserDetail && isSuperAdministrator(this.loggedInUserDetail)
    );
  }

  isTeamAdmin(): boolean {
    return this.loggedInUserDetail
      ? isTeamAdminRole(this.loggedInUserDetail)
      : false;
  }

  isAdmin(): boolean {
    return this.loggedInUserDetail
      ? isAdminRole(this.loggedInUserDetail)
      : false;
  }

  isStaff(): boolean {
    return this.loggedInUserDetail
      ? isStaffRole(this.loggedInUserDetail)
      : false;
  }

  canEditCompanyName(): boolean {
    return this.isAdmin() || this.isSuperAdmin();
  }

  canEditCompanyTimeZone(): boolean {
    return this.isAdmin() || this.isSuperAdmin();
  }

  canEditAnyTeam() {
    return this.isAdmin() || this.isSuperAdmin();
  }

  canEditTheTeam(team: TeamType) {
    return (
      this.loggedInUserDetail !== undefined &&
      (this.canEditAnyTeam() ||
        (isTeamAdminRole(this.loggedInUserDetail) &&
          team.teamAdmins.some(matchesStaff(this.loggedInUserDetail))))
    );
  }

  canUnassignConversation() {
    return true;
  }

  canInviteNewUsers() {
    return this.isAdmin() || this.isSuperAdmin();
  }

  canAccessSettings() {
    return (
      this.isAdmin() ||
      this.isSuperAdmin() ||
      (this.loggedInUserDetail !== undefined &&
        isTeamAdminRole(this.loggedInUserDetail))
    );
  }

  canExportContacts() {
    return (
      this.loggedInUserDetail !== undefined &&
      (isAdminRole(this.loggedInUserDetail) ||
        isSuperAdministrator(this.loggedInUserDetail))
    );
  }

  canUseOfficialWhatsapp() {
    return (
      (this.company?.whatsAppConfigs &&
        this.company.whatsAppConfigs.length > 0) ||
      (this.company?.whatsappCloudApiConfigs &&
        this.company.whatsappCloudApiConfigs.length > 0) ||
      (this.company?.whatsApp360DialogConfigs &&
        this.company.whatsApp360DialogConfigs.length > 0)
    );
  }

  isResellerClient() {
    const userCompanyType = this.company?.companyType;
    const isResellerClient =
      userCompanyType === SleekflowCompanyType.ResellerClient ||
      userCompanyType === SleekflowCompanyType.Reseller;
    return isResellerClient;
  }

  canShowOptIn() {
    return (
      (this.company?.whatsAppConfigs &&
        this.company.whatsAppConfigs.length > 0) ||
      (this.company?.whatsApp360DialogConfigs &&
        this.company.whatsApp360DialogConfigs.length > 0) ||
      (this.company?.whatsappCloudApiConfigs &&
        this.company.whatsappCloudApiConfigs.length > 0)
    );
  }

  isTwilioAccount() {
    return this.company
      ? this.company?.whatsAppConfigs && this.company.whatsAppConfigs.length > 0
      : false;
  }

  isTwilioSubaccount() {
    return this.company
      ? this.company?.whatsAppConfigs?.some(
          (whatsAppConfig) => whatsAppConfig.isSubaccount === true
        )
      : false;
  }

  is360DialogAccount() {
    return this.company
      ? this.company.whatsApp360DialogConfigs &&
          this.company.whatsApp360DialogConfigs.length > 0
      : false;
  }

  isCloudAPIAccount() {
    return this.company
      ? this.company.whatsappCloudApiConfigs &&
          this.company.whatsappCloudApiConfigs.length > 0
      : false;
  }

  is360DialogDirectPayment() {
    return this.company
      ? this.company.whatsApp360DialogUsageRecords?.length === 0
      : false;
  }

  isCloudAPIUsageRecordExist() {
    return Boolean(this.company?.whatsappCloudApiUsageRecords?.length);
  }

  isMenuAccessAllowed(
    menuItems: MainMenuItemType[],
    pathName: string,
    isRbacEnabled?: boolean
  ) {
    const startPaths = menuItems.map((m) => m.path ?? "");
    if (pathName.includes("/guide/migrate-phone-number")) {
      return true;
    }
    if (pathName.includes("/guide/get-started")) {
      return !this.isResellerClient();
    }
    if (
      pathName.includes("/setup-company") ||
      pathName.includes("/schedule-demo-success") ||
      pathName.includes("/consultation-payment-success") ||
      pathName.includes("/sync-shopify/") ||
      pathName.includes("/shopify-upgrade-plan") ||
      pathName.includes("/shopify/signin") ||
      pathName.includes("/plan_selection") ||
      pathName.includes("/channels/official/whatsapp/cloudapi") ||
      pathName.includes("/guide/whatsapp-comparison") ||
      pathName.includes("/onboarding/contact-first")
    ) {
      return true;
    }

    if (pathName.includes("/reset/password")) {
      return !this.isSocialLoginUser();
    }

    if (pathName.includes("/subscriptions/add-ons/additional-staff")) {
      if (isFreeOrFreemiumPlan(this.currentPlan)) {
        return false;
      } else {
        return true;
      }
    }

    if (pathName.includes("/subscriptions/add-ons/additional-contacts")) {
      if (
        isFreeOrFreemiumPlan(this.currentPlan) ||
        this.company?.addonStatus?.isUnlimitedContactEnabled
      ) {
        return false;
      } else {
        return true;
      }
    }
    if (pathName.includes("/onboarding-flow")) {
      return true;
    }
    if (pathName.includes("/settings")) {
      if (pathName.includes("/settings/paymentlink")) {
        return Boolean(this.company?.isStripePaymentEnabled);
      }
      if (
        pathName.includes("/settings/generalinfo") ||
        pathName.includes(`/settings/usermanagement/${this.userId}`)
      ) {
        return true;
      } else {
        if (isRbacEnabled) {
          return true;
        }
        if (pathName.includes("/settings/templates")) {
          return this.canUseOfficialWhatsapp();
        }
        if (pathName.includes("/settings/plansubscription")) {
          return this.canAccessPlanAndSubscription();
        }
        if (pathName.includes("/settings/topup")) {
          return (
            (this.isTwilioSubaccount() ||
              this.is360DialogAccount() ||
              this.isCloudAPIAccount()) &&
            this.canAccessSettings()
          );
        }
        if (pathName.includes("/settings/salesforce")) {
          return this.isSuperAdmin() || this.isAdmin();
        }
        return this.canAccessSettings();
      }
    }

    if (
      (pathName.includes("/onboarding") &&
        !pathName.includes("/onboarding/shopify")) ||
      pathName.includes("/guide")
    ) {
      if (
        pathName.includes("/onboarding/salesforce") ||
        pathName.includes("/onboarding/hubspot") ||
        pathName.includes("/onboarding/stripe") ||
        pathName.includes("/onboarding/whatsappCatalog")
      ) {
        if (pathName.includes("/onboarding/salesforce")) {
          return window.open(
            `https://${process.env.REACT_APP_V2_PATH}/integrations/salesforce/setup`,
            "_blank",
            "noopener noreferrer"
          );
        }
        return this.isSuperAdmin() || this.isAdmin();
      }
      if (
        (this.usage &&
          this.usage?.maximumNumberOfChannel >
            this.usage?.currentNumberOfChannels) ||
        !this.usage
      ) {
        return true;
      }
    }
    if (pathName.includes("/onboarding/shopify")) {
      return true;
    }
    if (
      pathName.includes("/profile/") ||
      pathName.includes("/request-whatsapp") ||
      pathName.includes("/troubleshoot-chatapi")
    ) {
      return true;
    }
    if (pathName.includes("/free-trial/")) {
      return true;
    }
    return startPaths.some((s) => pathName.startsWith(s));
  }

  canEditWhatsappTemplates() {
    return this.isSuperAdmin() || this.isAdmin();
  }

  canView2faSettings() {
    return !isFreeOrFreemiumPlan(this.currentPlan);
  }
  canEdit2faSettings() {
    return this.isSuperAdmin() || this.isAdmin();
  }
  canGenerateResetPasswordLink() {
    return this.isSuperAdmin() || this.isAdmin();
  }
}
