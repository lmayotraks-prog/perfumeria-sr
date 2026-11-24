// src/components/ui/IntensityBar.tsx
interface IntensityBarProps {
  value: number; // 0-100
  color?: string;
  height?: string;
}

export default function IntensityBar({
  value,
  color = 'linear-gradient(90deg, #9d7722, #e8c768)',
  height = '3px',
}: IntensityBarProps) {
  return (
    <div
      className="relative rounded-full overflow-hidden"
      style={{ height, background: 'var(--border-subtle)' }}
    >
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: `${value}%`,
          background: color,
          boxShadow: `0 0 8px rgba(184,142,52,${value / 220})`,
        }}
      />
    </div>
  );
}
