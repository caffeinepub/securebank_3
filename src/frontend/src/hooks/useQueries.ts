import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TransferRequest, UserProfile } from "../backend";
import type { AccountType } from "../backend";
import { useActor } from "./useActor";

export function useDashboardData() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboardData"],
    queryFn: async () => {
      if (!actor) return { accounts: [], recentTransactions: [] };
      return actor.getDashboardData();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTransactionHistory(accountNumber: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["txHistory", accountNumber?.toString()],
    queryFn: async () => {
      if (!actor || accountNumber === null) return [];
      return actor.getTransactionHistory(accountNumber);
    },
    enabled: !!actor && !isFetching && accountNumber !== null,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      profile,
      passwordHash,
    }: {
      profile: UserProfile;
      passwordHash: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.saveSecureUserProfile(profile, passwordHash);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useSaveInitialProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useCreateAccount() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      accountType,
      label,
      initialBalance,
    }: {
      accountType: AccountType;
      label: string;
      initialBalance: bigint;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createBankAccount(accountType, label, initialBalance);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboardData"] });
    },
  });
}

export function useTransferFunds() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (request: TransferRequest) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.transferFunds(request);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboardData"] });
      qc.invalidateQueries({ queryKey: ["txHistory"] });
    },
  });
}
