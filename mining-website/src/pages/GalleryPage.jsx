import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { CTA } from '../components/CTA.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { gallerySections as galleryFallbackSections } from '../content/galleryData.js'
import { useGallery } from '../hooks/usePublicContent.js'

export function GalleryPage() {
  const { data: galleryRes } = useGallery(galleryFallbackSections)
  const gallerySections = galleryRes?.gallery || galleryFallbackSections
  const flatImages = (gallerySections || []).flatMap((section) => section.images || [])

  const [activeIndex, setActiveIndex] = useState(-1)
  const [slideDirection, setSlideDirection] = useState(1)
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 })
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)

  const showPrev = useCallback(() => {
    setSlideDirection(-1)
    setIsImageLoading(true)
    setActiveIndex((idx) => (idx - 1 + flatImages.length) % flatImages.length)
  }, [flatImages.length])

  const showNext = useCallback(() => {
    setSlideDirection(1)
    setIsImageLoading(true)
    setActiveIndex((idx) => (idx + 1) % flatImages.length)
  }, [flatImages.length])

  useEffect(() => {
    if (activeIndex < 0) return

    function onKeyDown(e) {
      if (e.key === 'Escape') setActiveIndex(-1)
      if (e.key === 'ArrowRight') showNext()
      if (e.key === 'ArrowLeft') showPrev()
    }

    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [activeIndex, showNext, showPrev])

  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="Project & Field Gallery"
        subtitle="Moments from DGPS/GPS surveys, training sessions, and team events."
        width="wide"
      />

      <section className="container-wide pb-16 md:pb-24">
        <div className={flatImages.length <= 6 ? 'grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4' : 'columns-2 gap-3 md:columns-3 md:gap-4 xl:columns-4'}>
          {flatImages.map((img, i) => (
            <button
              key={`${img.src}-${i}`}
              type="button"
              className="group mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-slate-900/5 dark:border-slate-400/10 bg-white/60 dark:bg-slate-800/40 text-left md:mb-4"
              onClick={() => {
                setIsImageLoading(true)
                setActiveIndex(i)
              }}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </section>

      {activeIndex >= 0
        ? createPortal(
            <div
              className="fixed inset-0 p-4 md:p-8"
              style={{
                zIndex: 2147483647,
                background:
                  'radial-gradient(1200px 600px at 20% 20%, rgba(16,185,129,0.20), transparent 55%), radial-gradient(1000px 600px at 80% 80%, rgba(6,182,212,0.20), transparent 55%), linear-gradient(180deg, rgba(2,6,23,0.98) 0%, rgba(2,6,23,0.94) 100%)',
              }}
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                aria-label="Close viewer"
                className="grid h-11 w-11 place-items-center rounded-full border border-slate-200/90 bg-white text-slate-900 shadow-2xl hover:bg-slate-100"
                style={{ zIndex: 2147483647, position: 'fixed', top: 16, right: 16 }}
                onClick={() => setActiveIndex(-1)}
              >
                <X size={20} />
              </button>

              <div className="fixed top-4 left-4 z-[2147483647] rounded-xl border border-white/25 bg-black/55 px-3 py-2 text-white backdrop-blur">
                <div className="text-xs font-semibold tracking-wide uppercase opacity-90">
                  Gallery
                </div>
                <div className="mt-0.5 text-sm font-semibold">
                  {activeIndex + 1} / {flatImages.length}
                </div>
              </div>

              <div
                className="pointer-events-none fixed inset-y-0 left-0 w-28 bg-gradient-to-r from-black/55 via-black/20 to-transparent"
                style={{ zIndex: 2147483646 }}
              />
              <div
                className="pointer-events-none fixed inset-y-0 right-0 w-28 bg-gradient-to-l from-black/55 via-black/20 to-transparent"
                style={{ zIndex: 2147483646 }}
              />

              <button
                type="button"
                aria-label="Previous image"
                className="grid h-12 w-12 place-items-center rounded-full border border-slate-200/90 bg-white text-slate-900 shadow-2xl backdrop-blur hover:bg-slate-100"
                style={{ zIndex: 2147483647, position: 'fixed', top: '50%', left: 16, transform: 'translateY(-50%)' }}
                onClick={showPrev}
              >
                <ChevronLeft size={24} strokeWidth={2.5} />
              </button>

              <button
                type="button"
                aria-label="Next image"
                className="grid h-12 w-12 place-items-center rounded-full border border-slate-200/90 bg-white text-slate-900 shadow-2xl backdrop-blur hover:bg-slate-100"
                style={{ zIndex: 2147483647, position: 'fixed', top: '50%', right: 16, transform: 'translateY(-50%)' }}
                onClick={showNext}
              >
                <ChevronRight size={24} strokeWidth={2.5} />
              </button>

              <div
                className="flex h-full items-center justify-center"
                onTouchStart={(e) => setTouchStartX(e.changedTouches[0]?.clientX ?? 0)}
                onTouchEnd={(e) => {
                  const endX = e.changedTouches[0]?.clientX ?? 0
                  const delta = endX - touchStartX
                  if (Math.abs(delta) < 50) return
                  if (delta > 0) showPrev()
                  else showNext()
                }}
              >
                {isImageLoading ? (
                  <div className="h-[68vh] w-[92vw] max-w-5xl animate-pulse rounded-xl bg-white/12" />
                ) : null}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={flatImages[activeIndex].src}
                    src={flatImages[activeIndex].src}
                    alt={flatImages[activeIndex].alt}
                    className="rounded-xl object-contain shadow-2xl"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      maxWidth: naturalSize.width ? `min(92vw, ${naturalSize.width}px)` : '92vw',
                      maxHeight: naturalSize.height ? `min(86vh, ${naturalSize.height}px)` : '86vh',
                    }}
                    initial={{ opacity: 0, x: slideDirection * 46, scale: 0.985 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: slideDirection * -46, scale: 0.985 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    onLoad={(e) => {
                      setNaturalSize({
                        width: e.currentTarget.naturalWidth || 0,
                        height: e.currentTarget.naturalHeight || 0,
                      })
                      setIsImageLoading(false)
                    }}
                  />
                </AnimatePresence>
              </div>
            </div>,
            document.body,
          )
        : null}

      <CTA />
    </>
  )
}

