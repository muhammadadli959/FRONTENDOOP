import { useState } from 'react';
import { Star } from 'lucide-react';

interface Props {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: number;
}

export default function StarRating({ value, onChange, readonly = false, size = 20 }: Props) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => {
        const filled = readonly ? star <= value : star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}`}
          >
            <Star
              size={size}
              className={filled ? 'text-amber-400' : 'text-gray-600'}
              fill={filled ? 'currentColor' : 'none'}
            />
          </button>
        );
      })}
    </div>
  );
}
