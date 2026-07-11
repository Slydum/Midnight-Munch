export default function ProgressBar({ value, max, over = false }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="progress-track" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div className={`progress-fill${over ? ' over' : ''}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
