import React from 'react';
import Svg, { Path, Rect, Circle, Line, Polyline, Ellipse, Polygon } from 'react-native-svg';

/**
 * Custom SVG Feather Icons to bypass react-native-vector-icons native linking issues.
 * Matches Feather Icons design exactly.
 * 
 * @param {string} name - Icon name ('mail', 'lock', 'user', 'eye', 'eye-off', 'chevron-left', 'check')
 * @param {number} size - Icon dimensions
 * @param {string} color - Stroke color
 */
const AuthIcon = ({ name, size = 20, color = '#888888', style = {} }) => {
  const strokeWidth = 2;

  switch (name) {
    case 'mail':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <Polyline points="22,6 12,13 2,6" />
        </Svg>
      );

    case 'lock':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </Svg>
      );

    case 'user':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <Circle cx="12" cy="7" r="4" />
        </Svg>
      );

    case 'eye':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <Circle cx="12" cy="12" r="3" />
        </Svg>
      );

    case 'eye-off':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <Line x1="1" y1="1" x2="23" y2="23" />
        </Svg>
      );

    case 'chevron-left':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Polyline points="15 18 9 12 15 6" />
        </Svg>
      );

    case 'check':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Polyline points="20 6 9 17 4 12" />
        </Svg>
      );

    case 'x':
    case 'close':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Line x1="18" y1="6" x2="6" y2="18" />
          <Line x1="6" y1="6" x2="18" y2="18" />
        </Svg>
      );

    case 'plus':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Line x1="12" y1="5" x2="12" y2="19" />
          <Line x1="5" y1="12" x2="19" y2="12" />
        </Svg>
      );

    case 'zap':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </Svg>
      );

    case 'home':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <Polyline points="9 22 9 12 15 12 15 22" />
        </Svg>
      );

    case 'flag':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <Line x1="4" y1="22" x2="4" y2="15" />
        </Svg>
      );

    case 'golf-play':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 44 44"
          fill="none"
          style={style}
        >
          {/* Tee Stem Main Body (Left Side - Darker Green) */}
          <Path
            d="M 12 24 C 12 24, 18 30, 20 32 L 22 41 L 22 24 Z"
            fill="#2EA200"
          />
          {/* Tee Stem Highlight (Right Side - Lime Green) */}
          <Path
            d="M 22 24 L 22 41 L 24 32 C 24 32, 30 30, 32 24 Z"
            fill="#BCFF00"
          />
          {/* Tee Cup Lip (Front rim) */}
          <Path
            d="M 12 24 C 12 28, 32 28, 32 24 L 32 21 C 32 25, 12 25, 12 21 Z"
            fill="#BCFF00"
            stroke="#093A24"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          {/* Tee Cup Top Face (Oval) */}
          <Ellipse
            cx="22"
            cy="21"
            rx="10"
            ry="3"
            fill="#2EA200"
            stroke="#093A24"
            strokeWidth={1.5}
          />
          <Ellipse
            cx="21"
            cy="21"
            rx="7"
            ry="1.8"
            fill="#BCFF00"
          />

          {/* Outline for the stem */}
          <Path
            d="M 12 24 C 12 24, 18 30, 20 32 L 22 41 L 24 32 C 24 32, 30 30, 32 24"
            fill="none"
            stroke="#093A24"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Golf Ball */}
          <Circle cx="22" cy="12" r="8.5" fill="#FFFFFF" stroke="#093A24" strokeWidth={1.8} />

          {/* Dimples */}
          <Circle cx="18" cy="9" r="0.7" fill="#718096" />
          <Circle cx="22" cy="8" r="0.7" fill="#718096" />
          <Circle cx="26" cy="9" r="0.7" fill="#718096" />

          <Circle cx="16" cy="13" r="0.7" fill="#718096" />
          <Circle cx="20" cy="13" r="0.7" fill="#718096" />
          <Circle cx="24" cy="13" r="0.7" fill="#718096" />
          <Circle cx="28" cy="13" r="0.7" fill="#718096" />

          <Circle cx="19" cy="17" r="0.7" fill="#718096" />
          <Circle cx="23" cy="16" r="0.7" fill="#718096" />
          <Circle cx="25" cy="17" r="0.7" fill="#718096" />
        </Svg>
      );

    case 'trophy':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <Path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <Path d="M4 22h16" />
          <Path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
          <Path d="M12 2a6 6 0 0 1 6 6v3.5c0 .65-.12 1.28-.35 1.86a6 6 0 0 1-11.3 0c-.23-.58-.35-1.21-.35-1.86V8a6 6 0 0 1 6-6z" />
        </Svg>
      );

    case 'search':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Circle cx="11" cy="11" r="8" />
          <Line x1="21" y1="21" x2="16.65" y2="16.65" />
        </Svg>
      );

    case 'globe':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Circle cx="12" cy="12" r="10" />
          <Line x1="2" y1="12" x2="22" y2="12" />
          <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </Svg>
      );

    case 'map-pin':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <Circle cx="12" cy="10" r="3" />
        </Svg>
      );

    case 'edit':
    case 'ti-edit':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={color}
          style={style}
        >
          <Path d="M19.4 7.34L16.66 4.6a2 2 0 0 0-2.66.02L4.29 14.33a2 2 0 0 0-.58 1.13L3 20a1 1 0 0 0 1 1l4.54-.71a2 2 0 0 0 1.13-.58L19.38 10a2 2 0 0 0 .02-2.66zM7.71 18.29l-2.58.4.4-2.58L13 8.68l2.17 2.17zM16.59 9.43L14.42 7.26l1.41-1.41 2.17 2.17z" />
        </Svg>
      );

    case 'users':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <Circle cx="9" cy="7" r="4" />
          <Path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" />
          <Path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
        </Svg>
      );

    case 'bell':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </Svg>
      );

    case 'crown':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Path d="M2 4l3 12h14l3-12-6 7-4-5-4 5-6-7z" />
        </Svg>
      );

    case 'book':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </Svg>
      );

    case 'clock':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Circle cx="12" cy="12" r="10" />
          <Polyline points="12 6 12 12 16 14" />
        </Svg>
      );

    case 'shield':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </Svg>
      );

    case 'help-circle':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Circle cx="12" cy="12" r="10" />
          <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <Line x1="12" y1="17" x2="12.01" y2="17" />
        </Svg>
      );

    case 'log-out':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <Polyline points="16 17 21 12 16 7" />
          <Line x1="21" y1="12" x2="9" y2="12" />
        </Svg>
      );

    case 'chevron-right':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Polyline points="9 18 15 12 9 6" />
        </Svg>
      );

    case 'award':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Circle cx="12" cy="8" r="7" />
          <Polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </Svg>
      );

    case 'trending-up':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <Polyline points="17 6 23 6 23 12" />
        </Svg>
      );

    case 'share':
    case 'share-2':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Circle cx="18" cy="5" r="3" />
          <Circle cx="6" cy="12" r="3" />
          <Circle cx="18" cy="19" r="3" />
          <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </Svg>
      );

    case 'camera':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <Circle cx="12" cy="13" r="4" />
        </Svg>
      );

    case 'star':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </Svg>
      );

    case 'chevron-down':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Polyline points="6 9 12 15 18 9" />
        </Svg>
      );

    case 'chevron-up':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Polyline points="18 15 12 9 6 15" />
        </Svg>
      );

    case 'up-down':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          style={style}
        >
          <Path
            d="M12 2L16 7H13V17H16L12 22L8 17H11V7H8L12 2Z"
            fill={color}
          />
        </Svg>
      );

    case 'trash':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Polyline points="3 6 5 6 21 6" />
          <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <Line x1="10" y1="11" x2="10" y2="17" />
          <Line x1="14" y1="11" x2="14" y2="17" />
        </Svg>
      );

    case 'calendar':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 14 14"
          fill="none"
          stroke={color}
          strokeWidth={1.16667}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Path d="M4.66667 1.16667V3.5" />
          <Path d="M9.33333 1.16667V3.5" />
          <Path d="M11.0833 2.33333H2.91667C2.27233 2.33333 1.75 2.85567 1.75 3.5V11.6667C1.75 12.311 2.27233 12.8333 2.91667 12.8333H11.0833C11.7277 12.8333 12.25 12.311 12.25 11.6667V3.5C12.25 2.85567 11.7277 2.33333 11.0833 2.33333Z" />
          <Path d="M1.75 5.83333H12.25" />
        </Svg>
      );

    case 'play':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 18 18"
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={style}
        >
          <Path d="M4.5 2.25L15 9L4.5 15.75V2.25Z" fill={color} />
        </Svg>
      );

    default:
      return null;
  }
};

export default AuthIcon;
