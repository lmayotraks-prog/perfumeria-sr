// src/components/ui/StarRating.tsx
interface StarRatingProps {
  rating: number;
  reviews?: number;
  size?: 'sm' | 'md';
}

export default function StarRating({ rating, reviews, size = 'sm' }: StarRatingProps) {
  const starSize = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5';
  const full = Math.floor(rating);
  const partial = rating - full;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => {
          const fill =
            i < full ? 100 : i === full && partial > 0 ? Math.round(partial * 100) : 0;
          return (
            <div key={i} className={`relative ${starSize}`}>
              <div
                className="absolute inset-0"
                style={{
                  clipPath:
                    'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                  background: 'var(--border-subtle)',
                }}
              />
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill}%` }}>
                <div
                  className="absolute inset-0"
                  style={{
                    width: `${100 / (fill / 100 || 1)}%`,
                    clipPath:
                      'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                    background: 'linear-gradient(135deg, #b88e34, #f0c966)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {reviews !== undefined && (
        <span className="font-sans text-[11px] font-light" style={{ color: 'var(--text-muted)' }}>
          ({reviews.toLocaleString('es')})
        </span>
      )}
    </div>
  );
}
