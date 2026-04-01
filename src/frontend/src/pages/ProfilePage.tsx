import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Edit2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveProfile, useUserProfile } from "../hooks/useQueries";
import { hashPassword } from "../utils/hash";

export function ProfilePage() {
  const { data: profile, isLoading } = useUserProfile();
  const saveProfile = useSaveProfile();

  const [editing, setEditing] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const initials =
    profile?.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  const handleUnlock = async () => {
    if (!verifyPassword) {
      toast.error("Please enter your password");
      return;
    }
    setShowSensitive(true);
    if (profile) {
      setForm({
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        address: profile.address.split("||hash:")[0],
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Name required";
    if (!form.email.trim()) e.email = "Email required";
    if (form.newPassword && form.newPassword.length < 6)
      e.newPassword = "Min 6 characters";
    if (form.newPassword !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});

    try {
      const currentHash = await hashPassword(verifyPassword);
      const newHash = form.newPassword
        ? await hashPassword(form.newPassword)
        : currentHash;
      const addressWithHash = `${form.address}||hash:${newHash}`;
      await saveProfile.mutateAsync({
        profile: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          address: addressWithHash,
        },
        passwordHash: currentHash,
      });
      toast.success("Profile updated successfully!");
      setEditing(false);
      setShowSensitive(false);
      setVerifyPassword("");
    } catch {
      toast.error("Failed to update profile. Wrong password?");
    }
  };

  if (isLoading) {
    return (
      <div
        className="max-w-xl mx-auto space-y-4"
        data-ocid="profile.loading_state"
      >
        <Skeleton className="h-32 rounded-2xl bg-card" />
        <Skeleton className="h-64 rounded-2xl bg-card" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className="max-w-xl mx-auto text-center py-16"
        data-ocid="profile.error_state"
      >
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your personal information
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="glass-card rounded-2xl p-6 shadow-card flex items-center gap-5">
        <Avatar className="w-16 h-16 border-2 border-gold/30">
          <AvatarFallback className="bg-card text-gold text-xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {profile.fullName}
          </h2>
          <p className="text-muted-foreground text-sm">{profile.email}</p>
        </div>
      </div>

      {/* Sensitive Info Unlock */}
      {!showSensitive ? (
        <div className="glass-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Protected Information
              </h3>
              <p className="text-xs text-muted-foreground">
                Enter your password to view & edit
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <Input
              type="password"
              value={verifyPassword}
              onChange={(e) => setVerifyPassword(e.target.value)}
              placeholder="Enter your banking password"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              data-ocid="profile.verify_password.input"
            />
            <Button
              onClick={handleUnlock}
              className="w-full bg-gold text-primary-foreground hover:bg-gold/90 shadow-gold"
              data-ocid="profile.unlock.button"
            >
              <Eye className="w-4 h-4 mr-2" /> Unlock Profile
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="glass-card rounded-2xl p-6 shadow-card"
          data-ocid="profile.details.panel"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-foreground">Personal Details</h3>
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(false)}
                    className="border-border text-muted-foreground h-8"
                    data-ocid="profile.cancel.button"
                  >
                    <X className="w-3 h-3 mr-1" /> Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saveProfile.isPending}
                    className="bg-gold text-primary-foreground hover:bg-gold/90 h-8"
                    data-ocid="profile.save.button"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    {saveProfile.isPending ? "Saving..." : "Save"}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(true)}
                  className="border-border text-muted-foreground hover:border-gold hover:text-gold h-8"
                  data-ocid="profile.edit.button"
                >
                  <Edit2 className="w-3 h-3 mr-1" /> Edit
                </Button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowSensitive(false);
                  setEditing(false);
                  setVerifyPassword("");
                }}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                data-ocid="profile.lock.button"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                key: "fullName" as const,
                label: "Full Name",
                icon: User,
                placeholder: "Your full name",
              },
              {
                key: "email" as const,
                label: "Email",
                icon: Mail,
                placeholder: "your@email.com",
              },
              {
                key: "phone" as const,
                label: "Phone",
                icon: Phone,
                placeholder: "+1 (555) 000-0000",
              },
              {
                key: "address" as const,
                label: "Address",
                icon: MapPin,
                placeholder: "123 Main St",
              },
            ].map(({ key, label, icon: Icon, placeholder }) => (
              <div key={key}>
                <Label className="text-muted-foreground text-xs mb-1.5 flex items-center gap-1.5">
                  <Icon className="w-3 h-3" /> {label}
                </Label>
                {editing ? (
                  <Input
                    value={form[key]}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [key]: e.target.value }))
                    }
                    placeholder={placeholder}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                    data-ocid={`profile.${key}.input`}
                  />
                ) : (
                  <p className="text-foreground text-sm font-medium bg-card/50 px-3 py-2 rounded-lg">
                    {key === "address"
                      ? form.address || profile.address.split("||hash:")[0]
                      : form[key] || profile[key]}
                  </p>
                )}
                {errors[key] && (
                  <p
                    className="text-destructive text-xs mt-1"
                    data-ocid={`profile.${key}.error`}
                  >
                    {errors[key]}
                  </p>
                )}
              </div>
            ))}

            {editing && (
              <div className="border-t border-border pt-4 space-y-4">
                <p className="text-xs text-muted-foreground">
                  Leave blank to keep current password
                </p>
                <div>
                  <Label className="text-muted-foreground text-xs mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> New Password
                  </Label>
                  <Input
                    type="password"
                    value={form.newPassword}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, newPassword: e.target.value }))
                    }
                    placeholder="New password (min 6 chars)"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                    data-ocid="profile.new_password.input"
                  />
                  {errors.newPassword && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.newPassword}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> Confirm New Password
                  </Label>
                  <Input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                    data-ocid="profile.confirm_password.input"
                  />
                  {errors.confirmPassword && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
