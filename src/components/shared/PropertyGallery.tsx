'use client';

import { useState } from 'react';
import { Building2, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface PropertyGalleryProps {
  photos: string[];
  propertyName: string;
}

export function PropertyGallery({ photos, propertyName }: PropertyGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const setIndex = (i: number) => setActiveIndex(i);

  function openLightbox(index: number) {
    setActiveIndex(index);
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
  }

  function prev() {
    setActiveIndex(i => (i - 1 + photos.length) % photos.length);
  }

  function next() {
    setActiveIndex(i => (i + 1) % photos.length);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape') closeLightbox();
  }

  // ── No photos ─────────────────────────────────────────────
  if (photos.length === 0) {
    return (
      <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
        <div className="text-center text-gray-300">
          <Building2 className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm">No photos available</p>
        </div>
      </div>
    );
  }

  // ── Single photo ───────────────────────────────────────────
  if (photos.length === 1) {
    return (
      <>
        <div className="relative mb-6 rounded-xl overflow-hidden h-72 group cursor-pointer"
          onClick={() => openLightbox(0)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[0]}
            alt={`${propertyName} — photo 1`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        {lightboxOpen && (
          <Lightbox
            photos={photos}
            activeIndex={activeIndex}
            propertyName={propertyName}
            onClose={closeLightbox}
            onPrev={prev}
            onNext={next}
            onSetIndex={setIndex}
            onKeyDown={handleKeyDown}
          />
        )}
      </>
    );
  }

  // ── 2 photos ───────────────────────────────────────────────
  if (photos.length === 2) {
    return (
      <>
        <div className="grid grid-cols-2 gap-2 mb-6 rounded-xl overflow-hidden h-72">
          {photos.map((url, i) => (
            <div key={i}
              className="relative overflow-hidden group cursor-pointer"
              onClick={() => openLightbox(i)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${propertyName} — photo ${i + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
        {lightboxOpen && (
          <Lightbox
            photos={photos}
            activeIndex={activeIndex}
            propertyName={propertyName}
            onClose={closeLightbox}
            onPrev={prev}
            onNext={next}
            onSetIndex={setIndex}
            onKeyDown={handleKeyDown}
          />
        )}
      </>
    );
  }

  // ── 3 photos ───────────────────────────────────────────────
  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 mb-6 rounded-xl overflow-hidden h-72">
        {/* Main large photo — spans 2 columns and 2 rows */}
        <div
          className="col-span-2 row-span-2 relative overflow-hidden group cursor-pointer"
          onClick={() => openLightbox(0)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[0]}
            alt={`${propertyName} — main photo`}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Remaining photos — stacked on the right */}
        {photos.slice(1).map((url, i) => {
          const actualIndex = i + 1;
          const isLast = actualIndex === photos.length - 1 && photos.length > 3;

          return (
            <div
              key={actualIndex}
              className="col-span-2 row-span-1 relative overflow-hidden group cursor-pointer"
              onClick={() => openLightbox(actualIndex)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${propertyName} — photo ${actualIndex + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* "See all N photos" overlay on the last visible thumbnail */}
              {isLast && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    +{photos.length - 2} more
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Photo count badge */}
      <div className="flex items-center gap-2 mb-6 -mt-3">
        <button
          onClick={() => openLightbox(0)}
          className="text-sm text-primary underline-offset-2 hover:underline flex items-center gap-1.5"
        >
          <ZoomIn className="h-3.5 w-3.5" />
          View all {photos.length} photo{photos.length !== 1 ? 's' : ''}
        </button>
      </div>

      {lightboxOpen && (
        <Lightbox
          photos={photos}
          activeIndex={activeIndex}
          propertyName={propertyName}
          onClose={closeLightbox}
          onPrev={prev}
          onNext={next}
          onKeyDown={handleKeyDown} onSetIndex={function (i: number): void
          {
            throw new Error('Function not implemented.');
          } }        />
      )}
    </>
  );
}

// ── Lightbox ──────────────────────────────────────────────────
function Lightbox({
  photos,
  activeIndex,
  propertyName,
  onClose,
  onPrev,
  onNext,
  onSetIndex,
  onKeyDown,
}: {
  photos: string[];
  activeIndex: number;
  propertyName: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSetIndex: (i: number) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onKeyDown={onKeyDown}
      tabIndex={0}
      autoFocus
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
        <div className="text-white">
          <div className="font-semibold">{propertyName}</div>
          <div className="text-sm text-gray-400">
            {activeIndex + 1} / {photos.length}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Main image */}
      <div className="flex-1 flex items-center justify-center relative px-16 min-h-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[activeIndex]}
          alt={`${propertyName} — photo ${activeIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg"
        />

        {/* Prev / Next */}
        {photos.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex-shrink-0 flex items-center justify-center gap-2 px-6 py-4 overflow-x-auto">
          {photos.map((url, i) => (
            <button
              key={i}
              onClick={() => onSetIndex(i)}
              className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? 'border-white scale-110'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
              // We can't directly set index from here without prop drilling
              // so use prev/next to navigate
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Keyboard hint */}
      <div className="flex-shrink-0 text-center text-xs text-gray-600 pb-3">
        ← → to navigate · Esc to close
      </div>
    </div>
  );
}
