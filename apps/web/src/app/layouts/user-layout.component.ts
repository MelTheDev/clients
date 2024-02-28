import { CommonModule } from "@angular/common";
import { Component, NgZone, OnDestroy, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { firstValueFrom } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { BillingAccountProfileStateServiceAbstraction } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service.abstraction";
import { BroadcasterService } from "@bitwarden/common/platform/abstractions/broadcaster.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";
import { IconModule, LayoutComponent, NavigationModule } from "@bitwarden/components";

import { PaymentMethodBannersComponent } from "../components/payment-method-banners/payment-method-banners.component";

import { PasswordManagerLogo } from "./password-manager-logo";

const BroadcasterSubscriptionId = "UserLayoutComponent";

@Component({
  selector: "app-user-layout",
  templateUrl: "user-layout.component.html",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    JslibModule,
    LayoutComponent,
    IconModule,
    NavigationModule,
    PaymentMethodBannersComponent,
  ],
})
export class UserLayoutComponent implements OnInit, OnDestroy {
  protected readonly logo = PasswordManagerLogo;
  hasFamilySponsorshipAvailable: boolean;
  hideSubscription: boolean;

  constructor(
    private broadcasterService: BroadcasterService,
    private ngZone: NgZone,
    private platformUtilsService: PlatformUtilsService,
    private organizationService: OrganizationService,
    private apiService: ApiService,
    private syncService: SyncService,
    private billingAccountProfileStateService: BillingAccountProfileStateServiceAbstraction,
  ) {}

  async ngOnInit() {
    document.body.classList.remove("layout_frontend");

    this.broadcasterService.subscribe(BroadcasterSubscriptionId, async (message: any) => {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.ngZone.run(async () => {
        switch (message.command) {
          case "purchasedPremium":
            await this.load();
            break;
          default:
        }
      });
    });

    await this.syncService.fullSync(false);
    await this.load();
  }

  ngOnDestroy() {
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
  }

  async load() {
    const hasPremiumPersonally = await firstValueFrom(
      this.billingAccountProfileStateService.hasPremiumPersonally$,
    );
    const hasPremiumFromOrg = await firstValueFrom(
      this.billingAccountProfileStateService.hasPremiumFromOrganization$,
    );
    const selfHosted = this.platformUtilsService.isSelfHost();

    this.hasFamilySponsorshipAvailable = await this.organizationService.canManageSponsorships();
    let billing = null;
    if (!selfHosted) {
      // TODO: We should remove the need to call this!
      billing = await this.apiService.getUserBillingHistory();
    }
    this.hideSubscription =
      !hasPremiumPersonally && hasPremiumFromOrg && (selfHosted || billing?.hasNoHistory);
  }
}
