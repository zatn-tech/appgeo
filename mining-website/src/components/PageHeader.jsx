import { Reveal } from './Motion.jsx'

const containerMap = {
  narrow: 'container-narrow',
  default: 'container-page',
  wide: 'container-wide',
}

const contentMap = {
  narrow: 'max-w-3xl',
  default: 'max-w-4xl',
  wide: 'max-w-5xl',
}

export function PageHeader({ eyebrow, title, subtitle, children, width = 'default' }) {
  const containerClass = containerMap[width] || containerMap.default
  const contentClass = contentMap[width] || contentMap.default

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 hero-grid" />
      <div className={`${containerClass} py-16 md:py-24`}>
        <Reveal>
          <div className={contentClass}>
            {eyebrow ? (
              <div className="kicker">{eyebrow}</div>
            ) : null}
            <h1 className="page-title mt-4">
              <span className="gradient-text">{title}</span>
            </h1>
            {subtitle ? (
              <p className="page-subtitle mt-5">
                {subtitle}
              </p>
            ) : null}
            {children ? <div className="mt-6">{children}</div> : null}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
