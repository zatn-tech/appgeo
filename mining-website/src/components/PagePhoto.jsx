import { motion, useReducedMotion } from 'framer-motion'

export function PagePhoto({ caption }) {
  const reduce = useReducedMotion()
  return (
    <section className="container-page mb-2">
      <div className="relative overflow-hidden rounded-2xl border border-slate-900/5 dark:border-slate-400/10 bg-gradient-to-br from-emerald-50/80 via-cyan-50/50 to-slate-50/80 dark:from-emerald-900/20 dark:via-cyan-900/10 dark:to-slate-900/20 p-8 md:p-12">
        <svg
          viewBox="0 0 400 120"
          className="w-full text-emerald-600/10 dark:text-emerald-400/10"
          fill="none"
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.path
              key={i}
              d={`M0,${100 - i * 18} Q100,${70 - i * 20} 200,${85 - i * 18} T400,${65 - i * 20}`}
              stroke="currentColor"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={reduce ? { pathLength: 1 } : { pathLength: [0, 1] }}
              transition={reduce ? { duration: 0 } : { duration: 2, delay: i * 0.2, ease: 'easeOut' }}
            />
          ))}
        </svg>
        {caption ? (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {caption}
          </p>
        ) : null}
      </div>
    </section>
  )
}
