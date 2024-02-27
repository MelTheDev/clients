import { Observable } from "rxjs";

export type BillingAccountProfile = {
  hasPremiumPersonally: boolean;
  hasPremiumFromOrganization: boolean;
};

export abstract class BillingAccountProfileStateServiceAbstraction {
  hasPremiumFromOrganization$: Observable<boolean>;
  hasPremiumPersonally$: Observable<boolean>;
  canAccessPremium$: Observable<boolean>;

  abstract setHasPremiumPersonally(value: boolean): Promise<void>;
  abstract setHasPremiumFromOrganization(value: boolean): Promise<void>;
}
