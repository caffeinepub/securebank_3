import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDownLeft, ArrowUpRight, Clock, Plus } from "lucide-react";
import { motion } from "motion/react";
import { AccountType, TransactionType } from "../backend";
import type { UserProfile } from "../backend";
import { useDashboardData } from "../hooks/useQueries";
import { formatCurrency, formatDate, maskAccountNumber } from "../utils/hash";

interface DashboardPageProps {
  profile: UserProfile;
  onNavigate: (page: "accounts" | "transfer" | "history") => void;
}

export function DashboardPage({ profile, onNavigate }: DashboardPageProps) {
  const { data, isLoading } = useDashboardData();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const accounts = data?.accounts ?? [];
  const transactions = data?.recentTransactions ?? [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Hero Greeting */}
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold text-foreground"
        >
          Welcome back,{" "}
          <span className="text-primary">
            {profile.fullName.split(" ")[0]}!
          </span>
        </motion.h1>
        <p className="text-muted-foreground mt-1 text-sm">{today}</p>
      </div>

      {/* Grid: accounts left, transactions right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-4">
          {isLoading ? (
            <>
              <Skeleton className="h-36 rounded-2xl bg-card" />
              <Skeleton className="h-36 rounded-2xl bg-card" />
            </>
          ) : accounts.length === 0 ? (
            <div
              className="glass-card rounded-2xl p-6 text-center"
              data-ocid="dashboard.accounts.empty_state"
            >
              <p className="text-muted-foreground text-sm mb-4">
                No accounts yet
              </p>
              <Button
                onClick={() => onNavigate("accounts")}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="dashboard.create_account.button"
              >
                <Plus className="w-4 h-4 mr-1" /> Create Account
              </Button>
            </div>
          ) : (
            accounts.map((account, i) => (
              <motion.div
                key={account.accountNumber.toString()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="account-card-gradient rounded-2xl p-5 border border-border shadow-card"
                data-ocid={`dashboard.account.item.${i + 1}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {account.accountType === AccountType.checking
                        ? "Checking"
                        : "Savings"}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {account.accountLabel}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-xs text-success">Available</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-xs mb-1">
                  {maskAccountNumber(account.accountNumber)}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(account.balance)}
                </p>
              </motion.div>
            ))
          )}

          <Button
            onClick={() => onNavigate("accounts")}
            variant="outline"
            className="w-full border-border text-muted-foreground hover:border-primary hover:text-primary h-12"
            data-ocid="dashboard.create_account.button"
          >
            <Plus className="w-4 h-4 mr-2" /> Create New Account
          </Button>

          <Button
            onClick={() => onNavigate("transfer")}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 font-semibold shadow-gold"
            data-ocid="dashboard.transfer.button"
          >
            Transfer Funds
          </Button>
        </div>

        {/* Right Column - Recent Transactions */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Transactions
              </h2>
              <button
                type="button"
                onClick={() => onNavigate("history")}
                className="text-primary text-sm hover:text-primary/80 transition-colors flex items-center gap-1"
                data-ocid="dashboard.history.link"
              >
                View All <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {isLoading ? (
              <div
                className="space-y-3"
                data-ocid="dashboard.transactions.loading_state"
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
                  <Skeleton key={i} className="h-12 rounded-lg bg-card" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div
                className="text-center py-12"
                data-ocid="dashboard.transactions.empty_state"
              >
                <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  No transactions yet
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Make a transfer to get started
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground text-xs">
                        Date
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs">
                        Description
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs">
                        Type
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs text-right">
                        Amount
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs text-right">
                        Balance
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 8).map((tx, i) => (
                      <TableRow
                        key={String(tx.timestamp) + String(tx.accountNumber)}
                        className="border-border hover:bg-card/50 transition-colors"
                        data-ocid={`dashboard.tx.item.${i + 1}`}
                      >
                        <TableCell className="text-muted-foreground text-xs">
                          {formatDate(tx.timestamp)}
                        </TableCell>
                        <TableCell className="text-foreground text-sm font-medium">
                          {tx.description}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium ${
                              tx.transactionType === TransactionType.credit
                                ? "text-success"
                                : "text-destructive"
                            }`}
                          >
                            {tx.transactionType === TransactionType.credit ? (
                              <ArrowDownLeft className="w-3 h-3" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3" />
                            )}
                            {tx.transactionType === TransactionType.credit
                              ? "Credit"
                              : "Debit"}
                          </span>
                        </TableCell>
                        <TableCell
                          className={`text-right text-sm font-semibold ${
                            tx.transactionType === TransactionType.credit
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {tx.transactionType === TransactionType.credit
                            ? "+"
                            : "-"}
                          {formatCurrency(tx.amount)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">
                          {formatCurrency(tx.balanceAfter)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
