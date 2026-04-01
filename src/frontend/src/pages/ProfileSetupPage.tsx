import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Landmark,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveInitialProfile } from "../hooks/useQueries";
import { hashPassword } from "../utils/hash";

export function ProfileSetupPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const saveProfile = useSaveInitialProfile();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
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
      await saveProfile.mutateAsync({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: `${form.address}||hash:${passwordHash}`,
      });
      toast.success("Profile created successfully!");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const field = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold shadow-gold mb-4">
            <Landmark className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Complete Your Profile
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Set up your banking profile to get started
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-8 shadow-card space-y-5"
        >
          <div className="grid grid-cols-1 gap-5">
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Full Name
              </Label>
              <Input
                data-ocid="setup.fullName.input"
                value={form.fullName}
                onChange={(e) => field("fullName", e.target.value)}
                placeholder="John Doe"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-gold"
              />
              {errors.fullName && (
                <p
                  className="text-destructive text-xs mt-1"
                  data-ocid="setup.fullName.error"
                >
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </Label>
              <Input
                data-ocid="setup.email.input"
                type="email"
                value={form.email}
                onChange={(e) => field("email", e.target.value)}
                placeholder="john@example.com"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-gold"
              />
              {errors.email && (
                <p
                  className="text-destructive text-xs mt-1"
                  data-ocid="setup.email.error"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> Phone Number
              </Label>
              <Input
                data-ocid="setup.phone.input"
                value={form.phone}
                onChange={(e) => field("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-gold"
              />
              {errors.phone && (
                <p
                  className="text-destructive text-xs mt-1"
                  data-ocid="setup.phone.error"
                >
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Address
              </Label>
              <Input
                data-ocid="setup.address.input"
                value={form.address}
                onChange={(e) => field("address", e.target.value)}
                placeholder="123 Main St, City, State"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-gold"
              />
              {errors.address && (
                <p
                  className="text-destructive text-xs mt-1"
                  data-ocid="setup.address.error"
                >
                  {errors.address}
                </p>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <Label className="text-muted-foreground text-sm mb-1.5 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Password
              </Label>
              <Input
                data-ocid="setup.password.input"
                type="password"
                value={form.password}
                onChange={(e) => field("password", e.target.value)}
                placeholder="Minimum 6 characters"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-gold"
              />
              {errors.password && (
                <p
                  className="text-destructive text-xs mt-1"
                  data-ocid="setup.password.error"
                >
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Confirm Password
              </Label>
              <Input
                data-ocid="setup.confirmPassword.input"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => field("confirmPassword", e.target.value)}
                placeholder="Re-enter password"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-gold"
              />
              {errors.confirmPassword && (
                <p
                  className="text-destructive text-xs mt-1"
                  data-ocid="setup.confirmPassword.error"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={saveProfile.isPending}
            data-ocid="setup.submit_button"
            className="w-full bg-gold text-primary-foreground hover:bg-gold/90 font-semibold h-12 text-base shadow-gold mt-2"
          >
            {saveProfile.isPending ? (
              "Setting up..."
            ) : (
              <span className="flex items-center gap-2">
                Complete Setup <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
