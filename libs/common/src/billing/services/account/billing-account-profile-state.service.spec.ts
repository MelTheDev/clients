import { firstValueFrom } from "rxjs";

import {
  FakeAccountService,
  FakeActiveUserStateProvider,
  mockAccountServiceWith,
} from "../../../../spec";
import { FakeActiveUserState } from "../../../../spec/fake-state";
import { UserId } from "../../../types/guid";
import { BillingAccountProfile } from "../../abstractions/account/billing-account-profile-state.service.abstraction";

import {
  BILLING_ACCOUNT_PROFILE_KEY_DEFINITION,
  BillingAccountProfileStateService,
} from "./billing-account-profile-state.service";

describe("BillingAccountProfileStateService", () => {
  let activeUserStateProvider: FakeActiveUserStateProvider;
  let sut: BillingAccountProfileStateService;
  let billingAccountProfileState: FakeActiveUserState<BillingAccountProfile>;
  let accountService: FakeAccountService;

  const userId = "fakeUserId" as UserId;

  beforeEach(() => {
    accountService = mockAccountServiceWith(userId);
    activeUserStateProvider = new FakeActiveUserStateProvider(accountService);

    sut = new BillingAccountProfileStateService(activeUserStateProvider);

    billingAccountProfileState = activeUserStateProvider.getFake(
      BILLING_ACCOUNT_PROFILE_KEY_DEFINITION,
    );
  });

  afterEach(() => {
    return jest.resetAllMocks();
  });

  describe("hasPremiumFromOrganization$", () => {
    it("should emit changes in hasPremiumFromOrganization", async () => {
      billingAccountProfileState.nextState({
        hasPremiumPersonally: false,
        hasPremiumFromOrganization: true,
      });

      expect(await firstValueFrom(sut.hasPremiumFromOrganization$)).toBe(true);
    });

    describe("hasPremiumPersonally$", () => {
      it("should emit changes in hasPremiumPersonally", async () => {
        billingAccountProfileState.nextState({
          hasPremiumPersonally: true,
          hasPremiumFromOrganization: false,
        });

        expect(await firstValueFrom(sut.hasPremiumPersonally$)).toBe(true);
      });
    });

    describe("canAccessPremium$", () => {
      it("should emit changes in hasPremiumPersonally", async () => {
        billingAccountProfileState.nextState({
          hasPremiumPersonally: true,
          hasPremiumFromOrganization: false,
        });

        expect(await firstValueFrom(sut.canAccessPremium$)).toBe(true);
      });

      it("should emit changes in hasPremiumFromOrganization", async () => {
        billingAccountProfileState.nextState({
          hasPremiumPersonally: false,
          hasPremiumFromOrganization: true,
        });

        expect(await firstValueFrom(sut.canAccessPremium$)).toBe(true);
      });

      it("should emit changes in both hasPremiumPersonally and hasPremiumFromOrganization", async () => {
        billingAccountProfileState.nextState({
          hasPremiumPersonally: true,
          hasPremiumFromOrganization: true,
        });

        expect(await firstValueFrom(sut.canAccessPremium$)).toBe(true);
      });
    });

    describe("setHasPremiumPersonally", () => {
      it("should have `hasPremiumPersonally$` emit `true` when passing `true` as an argument", async () => {
        await sut.setHasPremiumPersonally(true);

        expect(await firstValueFrom(sut.hasPremiumPersonally$)).toBe(true);
      });

      it("should have `hasPremiumPersonally$` emit `false` when passing `false` as an argument", async () => {
        await sut.setHasPremiumPersonally(false);

        expect(await firstValueFrom(sut.hasPremiumPersonally$)).toBe(false);
      });

      it("should have `canAccessPremium$` emit `true` when passing `true` as an argument", async () => {
        await sut.setHasPremiumPersonally(true);

        expect(await firstValueFrom(sut.canAccessPremium$)).toBe(true);
      });

      it("should have `canAccessPremium$` emit `false` when passing `false` as an argument", async () => {
        await sut.setHasPremiumPersonally(false);

        expect(await firstValueFrom(sut.canAccessPremium$)).toBe(false);
      });
    });

    describe("setHasPremiumFromOrganization", () => {
      it("should have `setHasPremiumFromOrganization$` emit `true` when passing `true` as an argument", async () => {
        await sut.setHasPremiumFromOrganization(true);

        expect(await firstValueFrom(sut.hasPremiumFromOrganization$)).toBe(true);
      });

      it("should have `setHasPremiumFromOrganization$` emit `false` when passing `false` as an argument", async () => {
        await sut.setHasPremiumFromOrganization(false);

        expect(await firstValueFrom(sut.hasPremiumFromOrganization$)).toBe(false);
      });

      it("should have `canAccessPremium$` emit `true` when passing `true` as an argument", async () => {
        await sut.setHasPremiumFromOrganization(true);

        expect(await firstValueFrom(sut.canAccessPremium$)).toBe(true);
      });

      it("should have `canAccessPremium$` emit `false` when passing `false` as an argument", async () => {
        await sut.setHasPremiumFromOrganization(false);

        expect(await firstValueFrom(sut.canAccessPremium$)).toBe(false);
      });
    });
  });
});
