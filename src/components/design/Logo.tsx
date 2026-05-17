type Props = {
  size?: number;
  white?: boolean;
  className?: string;
};

export function Logo({ size = 28, white = false, className }: Props) {
  const bg = white ? "#fff" : "#0A2540";
  const stroke = white ? "#0A2540" : "#fff";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      style={{ flexShrink: 0 }}
    >
      <rect x="2" y="2" width="28" height="28" rx="7" fill={bg} />
      <g stroke={stroke} strokeWidth="1.6" fill="none" strokeLinecap="round">
        <circle cx="16" cy="16" r="7" />
        <path d="M16 9 L21.5 14 L19.5 21 L12.5 21 L10.5 14 Z" />
      </g>
    </svg>
  );
}
