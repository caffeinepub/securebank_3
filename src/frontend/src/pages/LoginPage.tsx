import { Button } from "@/components/ui/button";
import { Landmark, Lock, Shield, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold shadow-gold mb-4">
            <Landmark className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            AURA <span className="text-gold">FINANCE</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Secure banking at your fingertips
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 shadow-card">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Welcome Back
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Sign in securely with your Internet Identity to access your
            accounts.
          </p>

          <Button
            onClick={login}
            disabled={isLoggingIn || isInitializing}
            data-ocid="login.primary_button"
            className="w-full bg-gold text-primary-foreground hover:bg-gold/90 font-semibold py-3 h-12 text-base shadow-gold transition-all"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-label="Loading"
                >
                  <title>Loading</title>
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Connecting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Sign In Securely
              </span>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Uses Internet Identity for cryptographic authentication
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { icon: Shield, label: "Bank-grade Security" },
            { icon: Lock, label: "Encrypted Data" },
            { icon: TrendingUp, label: "Real-time Updates" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="glass-card rounded-xl p-3 text-center">
              <Icon className="w-5 h-5 text-gold mx-auto mb-1" />
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
