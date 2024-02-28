import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

import { BillingAccountProfileStateServiceAbstraction } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service.abstraction";

import { reports, ReportType } from "../reports";
import { ReportEntry, ReportVariant } from "../shared";

@Component({
  selector: "app-reports-home",
  templateUrl: "reports-home.component.html",
})
export class ReportsHomeComponent implements OnInit, OnDestroy {
  private componentIsDestroyed$ = new Subject<boolean>();
  reports: ReportEntry[];

  constructor(
    private billingAccountProfileStateService: BillingAccountProfileStateServiceAbstraction,
  ) {}

  async ngOnInit(): Promise<void> {
    this.billingAccountProfileStateService.canAccessPremium$
      .pipe(takeUntil(this.componentIsDestroyed$))
      .subscribe((userHasPremium: boolean) => {
        const reportRequiresPremium = userHasPremium
          ? ReportVariant.Enabled
          : ReportVariant.RequiresPremium;

        this.reports = [
          {
            ...reports[ReportType.ExposedPasswords],
            variant: reportRequiresPremium,
          },
          {
            ...reports[ReportType.ReusedPasswords],
            variant: reportRequiresPremium,
          },
          {
            ...reports[ReportType.WeakPasswords],
            variant: reportRequiresPremium,
          },
          {
            ...reports[ReportType.UnsecuredWebsites],
            variant: reportRequiresPremium,
          },
          {
            ...reports[ReportType.Inactive2fa],
            variant: reportRequiresPremium,
          },
          {
            ...reports[ReportType.DataBreach],
            variant: ReportVariant.Enabled,
          },
        ];
      });
  }

  ngOnDestroy(): void {
    this.componentIsDestroyed$.next(true);
    this.componentIsDestroyed$.complete();
  }
}
