"use client";

import type { User } from "@/lib/schema/types";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  Grid3X3,
  Info,
  LogOut,
  Menu,
  Monitor,
  Moon,
  PanelLeftClose,
  Search,
  Sun,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  getApiErrorMessage,
  getUserData,
  logoutUser,
} from "@/lib/api/client";
import { ReactNode, useEffect, useRef, useState } from "react";

const mainLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Hosted zones", href: "/hosted-zones" },
  { label: "Health checks", href: "/health-checks" },
  { label: "Profiles", href: "/profiles" },
];

const sidebarGroups = [
  {
    title: "Global Resolver",
    items: [
      { label: "Global resolvers", href: "/global-resolvers", new: true },
      { label: "Shared DNS views", href: "/shared-dns-views", new: true },
    ],
  },
  {
    title: "VPC Resolver",
    items: [
      { label: "VPCs", href: "/vpcs" },
      { label: "Inbound endpoints", href: "/inbound-endpoints" },
      { label: "Outbound endpoints", href: "/outbound-endpoints" },
      { label: "Rules", href: "/rules" },
      { label: "Query logging", href: "/query-logging" },
      { label: "Outposts", href: "/outposts" },
    ],
  },
  {
    title: "Domains",
    items: [
      { label: "Registered domains", href: "/registered-domains" },
      { label: "Requests", href: "/requests" },
    ],
  },
  {
    title: "IP-based routing",
    items: [
      { label: "CIDR collections", href: "/cidr-collections" },
    ],
  },
  {
    title: "Traffic flow",
    items: [
      { label: "Traffic policies", href: "/traffic-policies" },
      { label: "Policy records", href: "/policy-records" },
    ],
  },
];

export function ConsoleHeader({
  theme,
  onThemeChange,
}: {
  theme: "dark" | "light";
  onThemeChange: (theme: "dark" | "light") => void;
}) {
  const [accountOpen, setAccountOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [accountError, setAccountError] = useState("");
  const router = useRouter();
  const accountTriggerRef = useRef<HTMLButtonElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const storedUser = window.sessionStorage.getItem("route53-user");
      if (storedUser) {
        setUser(JSON.parse(storedUser) as User);
      }
    } catch {
      window.sessionStorage.removeItem("route53-user");
    }

    getUserData()
      .then((currentUser) => {
        setUser(currentUser);
        window.sessionStorage.setItem("route53-user", JSON.stringify(currentUser));
      })
      .catch(() => undefined)
      .finally(() => setUserLoaded(true));
  }, []);

  useEffect(() => {
    if (!accountOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        !accountTriggerRef.current?.contains(target) &&
        !accountMenuRef.current?.contains(target)
      ) {
        setAccountOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAccountOpen(false);
        accountTriggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountOpen]);

  async function signOut() {
    setSigningOut(true);
    setAccountError("");

    try {
      await logoutUser();
      router.replace("/login");
    } catch (reason) {
      setAccountError(getApiErrorMessage(reason, "Unable to sign out."));
      setSigningOut(false);
    }
  }

  return (
    <header className="console-header">
      <img src="/aws.svg" alt="AWS" className="aws-header-logo" />

      <span className="header-divider" />


      <img
        src="/amazon-q.svg"
        alt="Amazon Q"
        className="amazon-q-logo"
      />

      <Grid3X3 size={20} />

      <div className="global-search">
        <Search size={17} />
        <span>Search</span>
        <kbd>[Alt+S] Ask Amazon Q</kbd>
      </div>

      <div className="header-actions">
        <Terminal size={18} />
        <Bell size={18} />
        <CircleHelp size={18} />

        <span className="header-divider" />

        <button
          ref={accountTriggerRef}
          className="account account-trigger"
          onClick={() => setAccountOpen(!accountOpen)}
          aria-expanded={accountOpen}
          aria-haspopup="menu"
          aria-label="Open account menu"
        >
          <strong>{user ? user.username : userLoaded ? "Account" : "Loading..."}</strong>
          <small>{user ? user.email : userLoaded ? "Unable to load account" : "Loading account..."}</small>
        </button>

        <ChevronDown size={14} />
      </div>
      {accountOpen && (
        <div ref={accountMenuRef} className="account-menu" role="menu">
          <div className="account-menu-heading">
            <strong>{user ? user.username : userLoaded ? "Account" : "Loading..."}</strong>
            <ExternalLink size={18} />
          </div>
          <div className="account-plan">
            <strong>Pay as you go</strong>
          </div>
          {accountError && <p className="account-menu-error" role="alert">{accountError}</p>}
          <button className="account-menu-item">Switch project <ExternalLink size={18} /></button>
          <button className="account-menu-item">Projects <ExternalLink size={18} /></button>
          <button className="account-menu-item">Team <ExternalLink size={18} /></button>
          <button className="account-menu-item">Billing <ExternalLink size={18} /></button>
          <button
            className="account-menu-item"
            onClick={() => {
              setAccountOpen(false);
              router.push("/profiles");
            }}
          >
            Profile <ExternalLink size={18} />
          </button>
          <button className="account-menu-item account-menu-chevron">Language <ChevronRight size={22} /></button>
          <div className="visual-mode">
            <span>Visual mode</span>
            <Monitor size={19} />
            <button
              type="button"
              className={theme === "light" ? "mode-button selected-mode" : "mode-button"}
              onClick={() => onThemeChange("light")}
              aria-label="Use light theme"
            >
              <Sun size={20} />
            </button>
            <button
              type="button"
              className={theme === "dark" ? "mode-button selected-mode" : "mode-button"}
              onClick={() => onThemeChange("dark")}
              aria-label="Use dark theme"
            >
              <Moon size={21} />
            </button>
          </div>
          <button
            className="account-menu-item sign-out"
            onClick={() => void signOut()}
            disabled={signingOut}
          >
            {signingOut ? "Signing out..." : `Sign out of ${user ? user.username : "account"}`}
            <LogOut size={19} />
          </button>
        </div>
      )}
    </header>
  );
}

