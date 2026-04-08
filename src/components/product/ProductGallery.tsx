'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface ProductImage {
  url: string
  alt: string
}

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
}

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })

  const hasImages = images.length > 0 && images[0].url

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  return (
    <div className="gallery-wrapper">
      {/* Main Image */}
      <div
        className={`gallery-main ${isZoomed ? 'gallery-zoomed' : ''}`}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {hasImages ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[activeIndex].url}
            alt={images[activeIndex].alt || productName}
            className="gallery-main-img"
            style={
              isZoomed
                ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    transform: 'scale(2)',
                  }
                : {}
            }
          />
        ) : (
          <div className="gallery-placeholder">
            <svg viewBox="0 0 200 220" fill="none" width="160">
              <path
                d="M70 80 Q70 40 100 40 Q130 40 130 80"
                stroke="#C9A84C"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />
              <rect x="25" y="80" width="150" height="115" rx="18" fill="#E91E8C" />
              <path d="M25 120 Q100 95 175 120 L175 80 Q100 58 25 80 Z" fill="#b5156d" />
              <circle cx="100" cy="123" r="13" fill="#C9A84C" />
              <circle cx="100" cy="123" r="6.5" fill="#1A1A2E" />
            </svg>
          </div>
        )}

        {/* Zoom hint */}
        {hasImages && !isZoomed && (
          <div className="gallery-zoom-hint">
            <ZoomIn size={14} />
            <span>Hover to zoom</span>
          </div>
        )}

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="gallery-nav gallery-nav-prev"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="gallery-nav gallery-nav-next"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="gallery-dots">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`gallery-dot ${i === activeIndex ? 'gallery-dot-active' : ''}`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`gallery-thumb ${i === activeIndex ? 'gallery-thumb-active' : ''}`}
            >
              {img.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.url}
                  alt={img.alt || `${productName} ${i + 1}`}
                  className="gallery-thumb-img"
                />
              ) : (
                <div className="gallery-thumb-placeholder" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}