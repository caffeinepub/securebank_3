import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AccountType } from "../backend";
import { useDashboardData, useTransferFunds } from "../hooks/useQueries";
import { formatCurrency, hashPassword, maskAccountNumber } from "../utils/hash";

interface TransferPageProps {
  onSuccess: () => void;
}

export function TransferPage({ onSuccess }: TransferPageProps) {
  const { data } = useDashboardData();
  const transfer = useTransferFunds();
  const [form, setForm] = useState({
    fromAccount: "",
    toAccount: "",
    amount: "",
    description: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const accounts = data?.accounts ?? [];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fromAccount) e.fromAccount = "Please select an account";
    if (!form.toAccount.trim())
      e.toAccount = "Recipient account number is required";
    if (!form.amount || Number(form.amount) <= 0)
      e.amount = "Enter a valid amount";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.password) e.password = "Password is required to confirm transfer";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    try {
      const passwordHash = await hashPassword(form.password);
      const amountInPaise = BigInt(Math.round(Number(form.amount) * 100));
      const result = await transfer.mutateAsync({
        fromAccount: BigInt(form.fromAccount),
        toAccount: BigInt(form.toAccount),
        amount: amountInPaise,
        description: form.description,
        passwordHash,
      });

      if (result.__kind__ === "success") {
        setSuccess(true);
        toast.success("Transfer completed successfully!");
        setTimeout(() => {
          setSuccess(false);
          onSuccess();
        }, 2000);
      } else if (result.__kind__ === "insufficientFunds") {
        toast.error("Insufficient funds in the selected account");
        setErrors({ amount: "Insufficient funds" });
      } else if (result.__kind__ === "accountNotFound") {
        toast.error("Recipient account not found");
        setErrors({ toAccount: "Account not found" });
      } else if (result.__kind__ === "unauthorized") {
        toast.error("Incorrect password");
        setErrors({ password: "Incorrect password" });
      } else if (result.__kind__ === "invalidAmount") {
        toast.error("Invalid transfer amount");
        setErrors({ amount: "Invalid amount" });
      }
    } catch {
      toast.error("Transfer failed. Please try again.");
    }
  };

  const field = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const selectedAccount = accounts.find(
    (a) => a.accountNumber.toString() === form.fromAccount,
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-xl mx-auto"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Transfer Funds</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Send money securely between accounts
        </p>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card rounded-2xl p-8 text-center mb-6 border border-success/30"
            data-ocid="transfer.success_state"
          >
            <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              Transfer Successful!
            </h2>
            <p className="text-muted-foreground text-sm">
              Redirecting to dashboard...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={handleSubmit}
        className="glass-card rounded-2xl p-8 shadow-card space-y-5"
      >
        {/* From Account */}
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5">
            From Account
          </Label>
          <Select
            value={form.fromAccount}
            onValueChange={(v) => field("fromAccount", v)}
          >
            <SelectTrigger
              className="bg-input border-border text-foreground h-12"
              data-ocid="transfer.from_account.select"
            >
              <SelectValue placeholder="Select source account" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {accounts.length === 0 ? (
                <SelectItem
                  value="none"
                  disabled
                  className="text-muted-foreground"
                >
                  No accounts available
                </SelectItem>
              ) : (
                accounts.map((acc) => (
                  <SelectItem
                    key={acc.accountNumber.toString()}
                    value={acc.accountNumber.toString()}
                    className="text-foreground hover:bg-card"
                  >
                    <span className="flex items-center gap-2">
                      {acc.accountLabel} — {formatCurrency(acc.balance)}
                    </span>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {selectedAccount && (
            <p className="text-xs text-muted-foreground mt-1">
              Available:{" "}
              <span className="text-success font-medium">
                {formatCurrency(selectedAccount.balance)}
              </span>
              {" · "}
              {maskAccountNumber(selectedAccount.accountNumber)}
            </p>
          )}
          {errors.fromAccount && (
            <p
              className="text-destructive text-xs mt-1"
              data-ocid="transfer.from_account.error"
            >
              {errors.fromAccount}
            </p>
          )}
        </div>

        {/* To Account */}
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5">
            To Account Number
          </Label>
          <Input
            data-ocid="transfer.to_account.input"
            value={form.toAccount}
            onChange={(e) => field("toAccount", e.target.value)}
            placeholder="Enter recipient account number"
            className="bg-input border-border text-foreground placeholder:text-muted-foreground h-12"
          />
          {errors.toAccount && (
            <p
              className="text-destructive text-xs mt-1"
              data-ocid="transfer.to_account.error"
            >
              {errors.toAccount}
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5">
            Amount (₹)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-base">
              ₹
            </span>
            <Input
              data-ocid="transfer.amount.input"
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => field("amount", e.target.value)}
              placeholder="0.00"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground h-12 pl-8"
            />
          </div>
          {errors.amount && (
            <p
              className="text-destructive text-xs mt-1 flex items-center gap-1"
              data-ocid="transfer.amount.error"
            >
              <AlertCircle className="w-3 h-3" /> {errors.amount}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5">
            Description
          </Label>
          <Textarea
            data-ocid="transfer.description.textarea"
            value={form.description}
            onChange={(e) => field("description", e.target.value)}
            placeholder="What's this transfer for?"
            className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
            rows={2}
          />
          {errors.description && (
            <p
              className="text-destructive text-xs mt-1"
              data-ocid="transfer.description.error"
            >
              {errors.description}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="border-t border-border pt-4">
          <Label className="text-muted-foreground text-sm mb-1.5">
            Confirm with Password
          </Label>
          <Input
            data-ocid="transfer.password.input"
            type="password"
            value={form.password}
            onChange={(e) => field("password", e.target.value)}
            placeholder="Enter your banking password"
            className="bg-input border-border text-foreground placeholder:text-muted-foreground h-12"
          />
          {errors.password && (
            <p
              className="text-destructive text-xs mt-1 flex items-center gap-1"
              data-ocid="transfer.password.error"
            >
              <AlertCircle className="w-3 h-3" /> {errors.password}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={transfer.isPending || success}
          data-ocid="transfer.submit_button"
          className="w-full bg-gold text-primary-foreground hover:bg-gold/90 font-semibold h-12 text-base shadow-gold"
        >
          {transfer.isPending ? (
            "Processing Transfer..."
          ) : (
            <span className="flex items-center justify-center gap-2">
              Continue Transfer <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
