"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./Providers";
import NotificationBell from "./NotificationBell";

export default function Nav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  const isActive = (p) => pathname === p;

  return (
    <div className="nav">
      <div className="container nav-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">SB</span> SkillBid
        </Link>
        <div className="nav-links">
          {!user && (
            <>
              <Link className={"nav-link" + (isActive("/tasks") ? " active" : "")} href="/tasks">Browse tasks</Link>
              <Link className="nav-link" href="/#how-it-works">How it works</Link>
              <Link className={"nav-link" + (isActive("/about") ? " active" : "")} href="/about">About us</Link>
            </>
          )}
          {user?.role === "STUDENT" && (
            <>
              <Link className={"nav-link" + (isActive("/tasks") ? " active" : "")} href="/tasks">Browse tasks</Link>
              <Link className={"nav-link" + (isActive("/basket") ? " active" : "")} href="/basket">My applications</Link>
              <Link className={"nav-link" + (isActive("/student/dashboard") ? " active" : "")} href="/student/dashboard">My tasks</Link>
            </>
          )}
          {user?.role === "SME" && (
            <>
              <Link className={"nav-link" + (isActive("/company/dashboard") ? " active" : "")} href="/company/dashboard">Dashboard</Link>
              <Link className={"nav-link" + (isActive("/company/post-task") ? " active" : "")} href="/company/post-task">Post a task</Link>
            </>
          )}
        </div>
        <div className="nav-actions">
          {user && <NotificationBell />}
          {!user && (
            <>
              <Link className="btn btn-ghost btn-sm hidden-mobile" href="/login">Log in</Link>
              <Link className="btn btn-stamp btn-sm" href="/signup">Sign up</Link>
            </>
          )}
          {user && (
            <>
              <span className="text-sm text-soft hidden-mobile mono">{user.name}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Log out</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
