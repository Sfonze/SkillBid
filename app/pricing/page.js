import Link from "next/link";
import { BoltIcon, CrownIcon } from "@/components/Icon";

const PLANS = [
  {
    name: "Starter",
    price: "€0",
    period: "/month",
    badge: { text: "Available now", tone: "live" },
    featured: false,
    features: [
      "Basic task posting and browsing",
      "Access to the full student talent pool",
      "Pay-per-task commission only (15%)",
    ],
    cta: { text: "Get started", href: "/signup", disabled: false },
  },
  {
    name: "Growth",
    price: "TBA",
    period: "",
    badge: { text: "Coming soon", tone: "soon" },
    featured: true,
    features: [
      "Everything in Starter",
      "Fast-matching with top students",
      "Improved visibility for your tasks",
    ],
    cta: { text: "Notify me", href: "#", disabled: true },
  },
  {
    name: "Pro",
    price: "TBA",
    period: "",
    badge: { text: "Coming soon", tone: "soon" },
    featured: false,
    features: [
      "Everything in Growth",
      "Enhanced matching algorithm",
      "Maximum visibility",
      "Priority support",
    ],
    cta: { text: "Notify me", href: "#", disabled: true },
  },
];

export default function Pricing() {
  return (
    <div className="section">
      <div className="container">
        <div className="section-head" style={{ margin: "0 auto 48px", textAlign: "center", maxWidth: "640px" }}>
          <div className="eyebrow">Pricing</div>
          <h1 style={{ fontSize: "clamp(28px,3.6vw,42px)", marginTop: "10px" }}>Simple now, more to come</h1>
          <p className="section-sub">No subscription to post or browse tasks today. As SkillBid grows, paid tiers will add faster matching and more visibility for companies posting frequently.</p>
        </div>

        <div className="pricing-grid">
          {PLANS.map((plan) => (
            <div key={plan.name} className={"pricing-card" + (plan.featured ? " featured" : "")}>
              {plan.featured && <div className="pricing-most-popular">Most Popular</div>}
              <div className="flex-between" style={{ marginBottom: "20px" }}>
                <div className="pricing-icon">{plan.name === "Pro" ? <CrownIcon size={18} /> : <BoltIcon size={18} />}</div>
                <span className={"badge " + (plan.badge.tone === "live" ? "badge-sage" : "badge-amber")}>
                  <span className="badge-dot"></span>{plan.badge.text}
                </span>
              </div>
              <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>{plan.name}</h3>
              <div className="pricing-price">{plan.price}<span className="pricing-period">{plan.period}</span></div>
              <ul className="pricing-features">
                {plan.features.map((f) => (
                  <li key={f}><span className="pricing-check">✓</span>{f}</li>
                ))}
              </ul>
              {plan.cta.disabled ? (
                <button className="btn btn-ghost btn-block" disabled>{plan.cta.text}</button>
              ) : (
                <Link className="btn btn-stamp btn-block" href={plan.cta.href}>{plan.cta.text}</Link>
              )}
            </div>
          ))}
        </div>

        <p className="text-faint text-sm" style={{ textAlign: "center", marginTop: "32px" }}>
          Questions about pricing? Check the <Link href="/faq" style={{ textDecoration: "underline" }}>FAQ</Link> or <Link href="/contact" style={{ textDecoration: "underline" }}>contact us</Link>.
        </p>
      </div>
    </div>
  );
}
