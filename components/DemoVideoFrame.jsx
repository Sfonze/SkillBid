"use client";
import { useToast } from "./Providers";

export default function DemoVideoFrame({ large }) {
  const { pushToast } = useToast();
  return (
    <div className={"video-frame" + (large ? " video-frame-large" : "")} onClick={() => pushToast("Demo video coming soon, drop yours in here later.", "stamp")}>
      <div className="play-btn">▶</div>
      <div className="play-label">2 min · how SkillBid works</div>
    </div>
  );
}
