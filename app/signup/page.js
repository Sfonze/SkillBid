import Link from "next/link";
import { BuildingIcon, GraduationIcon } from "@/components/Icon";

export default function SignupPicker() {
  return (
    <div className="auth-shell">
      <div className="auth-card wide">
        <div className="auth-head"><h1>Join SkillBid</h1><p>Which side of the marketplace are you on?</p></div>
        <div className="field-row">
          <Link href="/signup/company" className="card card-pad" style={{ cursor: "pointer", display: "block", textDecoration: "none" }}>
            <div className="trust-icon"><BuildingIcon /></div>
            <h3 style={{ fontSize: "18px", margin: "12px 0 6px" }}>I&apos;m a company</h3>
            <p className="text-soft text-sm">Post short-term tasks and get them done by verified students.</p>
            <div className="btn btn-stamp btn-sm mt-16">Sign up as a company →</div>
          </Link>
          <Link href="/signup/student" className="card card-pad" style={{ cursor: "pointer", display: "block", textDecoration: "none" }}>
            <div className="trust-icon"><GraduationIcon /></div>
            <h3 style={{ fontSize: "18px", margin: "12px 0 6px" }}>I&apos;m a student</h3>
            <p className="text-soft text-sm">Apply to real tasks from real companies, properly employed via Adecco.</p>
            <div className="btn btn-sage btn-sm mt-16">Sign up as a student →</div>
          </Link>
        </div>
        <div className="auth-switch">Already have an account? <Link href="/login" style={{ fontWeight: 600, textDecoration: "underline" }}>Log in</Link></div>
      </div>
    </div>
  );
}
