interface StatusBarProps {}

export default function StatusBar({}: StatusBarProps) {
  const fg = "#1A1C22";
  return (
    <div className="flex justify-between items-center px-6 pt-3 pb-1">
      <span className="text-xs font-semibold" style={{ color: fg }}>9:41</span>
      <div className="flex items-center gap-1">
        <svg width="16" height="11" viewBox="0 0 16 11">
          <rect x="0" y="4" width="2" height="7" rx="0.5" fill={fg} />
          <rect x="3" y="3" width="2" height="8" rx="0.5" fill={fg} />
          <rect x="6" y="1" width="2" height="10" rx="0.5" fill={fg} />
          <rect x="9" y="0" width="2" height="11" rx="0.5" fill={fg} />
        </svg>
        <span className="text-xs font-semibold" style={{ color: fg }}>5G</span>
        <svg width="26" height="13" viewBox="0 0 26 13">
          <rect
            x="0" y="0" width="22" height="12" rx="3"
            fill="none" stroke={fg}
          />
          <rect x="2" y="2" width="16" height="8" rx="1.5" fill={fg} />
          <rect x="23" y="3" width="2" height="6" rx="1" fill={fg} />
        </svg>
      </div>
    </div>
  );
}
