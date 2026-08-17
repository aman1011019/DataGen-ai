export interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo = ({ className = "w-8 h-8", size = 32 }: LogoProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Central Top Accent Dots */}
      <circle cx="100" cy="14" r="4" fill="#38B6FF" />
      <circle cx="100" cy="46" r="18" fill="#7AD5F7" opacity="0.9" />

      {/* Left Top Node */}
      <circle cx="38" cy="62" r="20" fill="#0D2352" />
      <line x1="38" y1="62" x2="90" y2="95" stroke="#0D2352" strokeWidth="8" strokeLinecap="round" />

      {/* Right Top Node + Inner Lens/Dot */}
      <circle cx="162" cy="62" r="20" fill="#0D2352" />
      <line x1="162" y1="62" x2="110" y2="95" stroke="#0D2352" strokeWidth="8" strokeLinecap="round" />
      <line x1="152" y1="72" x2="164" y2="60" stroke="#7AD5F7" strokeWidth="4" strokeLinecap="round" />
      <circle cx="166" cy="58" r="3.5" fill="#7AD5F7" />

      {/* Central Vertical Pillar */}
      <path d="M 94 65 L 106 65 L 106 125 L 94 125 Z" fill="#0D2352" />

      {/* Left Body Shield */}
      <path
        d="M 26 84 C 26 84 55 96 74 106 L 74 162 L 60 162 C 38 162 26 148 26 126 Z"
        fill="#0D2352"
      />

      {/* Right Body Shield */}
      <path
        d="M 174 84 C 174 84 145 96 126 106 L 126 162 L 140 162 C 162 162 174 148 174 126 Z"
        fill="#0D2352"
      />

      {/* Central Bottom Nodes */}
      <line x1="100" y1="120" x2="100" y2="160" stroke="#0D2352" strokeWidth="6" />
      <circle cx="100" cy="166" r="17" fill="#38B6FF" />
      <circle cx="100" cy="198" r="4" fill="#38B6FF" />
    </svg>
  );
};

export default Logo;
