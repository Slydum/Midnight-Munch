import Badge from '../shared/Badge.jsx';
import ProgressBar from '../shared/ProgressBar.jsx';
import { nutritionStatus, NUTRITION_TAGS } from '../../lib/mealGenerator.js';

const TAG_LABELS = {
  protein: 'Protein',
  B12: 'B12',
  iron: 'Iron',
  'omega-3': 'Omega-3',
};

// Weekly-average nutrition flags — simple "on track / low" badges,
// deliberately not calorie or macro counting.
export default function NutritionFlags({ plan, mealsById, compact = false }) {
  if (!plan) return <p className="muted">No plan yet — generate one to see nutrition flags.</p>;
  const status = nutritionStatus(plan, mealsById);

  if (compact) {
    return (
      <div className="row">
        {NUTRITION_TAGS.map((tag) => (
          <Badge key={tag} kind={status[tag].onTrack ? 'ok' : 'low'}>
            {TAG_LABELS[tag]}: {status[tag].onTrack ? 'on track' : 'low this week'}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">Nutrition · weekly average</div>
      {NUTRITION_TAGS.map((tag) => {
        const s = status[tag];
        return (
          <div key={tag} style={{ marginBottom: 10 }}>
            <div className="row-between" style={{ marginBottom: 4 }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{TAG_LABELS[tag]}</span>
              <Badge kind={s.onTrack ? 'ok' : 'low'}>{s.onTrack ? 'on track' : 'low this week'}</Badge>
            </div>
            <ProgressBar value={s.share} max={s.target} over={!s.onTrack} />
          </div>
        );
      })}
      <p className="muted">Balanced across the whole week — no single meal needs to tick every box.</p>
    </div>
  );
}
