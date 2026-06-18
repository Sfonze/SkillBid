import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ marginBottom: "12px" }}>
              <span className="brand-mark">SB</span> SkillBid
            </div>
            <p className="text-soft text-sm" style={{ maxWidth: "260px", lineHeight: 1.6 }}>
              A student-founded marketplace connecting verified university students with short-term work from real companies. Built in Maastricht.
            </p>
          </div>
          <div>
            <div className="footer-col-title">Platform</div>
            <Link className="footer-link" href="/tasks">Browse tasks</Link>
            <Link className="footer-link" href="/pricing">Pricing</Link>
            <Link className="footer-link" href="/signup">Sign up</Link>
            <Link className="footer-link" href="/login">Log in</Link>
            <Link className="footer-link" href="/about">About us</Link>
          </div>
          <div>
            <div className="footer-col-title">Help</div>
            <Link className="footer-link" href="/faq">FAQ</Link>
            <Link className="footer-link" href="/contact">Contact</Link>
            <Link className="footer-link" href="/legal?tab=terms">Terms of service</Link>
            <Link className="footer-link" href="/legal?tab=privacy">Privacy policy</Link>
            <Link className="footer-link" href="/legal?tab=cookies">Cookie policy</Link>
          </div>
          <div>
            <div className="footer-col-title">Contact</div>
            <a className="footer-link" href="mailto:s.fonze@skillbid.com">s.fonze@skillbid.com</a>
            <a className="footer-link" href="mailto:oscar.sole@skillbid.com">oscar.sole@skillbid.com</a>
            <span className="footer-link text-faint">Maastricht, Netherlands</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} SkillBid B.V., KvK Maastricht</span>
          <span>Employment for completed task assignments is provided via Adecco as Employer of Record.</span>
        </div>
      </div>
    </footer>
  );
}
