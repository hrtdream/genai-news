"use client";

import type { MouseEvent } from "react";

type StoryImageCarouselProps = {
  images: string[];
  activeIndex: number;
  onChange: (nextIndex: number) => void;
  heightClassName: string;
  prevButtonClassName: string;
  nextButtonClassName: string;
  dotsWrapperClassName: string;
};

export default function StoryImageCarousel({
  images,
  activeIndex,
  onChange,
  heightClassName,
  prevButtonClassName,
  nextButtonClassName,
  dotsWrapperClassName,
}: StoryImageCarouselProps) {
  const totalImages = images.length;
  const currentImage =
    totalImages > 0 ? images[Math.min(activeIndex, totalImages - 1)] : null;

  const runAction = (event: MouseEvent<HTMLButtonElement>, action: () => void) => {
    event.preventDefault();
    action();
  };

  return (
    <div className={`relative bg-red-50 ${heightClassName}`}>
      {currentImage ? (
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url('${currentImage}')` }}
          aria-hidden="true"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
          No cover image
        </div>
      )}

      {totalImages > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous cover image"
            onClick={(event) =>
              runAction(event, () =>
                onChange((activeIndex - 1 + totalImages) % totalImages),
              )
            }
            className={prevButtonClassName}
          >
            {"<"}
          </button>
          <button
            type="button"
            aria-label="Next cover image"
            onClick={(event) =>
              runAction(event, () => onChange((activeIndex + 1) % totalImages))
            }
            className={nextButtonClassName}
          >
            {">"}
          </button>
          <div className={dotsWrapperClassName}>
            {images.map((_, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                aria-label={`Show image ${index + 1}`}
                onClick={(event) => runAction(event, () => onChange(index))}
                className={`h-1.5 w-1.5 cursor-pointer rounded-full transition-colors duration-200 ${
                  index === activeIndex ? "bg-white" : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
