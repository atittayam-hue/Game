import React from 'react';
import { AvatarConfig } from '../types/game';

interface AvatarSvgProps {
  config: AvatarConfig;
  size?: number;
  className?: string;
}

export const AvatarSvg: React.FC<AvatarSvgProps> = ({
  config,
  size = 120,
  className = '',
}) => {
  const {
    bgColor,
    skinColor,
    hairStyle,
    hairColor,
    eyeStyle,
    accessory,
    outfitStyle,
    outfitColor,
  } = config;

  const renderBackHair = () => {
    switch (hairStyle) {
      case 'long':
        return (
          <path
            d="M54 90 C54 45, 146 45, 146 90 L152 162 C152 168, 134 170, 128 164 L128 110 L72 110 L72 164 C66 170, 48 168, 48 162 Z"
            fill={hairColor}
          />
        );
      case 'bob':
        return (
          <path
            d="M52 88 C52 44, 148 44, 148 88 L150 132 C150 138, 136 140, 132 134 L132 105 L68 105 L68 134 C64 140, 50 138, 50 132 Z"
            fill={hairColor}
          />
        );
      case 'ponytail':
        return (
          <g>
            <path
              d="M134 74 C156 72, 166 96, 158 132 C154 146, 142 146, 138 132 C136 116, 138 94, 130 84 Z"
              fill={hairColor}
            />
            <circle cx="136" cy="78" r="6" fill="#F59E0B" />
          </g>
        );
      case 'bun':
        return (
          <g>
            <circle cx="100" cy="40" r="20" fill={hairColor} />
            <path
              d="M84 44 C92 38, 108 38, 116 44"
              stroke="#000000"
              strokeOpacity="0.18"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        );
      case 'curly':
        return (
          <g fill={hairColor}>
            <circle cx="58" cy="86" r="16" />
            <circle cx="142" cy="86" r="16" />
            <circle cx="62" cy="64" r="16" />
            <circle cx="138" cy="64" r="16" />
            <circle cx="80" cy="50" r="17" />
            <circle cx="120" cy="50" r="17" />
            <circle cx="100" cy="46" r="18" />
          </g>
        );
      default:
        return null;
    }
  };

  const renderFrontHair = () => {
    switch (hairStyle) {
      case 'short':
        return (
          <path
            d="M58 88 C58 50, 142 50, 142 88 C136 74, 122 68, 100 68 C78 68, 64 74, 58 88 Z"
            fill={hairColor}
          />
        );
      case 'sidePart':
        return (
          <path
            d="M57 90 C56 48, 144 48, 143 90 C138 76, 126 68, 106 72 C88 76, 70 72, 57 90 Z"
            fill={hairColor}
          />
        );
      case 'spiky':
        return (
          <path
            d="M57 88 L54 66 L70 70 L78 44 L96 60 L108 40 L122 62 L140 52 L142 88 C130 72, 116 68, 100 68 C84 68, 70 72, 57 88 Z"
            fill={hairColor}
          />
        );
      case 'curly':
        return (
          <g fill={hairColor}>
            <circle cx="70" cy="64" r="13" />
            <circle cx="90" cy="58" r="14" />
            <circle cx="112" cy="58" r="14" />
            <circle cx="130" cy="65" r="13" />
          </g>
        );
      case 'bob':
      case 'long':
      case 'ponytail':
      case 'bun':
        return (
          <path
            d="M58 88 C58 50, 142 50, 142 88 C130 70, 114 66, 100 72 C86 66, 70 70, 58 88 Z"
            fill={hairColor}
          />
        );
      default:
        return null;
    }
  };

  const renderEyes = () => {
    switch (eyeStyle) {
      case 'happy':
        return (
          <g stroke="#1E293B" strokeWidth="3.2" strokeLinecap="round" fill="none">
            <path d="M74 97 Q81 89 88 97" />
            <path d="M112 97 Q119 89 126 97" />
          </g>
        );
      case 'focused':
        return (
          <g>
            <line x1="72" y1="86" x2="89" y2="89" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            <line x1="128" y1="86" x2="111" y2="89" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            <circle cx="81" cy="96" r="4.5" fill="#1E293B" />
            <circle cx="119" cy="96" r="4.5" fill="#1E293B" />
            <circle cx="82.5" cy="94.5" r="1.4" fill="#FFFFFF" />
            <circle cx="120.5" cy="94.5" r="1.4" fill="#FFFFFF" />
          </g>
        );
      case 'sparkle':
        return (
          <g>
            <circle cx="81" cy="96" r="5.5" fill="#1E293B" />
            <circle cx="119" cy="96" r="5.5" fill="#1E293B" />
            <circle cx="83" cy="94" r="2" fill="#FFFFFF" />
            <circle cx="121" cy="94" r="2" fill="#FFFFFF" />
            <circle cx="79.5" cy="97.5" r="1" fill="#FFFFFF" />
            <circle cx="117.5" cy="97.5" r="1" fill="#FFFFFF" />
          </g>
        );
      case 'wink':
        return (
          <g>
            <circle cx="81" cy="96" r="4.8" fill="#1E293B" />
            <circle cx="82.5" cy="94.5" r="1.5" fill="#FFFFFF" />
            <path
              d="M112 97 Q119 90 126 97"
              stroke="#1E293B"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        );
      case 'normal':
      default:
        return (
          <g>
            <circle cx="81" cy="96" r="4.8" fill="#1E293B" />
            <circle cx="119" cy="96" r="4.8" fill="#1E293B" />
            <circle cx="82.5" cy="94.5" r="1.5" fill="#FFFFFF" />
            <circle cx="120.5" cy="94.5" r="1.5" fill="#FFFFFF" />
          </g>
        );
    }
  };

  const renderOutfit = () => {
    return (
      <g>
        {/* Base shoulders */}
        <path
          d="M36 196 C38 156, 66 144, 100 144 C134 144, 162 156, 164 196 Z"
          fill={outfitColor}
        />
        {outfitStyle === 'polo' && (
          <g>
            <path d="M84 144 L100 164 L116 144 Z" fill="#FFFFFF" fillOpacity="0.92" />
            <path d="M100 162 L100 184" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="100" cy="170" r="2" fill="#FFFFFF" />
            <circle cx="100" cy="178" r="2" fill="#FFFFFF" />
          </g>
        )}
        {outfitStyle === 'tshirt' && (
          <path
            d="M82 144 Q100 158 118 144"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.8"
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}
        {outfitStyle === 'hoodie' && (
          <g>
            <path
              d="M72 146 Q100 162 128 146"
              fill="none"
              stroke="#000000"
              strokeOpacity="0.18"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <line x1="90" y1="156" x2="88" y2="180" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            <line x1="110" y1="156" x2="112" y2="180" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}
        {outfitStyle === 'blazer' && (
          <g>
            <path d="M84 144 L100 184 L116 144 Z" fill="#FFFFFF" />
            <path d="M97 154 L100 182 L103 154 Z" fill="#DC2626" />
            <path d="M74 146 L94 184" stroke="#000000" strokeOpacity="0.25" strokeWidth="3" />
            <path d="M126 146 L106 184" stroke="#000000" strokeOpacity="0.25" strokeWidth="3" />
          </g>
        )}
        {outfitStyle === 'varsity' && (
          <g>
            <path d="M36 196 C38 164, 54 152, 66 148 L66 196 Z" fill="#FFFFFF" fillOpacity="0.9" />
            <path d="M164 196 C162 164, 146 152, 134 148 L134 196 Z" fill="#FFFFFF" fillOpacity="0.9" />
            <path d="M82 144 Q100 156 118 144" fill="none" stroke="#FFFFFF" strokeWidth="4" />
            <line x1="100" y1="152" x2="100" y2="196" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="2.5" />
          </g>
        )}
      </g>
    );
  };

  const renderAccessory = () => {
    switch (accessory) {
      case 'roundGlasses':
        return (
          <g stroke="#1E293B" strokeWidth="2.8" fill="none">
            <circle cx="81" cy="96" r="12" fill="#FFFFFF" fillOpacity="0.18" />
            <circle cx="119" cy="96" r="12" fill="#FFFFFF" fillOpacity="0.18" />
            <path d="M93 96 Q100 93 107 96" />
            <line x1="60" y1="94" x2="69" y2="96" />
            <line x1="131" y1="96" x2="140" y2="94" />
          </g>
        );
      case 'squareGlasses':
        return (
          <g stroke="#0F172A" strokeWidth="2.8" fill="none">
            <rect x="68" y="86" width="26" height="20" rx="5" fill="#FFFFFF" fillOpacity="0.18" />
            <rect x="106" y="86" width="26" height="20" rx="5" fill="#FFFFFF" fillOpacity="0.18" />
            <line x1="94" y1="95" x2="106" y2="95" />
            <line x1="60" y1="93" x2="68" y2="94" />
            <line x1="132" y1="94" x2="140" y2="93" />
          </g>
        );
      case 'headphones':
        return (
          <g>
            <path
              d="M54 96 C54 46, 146 46, 146 96"
              fill="none"
              stroke="#1E293B"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <rect x="46" y="82" width="14" height="30" rx="7" fill="#334155" />
            <rect x="140" y="82" width="14" height="30" rx="7" fill="#334155" />
            <rect x="49" y="87" width="5" height="20" rx="2.5" fill="#6366F1" />
            <rect x="146" y="87" width="5" height="20" rx="2.5" fill="#6366F1" />
          </g>
        );
      case 'gradCap':
        return (
          <g>
            <rect x="74" y="49" width="52" height="14" rx="2" fill="#1E293B" />
            <polygon points="100,30 144,47 100,62 56,47" fill="#0F172A" />
            <line x1="134" y1="51" x2="138" y2="72" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="138" cy="74" r="3.5" fill="#F59E0B" />
          </g>
        );
      case 'headband':
        return (
          <path
            d="M59 82 C70 60, 130 60, 141 82"
            fill="none"
            stroke="#EF4444"
            strokeWidth="6"
            strokeLinecap="round"
          />
        );
      default:
        return null;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={`rounded-2xl shrink-0 select-none ${className}`}
      role="img"
      aria-label="Student avatar"
    >
      <defs>
        <clipPath id="avatar-frame">
          <rect x="0" y="0" width="200" height="200" rx="28" />
        </clipPath>
      </defs>
      <g clipPath="url(#avatar-frame)">
        {/* Background */}
        <rect x="0" y="0" width="200" height="200" fill={bgColor} />
        <circle cx="100" cy="108" r="82" fill="#FFFFFF" fillOpacity="0.28" />

        {/* Back hair */}
        {renderBackHair()}

        {/* Outfit & Neck */}
        {renderOutfit()}
        <rect x="88" y="128" width="24" height="22" rx="10" fill={skinColor} />
        <path d="M88 134 Q100 142 112 134" fill="#000000" fillOpacity="0.1" />

        {/* Ears */}
        <circle cx="58" cy="98" r="9" fill={skinColor} />
        <circle cx="142" cy="98" r="9" fill={skinColor} />

        {/* Head */}
        <rect x="59" y="54" width="82" height="86" rx="40" fill={skinColor} />

        {/* Subtle cheeks */}
        <ellipse cx="74" cy="108" rx="6.5" ry="3.5" fill="#F43F5E" fillOpacity="0.18" />
        <ellipse cx="126" cy="108" rx="6.5" ry="3.5" fill="#F43F5E" fillOpacity="0.18" />

        {/* Eyes & Eyebrows */}
        {eyeStyle !== 'focused' && (
          <g stroke="#1E293B" strokeWidth="2.4" strokeLinecap="round" fill="none" strokeOpacity="0.65">
            <path d="M74 85 Q81 82 88 85" />
            <path d="M112 85 Q119 82 126 85" />
          </g>
        )}
        {renderEyes()}

        {/* Nose & Smile */}
        <path d="M98 102 Q100 106 102 102" stroke="#000000" strokeOpacity="0.2" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path
          d="M89 116 Q100 125 111 116"
          stroke="#7C2D12"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Front hair */}
        {renderFrontHair()}

        {/* Accessories */}
        {renderAccessory()}
      </g>
    </svg>
  );
};
