interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: 'auto' | string;
  strokeWidth?: number;
  className?: string;
  showDots?: boolean;
  animated?: boolean;
}

export function Sparkline({
  data,
  width = 120,
  height = 28,
  color = 'auto',
  strokeWidth = 2,
  className = '',
  showDots = false,
  animated = true,
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return { x, y };
  });

  const pathData = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ');
  const areaData = `${pathData} L ${width},${height} L 0,${height} Z`;

  const trend = data[data.length - 1] > data[0] ? 'up' : 'down';
  const trendColor = trend === 'up' ? 'rgb(var(--accent-600))' : '#ef4444';
  const finalColor = color === 'auto' ? trendColor : color;

  const gradientId = `gradient-${data.join('')}`;

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={finalColor} stopOpacity="0.18" />
          <stop offset="100%" stopColor={finalColor} stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={areaData} fill={`url(#${gradientId})`} className={animated ? 'animate-fade-in' : ''} />

      {/* Main line */}
      <path
        d={pathData}
        fill="none"
        stroke={finalColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? 'animate-draw-line' : ''}
        style={
          animated
            ? {
                strokeDasharray: width * 2,
                strokeDashoffset: width * 2,
                animation: 'draw-line 900ms ease-out forwards',
              }
            : {}
        }
      />

      {/* Dots */}
      {showDots &&
        points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={strokeWidth * 1.5}
            fill={finalColor}
            className={animated ? 'animate-fade-in' : ''}
            style={animated ? { animationDelay: `${i * 40}ms` } : {}}
          />
        ))}

      {/* Endpoint emphasis */}
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={strokeWidth * 2} fill={finalColor} />
    </svg>
  );
}

export default Sparkline;
