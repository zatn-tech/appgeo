import { motion, useReducedMotion } from 'framer-motion'

export function BackgroundFX() {
  const reduce = useReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* mesh gradient layer */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(1400px circle at 8% 8%, rgba(16,185,129,0.14) 0%, transparent 50%),' +
            'radial-gradient(1100px circle at 92% 10%, rgba(6,182,212,0.12) 0%, transparent 55%),' +
            'radial-gradient(1200px circle at 75% 88%, rgba(245,158,11,0.09) 0%, transparent 50%)',
        }}
      />

      {/* 3D-ish perspective plane (more visible) */}
      <div
        className="absolute inset-x-0 bottom-[-22rem] h-[34rem] opacity-[0.35] blur-[0.2px]"
        style={{ perspective: '1100px' }}
      >
        <div
          className="absolute inset-0 origin-top bg-[linear-gradient(to_right,rgba(2,6,23,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,0.2)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(closest-side,rgba(0,0,0,0.85),transparent)]"
          style={{ transform: 'rotateX(68deg) translateY(-120px)' }}
        />
      </div>

      <motion.div
        className="absolute -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-emerald-300/30 blur-3xl"
        animate={reduce ? undefined : { x: [-40, 40, -40], y: [0, 18, 0], scale: [1, 1.08, 1] }}
        transition={reduce ? undefined : { duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-24 right-[-10rem] h-[36rem] w-[36rem] rounded-full bg-sky-300/30 blur-3xl"
        animate={reduce ? undefined : { x: [0, -30, 0], y: [0, 24, 0], scale: [1, 1.1, 1] }}
        transition={reduce ? undefined : { duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-48 left-[-8rem] h-[38rem] w-[38rem] rounded-full bg-amber-200/30 blur-3xl"
        animate={reduce ? undefined : { x: [0, 34, 0], y: [0, -18, 0], scale: [1, 1.06, 1] }}
        transition={reduce ? undefined : { duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* conic “halo” ring for depth */}
      <motion.div
        className="absolute left-1/2 top-[22rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full opacity-40 blur-[0.5px]"
        style={{
          background:
            'conic-gradient(from 180deg, rgba(16,185,129,0.0), rgba(16,185,129,0.28), rgba(56,189,248,0.26), rgba(245,158,11,0.18), rgba(16,185,129,0.0))',
          WebkitMaskImage:
            'radial-gradient(circle at center, transparent 56%, rgba(0,0,0,1) 58%, rgba(0,0,0,1) 62%, transparent 66%)',
          maskImage:
            'radial-gradient(circle at center, transparent 56%, rgba(0,0,0,1) 58%, rgba(0,0,0,1) 62%, transparent 66%)',
          filter: 'drop-shadow(0 24px 48px rgba(2,6,23,0.18))',
        }}
        animate={reduce ? undefined : { rotate: [0, 18, 0] }}
        transition={reduce ? undefined : { duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* specular highlights (reads as 3D shine) */}
      <div className="absolute left-[10%] top-[18%] h-56 w-56 rounded-full bg-white/20 blur-2xl opacity-30" />
      <div className="absolute right-[14%] top-[26%] h-44 w-44 rounded-full bg-white/15 blur-2xl opacity-20" />

      {/* subtle noise */}
      <div className="absolute inset-0 opacity-[0.22] mix-blend-multiply">
        <svg width="100%" height="100%">
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>
    </div>
  )
}

