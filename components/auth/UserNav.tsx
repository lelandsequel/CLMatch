"use client";

import Link from "next/link";
import { useSession } from "./AuthProvider";
import { Button } from "../ui/button";

function truncateEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  if (email.length <= 20) return email;
  return `${name.slice(0, 2)}…@${domain}`;
}

export function UserNav() {
  const { user, loading, isAdmin } = useSession();

  if (loading) {
    return <div className="h-8 w-24 animate-pulse rounded-full bg-slate-200/70 dark:bg-slate-800" />;
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="secondary">Login</Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="rounded-full border border-mist px-3 py-1 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-300">
        {user.email ? truncateEmail(user.email) : "Client"}
      </span>
      <Link href="/dashboard" className="text-slate-600 hover:text-ink dark:text-slate-300">
        Dashboard
      </Link>
      {isAdmin ? (
        <Link href="/admin" className="text-slate-600 hover:text-ink dark:text-slate-300">
          Admin
        </Link>
      ) : null}
      <Link href="/logout">
        <Button variant="ghost">Logout</Button>
      </Link>
    </div>
  );
}
