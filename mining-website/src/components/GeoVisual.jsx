import { motion, useReducedMotion } from 'framer-motion'

function Contour({ d, delay = 0, dur = 8 }) {
  const reduce = useReducedMotion()
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={reduce ? { pathLength: 1, opacity: 1 } : { pathLength: 1, opacity: [0, 0.9, 0.6] }}
      transition={reduce ? { duration: 0 } : { duration: dur, delay, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
    />
  )
}

export function GeoVisual({ className = '', mobileBackground = false }) {
  const contourColor = mobileBackground
    ? 'h-full w-full text-emerald-600/80 dark:text-emerald-400/60'
    : 'h-full w-full text-emerald-700/60 dark:text-emerald-400/40'
  const hexColor = mobileBackground
    ? 'absolute inset-0 h-full w-full text-cyan-500/50 dark:text-cyan-400/40'
    : 'absolute inset-0 h-full w-full text-cyan-600/35 dark:text-cyan-400/25'

  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 500 500"
        className={contourColor}
        fill="none"
      >
        <Contour d="M50,350 Q150,280 250,320 T450,290" delay={0} dur={10} />
        <Contour d="M30,320 Q140,250 260,290 T470,260" delay={0.5} dur={11} />
        <Contour d="M60,290 Q170,210 270,260 T440,230" delay={1} dur={12} />
        <Contour d="M40,260 Q160,180 280,230 T460,200" delay={1.5} dur={10} />
        <Contour d="M70,230 Q180,150 290,200 T430,170" delay={2} dur={11} />
        <Contour d="M50,200 Q170,120 300,170 T450,140" delay={2.5} dur={13} />
        <Contour d="M80,170 Q190,90 310,140 T420,110" delay={3} dur={10} />
      </svg>

      {/* hexagonal grid overlay */}
      <svg
        viewBox="0 0 500 500"
        className={hexColor}
        fill="none"
      >
        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3].map((col) => {
            const x = col * 120 + (row % 2 ? 60 : 0) + 40
            const y = row * 100 + 50
            const s = 36
            const hex = `M${x},${y - s} L${x + s * 0.866},${y - s / 2} L${x + s * 0.866},${y + s / 2} L${x},${y + s} L${x - s * 0.866},${y + s / 2} L${x - s * 0.866},${y - s / 2} Z`
            return (
              <motion.path
                key={`${row}-${col}`}
                d={hex}
                stroke="currentColor"
                strokeWidth="1.2"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.7, 0.45] }}
                transition={{
                  duration: 6,
                  delay: (row + col) * 0.3,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
              />
            )
          }),
        )}
      </svg>

      {/* survey point markers */}
      <svg
        viewBox="0 0 500 500"
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        {[
          { cx: 180, cy: 220, color: 'rgb(16,185,129)' },
          { cx: 320, cy: 160, color: 'rgb(6,182,212)' },
          { cx: 260, cy: 340, color: 'rgb(245,158,11)' },
        ].map((pt, i) => (
          <g key={i}>
            <motion.circle
              cx={pt.cx}
              cy={pt.cy}
              r={mobileBackground ? 8 : 6}
              fill={pt.color}
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 3, delay: i * 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
              cx={pt.cx}
              cy={pt.cy}
              r={mobileBackground ? 28 : 20}
              stroke={pt.color}
              strokeWidth={mobileBackground ? 2 : 1.5}
              fill="none"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0.6, 0], scale: [0.5, 2] }}
              transition={{ duration: 3, delay: i * 1.5, repeat: Infinity, ease: 'easeOut' }}
            />
          </g>
        ))}
      </svg>
    </div>
  )
}
