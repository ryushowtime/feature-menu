import { ClientOnly } from '../../components/ClientOnly';
import { Stats } from '../pages/Stats';

export default function StatsPage() {
  return (
    <ClientOnly fallback={<div className="flex-1" />}>
      <Stats />
    </ClientOnly>
  );
}
