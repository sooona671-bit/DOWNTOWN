import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { imageSlots } from '../image-assets.js';
import assetMap from '../asset-map.json';
const resolveAsset = (path) => assetMap[path] || path;

export default function ContentImage({
  src,
  alt,
  className = '',
  fallbackSrc = imageSlots.fallbacks.food,
  loading = 'lazy',
  showFallbackIcon = true,
}) {
  const [failedSource, setFailedSource] = useState('');
  const source = src || fallbackSrc;
  const useFallback = source === fallbackSrc || failedSource === source;

  if (useFallback && failedSource === fallbackSrc) {
    return <span className={`content-image-fallback ${className}`} role="img" aria-label={alt || 'Image unavailable'}>
      {showFallbackIcon && <ImageOff aria-hidden="true" />}
    </span>;
  }

  return <img
    className={className}
    src={resolveAsset(useFallback ? fallbackSrc : source)}
    alt={alt}
    loading={loading}
    decoding="async"
    onError={() => setFailedSource(useFallback ? fallbackSrc : source)}
  />;
}
