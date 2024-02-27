import { Directive, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

import { BillingAccountProfileStateServiceAbstraction } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service.abstraction";

/**
 * Hides the element if the user has premium.
 */
@Directive({
  selector: "[appNotPremium]",
})
export class NotPremiumDirective implements OnInit, OnDestroy {
  private directiveIsDestroyed$ = new Subject<boolean>();

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private billingAccountProfileStateService: BillingAccountProfileStateServiceAbstraction,
  ) {}

  async ngOnInit(): Promise<void> {
    this.billingAccountProfileStateService.canAccessPremium$
      .pipe(takeUntil(this.directiveIsDestroyed$))
      .subscribe((premium: boolean) => {
        if (premium) {
          this.viewContainer.clear();
        } else {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      });
  }

  async ngOnDestroy() {
    this.directiveIsDestroyed$.next(true);
    this.directiveIsDestroyed$.complete();
  }
}
