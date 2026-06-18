import { MailIcon } from "@/components/Icon";

export default function Contact() {
  return (
    <div className="section">
      <div className="container" style={{ maxWidth: "680px" }}>
        <div className="eyebrow">Contact</div>
        <h1 style={{ fontSize: "clamp(28px,3.6vw,42px)", marginTop: "10px", marginBottom: "16px" }}>Get in touch</h1>
        <p className="section-sub" style={{ marginBottom: "36px" }}>
          Whether you're a company with a question about posting a task, or a student wondering about an application, reach out directly, we're a small team and read everything ourselves.
        </p>

        <div className="contact-grid">
          <a href="mailto:s.fonze@skillbid.com" className="contact-card">
            <div className="contact-icon"><MailIcon size={20} /></div>
            <div className="contact-name">Sacha Fonzé</div>
            <div className="contact-email">s.fonze@skillbid.com</div>
          </a>
          <a href="mailto:oscar.sole@skillbid.com" className="contact-card">
            <div className="contact-icon"><MailIcon size={20} /></div>
            <div className="contact-name">Oscar Solé</div>
            <div className="contact-email">oscar.sole@skillbid.com</div>
          </a>
        </div>

        <p className="text-faint text-sm" style={{ marginTop: "32px" }}>
          Based in Maastricht, the Netherlands. We typically reply within a couple of business days.
        </p>
      </div>
    </div>
  );
}
