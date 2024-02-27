import { inject } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  CanActivateFn,
} from "@angular/router";
import { firstValueFrom } from "rxjs";

import { BillingAccountProfileStateServiceAbstraction } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service.abstraction";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";

/**
 * CanActivate guard that checks if the user has premium and otherwise triggers the "premiumRequired"
 * message and blocks navigation.
 */
export function hasPremiumGuard(): CanActivateFn {
  return async (_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
    const router = inject(Router);
    const messagingService = inject(MessagingService);
    const billingAccountProfileStateService = inject(BillingAccountProfileStateServiceAbstraction);

    const userHasPremium = await firstValueFrom(
      billingAccountProfileStateService.canAccessPremium$,
    );

    if (!userHasPremium) {
      messagingService.send("premiumRequired");
    }

    // Prevent trapping the user on the login page, since that's an awful UX flow
    if (!userHasPremium && router.url === "/login") {
      return router.createUrlTree(["/"]);
    }

    return userHasPremium;
  };
}
