import { useEffect, useState } from 'react';

export function SmartImage({ src, fallback, alt, className = '', loading = 'lazy', ...props }) {
  const [current, setCurrent] = useState(src || fallback);

  useEffect(() => {
    setCurrent(src || fallback);
  }, [src, fallback]);

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => {
        if (fallback && current !== fallback) {
          setCurrent(fallback);
        }
      }}
      {...props}
    />
  );
}
