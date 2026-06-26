import type { ReactNode } from 'react';
import { adminStyles } from '../../utils/tailwindStyles';

interface AdminStatsCard {
  label: string;
  value: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
}

interface AdminStatsGridProps {
  cards: AdminStatsCard[];
  className?: string;
}

export function AdminStatsGrid({ cards, className = adminStyles.statsGrid }: AdminStatsGridProps) {
  return (
    <section className={className} aria-label="Resumo administrativo">
      {cards.map((card) => (
        <article key={card.label} className={adminStyles.statCard}>
          <div>
            <span className={adminStyles.statLabel}>{card.label}</span>
            <strong className={adminStyles.statValue}>{card.value}</strong>
            {card.description}
          </div>
          {card.icon}
        </article>
      ))}
    </section>
  );
}
