/**
 * Preload and decode an image before revealing it in GSAP timeline.
 * Returns a Promise that resolves when the image is ready.
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // decode() ensures the image is decoded before paint
      if (typeof img.decode === "function") {
        img.decode().then(() => resolve(img), () => resolve(img));
      } else {
        resolve(img);
      }
    };
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
}

/**
 * Batch preload multiple images.
 * Returns when ALL images are ready.
 */
export function preloadImages(srcs: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(srcs.map(preloadImage));
}
