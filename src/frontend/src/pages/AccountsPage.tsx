import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Copy, CreditCard, PiggyBank, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AccountType } from "../backend";
import { useCreateAccount, useDashboardData } from "../hooks/useQueries";
import { formatCurrency } from "../utils/hash";

export function AccountsPage() {
  const { data, isLoading } = useDashboardData();
  const createAccount = useCreateAccount();
  const [open, setOpen] = useState(false);
  const [newAccType, setNewAccType] = useState<AccountType>(
    AccountType.checking,
  );
  const [newAccLabel, setNewAccLabel] = useState("");
  const [initialAmount, setInitialAmount] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const accounts = data?.accounts ?? [];

  const handleCreate = async () => {
    if (!newAccLabel.trim()) {
      toast.error("Please enter an account label");
      return;
    }
    const parsedAmount = Number.parseFloat(initialAmount);
    if (initialAmount && (Number.isNaN(parsedAmount) || parsedAmount < 0)) {
      toast.error("Please enter a valid initial balance");
      return;
    }
    try {
      // Convert rupees to paise (smallest unit, like cents)
      const initialBalance = initialAmount
        ? BigInt(Math.round(parsedAmount * 100))
        : 0n;
      await createAccount.mutateAsync({
        accountType: newAccType,
        label: newAccLabel.trim(),
        initialBalance,
      });
      toast.success("Account created successfully!");
      setOpen(false);
      setNewAccLabel("");
      setInitialAmount("");
      setNewAccType(AccountType.checking);
    } catch {
      toast.error("Failed to create account");
    }
  };

  const copyAccountNumber = (num: bigint) => {
    navigator.clipboard.writeText(num.toString());
    setCopied(num.toString());
    toast.success("Account number copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Accounts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your bank accounts
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold"
              data-ocid="accounts.create_account.open_modal_button"
            >
              <Plus className="w-4 h-4 mr-2" /> New Account
            </Button>
          </DialogTrigger>
          <DialogContent
            className="bg-popover border-border text-foreground max-w-md"
            data-ocid="accounts.create_account.dialog"
          >
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Create New Account
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-muted-foreground text-sm mb-1.5">
                  Account Type
                </Label>
                <Select
                  value={newAccType}
                  onValueChange={(v) => setNewAccType(v as AccountType)}
                >
                  <SelectTrigger
                    className="bg-input border-border text-foreground"
                    data-ocid="accounts.account_type.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem
                      value={AccountType.checking}
                      className="text-foreground hover:bg-card"
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary" /> Checking
                        Account
                      </div>
                    </SelectItem>
                    <SelectItem
                      value={AccountType.savings}
                      className="text-foreground hover:bg-card"
                    >
                      <div className="flex items-center gap-2">
                        <PiggyBank className="w-4 h-4 text-primary" /> Savings
                        Account
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm mb-1.5">
                  Account Label
                </Label>
                <Input
                  data-ocid="accounts.account_label.input"
                  value={newAccLabel}
                  onChange={(e) => setNewAccLabel(e.target.value)}
                  placeholder="e.g. Personal Savings, Emergency Fund"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-sm mb-1.5">
                  Opening Balance (₹)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-base">
                    ₹
                  </span>
                  <Input
                    data-ocid="accounts.initial_balance.input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground pl-8"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the amount you want to deposit when opening this
                  account.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-border text-muted-foreground"
                  onClick={() => setOpen(false)}
                  data-ocid="accounts.create_account.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleCreate}
                  disabled={createAccount.isPending}
                  data-ocid="accounts.create_account.confirm_button"
                >
                  {createAccount.isPending ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          data-ocid="accounts.list.loading_state"
        >
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl bg-card" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div
          className="glass-card rounded-2xl p-12 text-center"
          data-ocid="accounts.list.empty_state"
        >
          <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Accounts Yet
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            Create your first bank account to start managing your finances
          </p>
          <Button
            onClick={() => setOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold"
            data-ocid="accounts.create_first.button"
          >
            <Plus className="w-4 h-4 mr-2" /> Create First Account
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {accounts.map((account, i) => (
            <motion.div
              key={account.accountNumber.toString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="account-card-gradient rounded-2xl p-6 border border-border shadow-card"
              data-ocid={`accounts.account.item.${i + 1}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    {account.accountType === AccountType.checking ? (
                      <CreditCard className="w-5 h-5 text-primary" />
                    ) : (
                      <PiggyBank className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {account.accountType === AccountType.checking
                        ? "Checking"
                        : "Savings"}
                    </p>
                    <p className="font-semibold text-foreground">
                      {account.accountLabel}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-xs text-success">Active</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Current Balance
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(account.balance)}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-card/50 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Account Number
                  </p>
                  <p className="text-sm font-mono text-foreground">
                    {account.accountNumber.toString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyAccountNumber(account.accountNumber)}
                  className="p-2 text-muted-foreground hover:text-primary transition-colors"
                  data-ocid={`accounts.copy.button.${i + 1}`}
                >
                  {copied === account.accountNumber.toString() ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
