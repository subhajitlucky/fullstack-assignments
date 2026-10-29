export function StatusBar() {
  return (
    <div className="status-bar" aria-hidden="true">
      <span className="status-time">9:41</span>
      <span className="status-icons">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
          <rect x="0.5" y="7" width="2.5" height="3.5" rx="0.7" fill="currentColor" />
          <rect x="4.5" y="5" width="2.5" height="5.5" rx="0.7" fill="currentColor" />
          <rect x="8.5" y="2.5" width="2.5" height="8" rx="0.7" fill="currentColor" />
          <rect x="12.5" y="0.5" width="2.5" height="10" rx="0.7" fill="currentColor" />
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
          <path
            d="M1.5 3.6a10.4 10.4 0 0 1 13 0M4 6.2a6.8 6.8 0 0 1 8 0M6.6 8.7a3.1 3.1 0 0 1 2.8 0"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="8" cy="10" r="0.7" fill="currentColor" />
        </svg>
        <svg width="24" height="11" viewBox="0 0 24 11" fill="none">
          <rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke="currentColor" />
          <rect x="2" y="2" width="16" height="7" rx="1.3" fill="currentColor" />
          <path d="M22.5 3.6v3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );
}
