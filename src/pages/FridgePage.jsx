import FridgeScan from '../components/fridgescan/FridgeScan.jsx';
import { useMeals } from '../lib/useData.js';

export default function FridgePage() {
  const { meals } = useMeals();
  return (
    <>
      <h1 style={{ margin: '8px 0 14px', fontSize: '1.4rem' }}>Fridge scan</h1>
      <FridgeScan meals={meals} />
    </>
  );
}
