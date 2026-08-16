import React from 'react';

const METHODS = ['', 'Pour Over', 'Espresso', 'French Press', 'Aeropress', 'Cold Brew'];

export default function Filter({ value, onChange }) {
  return (
    <div className="d-flex gap-2 align-items-center">
      <label className="mb-0 me-1">Filter:</label>
      <select className="form-select form-select-sm" style={{ width: 200 }} value={value} onChange={e => onChange(e.target.value)}>
        {METHODS.map(m => <option key={m} value={m}>{m === '' ? 'All methods' : m}</option>)}
      </select>
    </div>
  );
}
