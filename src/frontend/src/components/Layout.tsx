import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Landmark, LogOut, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Page = "dashboard" | "accounts" | "transfer" | "history" | "profile";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  userName: string;
  onLogout: () => void;
}

const navLinks: { label: string; page: Page }[] = [
  { label: "Dashboard", page: "dashboard" },
  { label: "Accounts", page: "accounts" },
  { label: "Transfer", page: "transfer" },
  { label: "History", page: "history" },
  { label: "Profile", page: "profile" },
];

export function Layout({
  children,
  currentPage,
  onNavigate,
  userName,
  onLogout,
}: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Nav */}
      <header className="bg-nav border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center shadow-gold">
              <Landmark className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-foreground font-bold text-lg tracking-wide">
              AURA <span className="text-gold">FINANCE</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            data-ocid="main.nav"
          >
            {navLinks.map(({ label, page }) => (
              <button
                key={page}
                type="button"
                data-ocid={`nav.${page}.link`}
                onClick={() => onNavigate(page)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                  currentPage === page
                    ? "text-gold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
                {currentPage === page && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="nav.notifications.button"
            >
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-gold text-primary-foreground border-0">
                2
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("profile")}
              className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity"
              data-ocid="nav.profile.button"
            >
              <Avatar className="w-8 h-8 border border-gold/30">
                <AvatarFallback className="bg-card text-gold text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">
                {userName.split(" ")[0]}
              </span>
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              data-ocid="nav.logout.button"
              className="hidden md:flex border-border text-muted-foreground hover:text-foreground hover:border-gold/50 text-xs"
            >
              <LogOut className="w-3 h-3 mr-1" />
              Log Out
            </Button>

            <button
              type="button"
              className="md:hidden p-2 text-muted-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-ocid="nav.menu.button"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border bg-nav overflow-hidden"
            >
              <div className="px-4 py-3 flex flex-col gap-1">
                {navLinks.map(({ label, page }) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => {
                      onNavigate(page);
                      setMobileOpen(false);
                    }}
                    className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-gold/10 text-gold"
                        : "text-muted-foreground hover:text-foreground hover:bg-card"
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 mt-2 border-t border-border pt-3"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-nav border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gold/20 flex items-center justify-center">
                <Landmark className="w-3 h-3 text-gold" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                AURA FINANCE
              </span>
            </div>
            <div className="flex items-center gap-6">
              {navLinks.map(({ label, page }) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => onNavigate(page)}
                  className="text-xs text-muted-foreground hover:text-gold transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} AURA FINANCE. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
