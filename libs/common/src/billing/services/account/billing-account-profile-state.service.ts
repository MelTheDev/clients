import { map, Observable } from "rxjs";

import {
  ActiveUserState,
  ActiveUserStateProvider,
  BILLING_ACCOUNT_PROFILE_DISK,
  KeyDefinition,
} from "../../../platform/state";
import {
  BillingAccountProfile,
  BillingAccountProfileStateServiceAbstraction,
} from "../../abstractions/account/billing-account-profile-state.service.abstraction";

export const BILLING_ACCOUNT_PROFILE_KEY_DEFINITION = new KeyDefinition<BillingAccountProfile>(
  BILLING_ACCOUNT_PROFILE_DISK,
  "billingAccountProfile",
  {
    deserializer: (billingAccountProfile) => billingAccountProfile,
  },
);

export class BillingAccountProfileStateService
  implements BillingAccountProfileStateServiceAbstraction
{
  private billingAccountProfileState: ActiveUserState<BillingAccountProfile>;

  hasPremiumFromOrganization$: Observable<boolean>;
  hasPremiumPersonally$: Observable<boolean>;
  canAccessPremium$: Observable<boolean>;

  constructor(activeUserStateProvider: ActiveUserStateProvider) {
    this.billingAccountProfileState = activeUserStateProvider.get(
      BILLING_ACCOUNT_PROFILE_KEY_DEFINITION,
    );

    this.hasPremiumFromOrganization$ = this.billingAccountProfileState.state$.pipe(
      map((billingAccountProfile) => !!billingAccountProfile.hasPremiumFromOrganization),
    );

    this.hasPremiumPersonally$ = this.billingAccountProfileState.state$.pipe(
      map((billingAccountProfile) => !!billingAccountProfile.hasPremiumPersonally),
    );

    this.canAccessPremium$ = this.billingAccountProfileState.state$.pipe(
      map(
        (billingAccountProfile) =>
          billingAccountProfile.hasPremiumFromOrganization ||
          billingAccountProfile.hasPremiumPersonally,
      ),
    );
  }

  setHasPremiumPersonally = async (value: boolean): Promise<void> => {
    await this.billingAccountProfileState.update((billingAccountProfile) => {
      billingAccountProfile ||= {
        hasPremiumFromOrganization: false,
        hasPremiumPersonally: false,
      };
      return { ...billingAccountProfile, hasPremiumPersonally: value };
    });
  };

  setHasPremiumFromOrganization = async (value: boolean): Promise<void> => {
    await this.billingAccountProfileState.update((billingAccountProfile) => {
      billingAccountProfile ||= {
        hasPremiumFromOrganization: false,
        hasPremiumPersonally: false,
      };
      return { ...billingAccountProfile, hasPremiumFromOrganization: value };
    });
  };
}
