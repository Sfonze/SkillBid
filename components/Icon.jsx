// Simple, consistent line icons (stroke-based, currentColor) used in place of emoji
// throughout the site, so icon style stays on-brand rather than relying on system emoji.

const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

export function GraduationIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M12 4L3 8.5L12 13L21 8.5L12 4Z" />
      <path d="M7 10.5V15C7 15 9 17 12 17C15 17 17 15 17 15V10.5" />
      <path d="M21 8.5V14.5" />
    </svg>
  );
}

export function ShieldCheckIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M12 3L4 6V11C4 16 7.5 19.5 12 21C16.5 19.5 20 16 20 11V6L12 3Z" />
      <path d="M9 12L11.5 14.5L16 10" />
    </svg>
  );
}

export function CompassIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.8 9.2L13 13L9.2 14.8L11 11L14.8 9.2Z" />
    </svg>
  );
}

export function BuildingIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M6 21V5L12 3L18 5V21" />
      <path d="M4 21H20" />
      <path d="M10 21V16H14V21" />
      <path d="M9.5 8.5H9.51M12 8.5H12.01M14.5 8.5H14.51" />
    </svg>
  );
}

export function BoltIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M13 2L4 14H11L10 22L20 9H13L13 2Z" />
    </svg>
  );
}

export function CrownIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M3 17L5 8L9 12L12 6L15 12L19 8L21 17H3Z" />
      <path d="M3 19.5H21" />
    </svg>
  );
}

export function MailIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7L12 13L21 7" />
    </svg>
  );
}

export function BellIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M8 17H16C16 17 15 15.5 15 12C15 8.5 13.5 6 12 6C10.5 6 9 8.5 9 12C9 15.5 8 17 8 17Z" />
      <path d="M10.3 19.5C10.3 19.5 10.8 21 12 21C13.2 21 13.7 19.5 13.7 19.5" />
    </svg>
  );
}

export function PlayIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 4.5V19.5L19 12L7 4.5Z" />
    </svg>
  );
}
