import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type PasswordHash = string;
export interface BankAccount {
    balance: bigint;
    owner: Principal;
    accountType: AccountType;
    accountNumber: bigint;
    accountLabel: string;
}
export type Time = bigint;
export interface PublicUserProfile {
    fullName: string;
    email: string;
    phone: string;
}
export type TransferResult = {
    __kind__: "insufficientFunds";
    insufficientFunds: null;
} | {
    __kind__: "success";
    success: [bigint, bigint];
} | {
    __kind__: "accountNotFound";
    accountNotFound: null;
} | {
    __kind__: "unauthorized";
    unauthorized: null;
} | {
    __kind__: "invalidAmount";
    invalidAmount: null;
};
export interface DashboardData {
    recentTransactions: Array<Transaction>;
    accounts: Array<BankAccount>;
}
export interface TransferRequest {
    fromAccount: bigint;
    description: string;
    passwordHash: PasswordHash;
    toAccount: bigint;
    amount: bigint;
}
export interface UserProfile {
    fullName: string;
    email: string;
    address: string;
    phone: string;
}
export interface Transaction {
    transactionType: TransactionType;
    description: string;
    timestamp: Time;
    accountNumber: bigint;
    balanceAfter: bigint;
    amount: bigint;
}
export enum AccountType {
    checking = "checking",
    savings = "savings"
}
export enum TransactionType {
    credit = "credit",
    debit = "debit"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBankAccount(accountType: AccountType, accountLabel: string, initialBalance: bigint): Promise<BankAccount>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardData(): Promise<DashboardData>;
    getPublicUserProfile(user: Principal): Promise<PublicUserProfile | null>;
    getSecureUserProfile(passwordHash: PasswordHash): Promise<UserProfile | null>;
    getTransactionHistory(accountNumber: bigint): Promise<Array<Transaction>>;
    getUserAccounts(user: Principal): Promise<Array<BankAccount>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveSecureUserProfile(profile: UserProfile, passwordHash: PasswordHash): Promise<void>;
    transferFunds(request: TransferRequest): Promise<TransferResult>;
}
