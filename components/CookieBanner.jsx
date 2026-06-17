"use client";
import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [dismissed, setDismissed] = useState(true); // default hidden until we check localStorage, avoids flash

  useEffect(() => {
    const choice = window.localStorage.getItem("skillbid_cookie_choice");
    setDismissed(!!choice);
  }, []);

  function choose(value) {
    window.localStorage.setItem("skillbid_cookie_choice", value);
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div className="cookie-banner">
      <p>
        We use a small number of essential cookies to run SkillBid, and optional analytics cookies to understand how the platform is used. See our{" "}
        <a href="/legal?tab=cookies" style={{ textDecoration: "underline" }}>Cookie Policy</a> for details.
      </p>
      <div className="flex-gap">
        <button className="btn btn-ghost btn-sm" style={{ borderColor: "rgba(248,248,242,0.4)", color: "var(--paper)" }} onClick={() => choose("essential")}>Essential only</button>
        <button className="btn btn-stamp btn-sm" onClick={() => choose("all")}>Accept all</button>
      </div>
    </div>
  );
}
