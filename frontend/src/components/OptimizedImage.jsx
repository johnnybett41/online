import { useEffect, useState } from 'react';

const DEFAULT_FALLBACK =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="%23eef4fb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23708aa9" font-family="Arial, sans-serif" font-size="28">Image unavailable</text></svg>';

const OptimizedImage = ({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  className = '',
  priority = false,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  onError,
  ...rest
}) => {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
  }, [fallbackSrc, src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : loading}
      decoding={decoding}
      fetchPriority={fetchPriority || (priority ? 'high' : 'low')}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
        onError?.(event);
      }}
      {...rest}
    />
  );
};

export default OptimizedImage;
