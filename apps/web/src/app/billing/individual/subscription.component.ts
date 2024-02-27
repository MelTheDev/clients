import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

import { BillingAccountProfileStateServiceAbstraction } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

@Component({
  templateUrl: "subscription.component.html",
})
export class SubscriptionComponent implements OnInit, OnDestroy {
  hasPremium: boolean;
  selfHosted: boolean;

  private componentIsDestroyed$ = new Subject<boolean>();

  constructor(
    private platformUtilsService: PlatformUtilsService,
    private billingAccountProfileStateService: BillingAccountProfileStateServiceAbstraction,
  ) {}

  ngOnInit() {
    this.billingAccountProfileStateService.hasPremiumPersonally$
      .pipe(takeUntil(this.componentIsDestroyed$))
      .subscribe((hasPremiumPersonally: boolean) => {
        this.hasPremium = hasPremiumPersonally;
      });

    this.selfHosted = this.platformUtilsService.isSelfHost();
  }

  ngOnDestroy() {
    this.componentIsDestroyed$.next(true);
    this.componentIsDestroyed$.complete();
  }

  get subscriptionRoute(): string {
    return this.hasPremium ? "user-subscription" : "premium";
  }
}
