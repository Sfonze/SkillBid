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
          <Link className={"nav-link" + (isActive("/talent") ? " active" : "")} href="/talent">Find Talent</Link>
          <Link className={"nav-link" + (isActive("/about") ? " active" : "")} href="/about">About us</Link>
          <Link className={"nav-link" + (isActive("/pricing") ? " active" : "")} href="/pricing">Pricing</Link>
          <Link className={"nav-link" + (isActive("/faq") ? " active" : "")} href="/faq">FAQ</Link>
          <Link className={"nav-link" + (isActive("/contact") ? " active" : "")} href="/contact">Contact</Link>
        </div>
        <div className="nav-actions">
          {user && <NotificationBell />}
          {!user && (
            <>
              <Link className="btn btn-ghost btn-sm hidden-mobile nav-ghost-btn" href="/login">Log in</Link>
              <Link className="btn btn-stamp btn-sm" href="/signup">Sign up</Link>
            </>
          )}
          {user && (
            <>
              {user.role === "STUDENT" && (
                <Link className="text-sm hidden-mobile mono nav-username" href={`/students/${user.id}`}>{user.name}</Link>
              )}
              {user.role === "SME" && (
                <Link className="text-sm hidden-mobile mono nav-username" href={`/companies/${user.id}`}>{user.name}</Link>
              )}
              <button className="btn btn-ghost btn-sm nav-ghost-btn" onClick={handleLogout}>Log out</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
