import MealLibrary from '../components/meallibrary/MealLibrary.jsx';
import { useMeals } from '../lib/useData.js';

export default function LibraryPage() {
  const { meals, loading } = useMeals();
  if (loading) return <p className="muted">Loading…</p>;
  return (
    <>
      <h1 style={{ margin: '8px 0 14px', fontSize: '1.4rem' }}>Meal library</h1>
      <MealLibrary meals={meals} />
    </>
  );
}
