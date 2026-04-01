import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { TransactionType } from "../backend";
import { useDashboardData, useTransactionHistory } from "../hooks/useQueries";
import { formatCurrency, formatDate } from "../utils/hash";

const PAGE_SIZE = 10;

export function HistoryPage() {
  const { data: dashData } = useDashboardData();
  const accounts = dashData?.accounts ?? [];
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [page, setPage] = useState(1);

  const accountNum = selectedAccount ? BigInt(selectedAccount) : null;
  const { data: transactions, isLoading } = useTransactionHistory(accountNum);

  const txList = transactions ?? [];
  const totalPages = Math.max(1, Math.ceil(txList.length / PAGE_SIZE));
  const paginated = txList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Transaction History
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Full transaction log for your accounts
          </p>
        </div>

        <Select
          value={selectedAccount}
          onValueChange={(v) => {
            setSelectedAccount(v);
            setPage(1);
          }}
        >
          <SelectTrigger
            className="w-64 bg-input border-border text-foreground"
            data-ocid="history.account.select"
          >
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {accounts.map((acc) => (
              <SelectItem
                key={acc.accountNumber.toString()}
                value={acc.accountNumber.toString()}
                className="text-foreground hover:bg-card"
              >
                {acc.accountLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card rounded-2xl p-6 shadow-card">
        {!selectedAccount ? (
          <div
            className="text-center py-16"
            data-ocid="history.no_account.empty_state"
          >
            <ArrowDownLeft className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Select an account to view its transaction history
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-3" data-ocid="history.table.loading_state">
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
              <Skeleton key={i} className="h-12 rounded-lg bg-card" />
            ))}
          </div>
        ) : txList.length === 0 ? (
          <div
            className="text-center py-16"
            data-ocid="history.table.empty_state"
          >
            <p className="text-muted-foreground">
              No transactions found for this account
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table data-ocid="history.table">
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
                      Balance After
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((tx, i) => (
                    <TableRow
                      key={String(tx.timestamp) + String(tx.accountNumber)}
                      className="border-border hover:bg-card/50 transition-colors"
                      data-ocid={`history.tx.item.${i + 1}`}
                    >
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
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
                        className={`text-right font-semibold text-sm ${
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5 border-t border-border pt-5">
                <p className="text-xs text-muted-foreground">
                  Showing {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, txList.length)} of {txList.length}{" "}
                  transactions
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border-border text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                    data-ocid="history.pagination_prev"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="border-border text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                    data-ocid="history.pagination_next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
