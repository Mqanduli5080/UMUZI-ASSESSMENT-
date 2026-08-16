import React from 'react';
import BrewItem from './BrewItem';

export default function BrewList({ brews, onDelete, onEdit }) {
  if (!brews.length) return <div className="text-muted">No brews yet.</div>;

  return (
    <div className="row row-cols-1 row-cols-md-2 g-3">
      {brews.map(b => (
        <div key={b.id} className="col">
          <BrewItem brew={b} onDelete={() => onDelete(b.id)} onEdit={() => onEdit(b)} />
        </div>
      ))}
    </div>
  );
}
