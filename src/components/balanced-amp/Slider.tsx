interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  unit?: string;
  format?: (v: number) => string;
}

export function Slider({ label, value, min, max, step = 0.01, onChange, unit, format }: Props) {
  const display = format ? format(value) : value.toFixed(2);
  return (
    <label className="flex flex-col gap-1 text-xs">
      <div className="flex items-baseline justify-between">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
        <span className="font-mono text-zinc-500 dark:text-zinc-400">{display}{unit ?? ""}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-accent"
      />
    </label>
  );
}