function SidebarGroup({
  title,
  items,
}: {
  title: string;
  items: {
    label: string;
    href: string;
    new?: boolean;
  }[];
}) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();

  return (
    <section className="sidebar-group">
      <button
        className="sidebar-group-title"
        onClick={() => setOpen(!open)}
      >
        <ChevronDown
          size={14}
          className={open ? "" : "rotate-closed"}
        />
        {title}
      </button>

      {open &&
        items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              pathname === item.href
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            {item.label}

            {item.new && <em>New</em>}
          </Link>
        ))}
    </section>
  );
}

export function ConsoleSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  if (collapsed) {
    return null;
  }

  const pathname = usePathname();

  return (
    <aside className="console-sidebar">
      <div className="sidebar-title">
        <span>Route 53</span>

        <button
          onClick={onToggle}
          aria-label="Collapse navigation"
        >
          <PanelLeftClose size={20} />
        </button>
      </div>

      <nav>
        {mainLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              pathname === link.href
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            {link.label}
          </Link>
        ))}

        {sidebarGroups.map((group) => (
          <SidebarGroup
            key={group.title}
            title={group.title}
            items={group.items}
          />
        ))}

        <button className="sidebar-external">
          DNS Firewall
          <ExternalLink size={13} />
        </button>

        <button className="sidebar-external">
          Application Recovery Controller
          <ExternalLink size={13} />
        </button>
      </nav>
    </aside>
  );
}

function getPageName(pathname: string) {
  if (pathname === "/dashboard") {
    return "Dashboard";
  }

  const page = pathname.split("/")[1];

  if (!page) {
    return "Dashboard";
  }

  return page
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ConsoleLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  return (
    <div className="console-shell" data-theme={theme}>
      <ConsoleHeader theme={theme} onThemeChange={setTheme} />

      <div className="console-crumbbar">
        <button
          className={collapsed ? "menu-button active" : "menu-button"}
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle navigation"
          aria-pressed={collapsed}
        >
          <Menu size={22} />
        </button>

        <span className="crumb-link">Route 53</span>

        <ChevronRight size={16} />

        <span>{getPageName(pathname)}</span>

        <Info size={17} className="crumb-info" />
      </div>

      <div className="console-body">
        <ConsoleSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(true)}
        />

        <main className={collapsed ? "console-main sidebar-collapsed" : "console-main"}>
          {children}
        </main>
      </div>
    </div>
  );
}