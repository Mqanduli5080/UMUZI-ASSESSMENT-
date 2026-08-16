import React, { useEffect, useState } from 'react';

const METHODS = ['Pour Over', 'Espresso', 'French Press', 'Aeropress', 'Cold Brew'];

export default function BrewForm({ onCreate, editing, onUpdate, onCancel }) {
  const [method, setMethod] = useState('');
  const [beans, setBeans] = useState('');
  const [dose, setDose] = useState('');
  const [yieldVal, setYieldVal] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editing) {
      setMethod(editing.method);
      setBeans(editing.beans);
      setDose(editing.dose);
      setYieldVal(editing.yield);
      setTime(editing.time);
      setNotes(editing.notes);
    } else {
      setMethod('');
      setBeans('');
      setDose('');
      setYieldVal('');
      setTime('');
      setNotes('');
    }
  }, [editing]);

  function isValid() {
    return method && beans && dose !== '' && yieldVal !== '' && time !== '' && notes;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid()) {
      alert('Please fill all fields.');
      return;
    }
    const payload = {
      method, beans, dose: Number(dose), yield: Number(yieldVal), time: Number(time), notes
    };
    if (editing) {
      onUpdate(editing.id, payload);
    } else {
      onCreate(payload);
    }
  }

  return (
    <form className="card p-3 mb-3" onSubmit={handleSubmit}>
      <div className="d-flex justify-content-between align-items-start">
        <h5>{editing ? 'Edit Brew' : 'New Brew'}</h5>
        {editing && <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onCancel}>Cancel</button>}
      </div>

      <div className="row g-2 mt-2">
        <div className="col-12 col-md-4">
          <label className="form-label">Method</label>
          <select className="form-select" value={method} onChange={e => setMethod(e.target.value)}>
            <option value="">Choose method</option>
            {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="col-12 col-md-8">
          <label className="form-label">Beans</label>
          <input className="form-control" value={beans} onChange={e => setBeans(e.target.value)} placeholder="Origin / roast" />
        </div>

        <div className="col-6 col-md-2">
          <label className="form-label">Dose (g)</label>
          <input type="number" min="0" step="0.1" className="form-control" value={dose} onChange={e => setDose(e.target.value)} />
        </div>

        <div className="col-6 col-md-2">
          <label className="form-label">Yield (g)</label>
          <input type="number" min="0" step="1" className="form-control" value={yieldVal} onChange={e => setYieldVal(e.target.value)} />
        </div>

        <div className="col-6 col-md-2">
          <label className="form-label">Time (s)</label>
          <input type="number" min="0" step="1" className="form-control" value={time} onChange={e => setTime(e.target.value)} />
        </div>

        <div className="col-12">
          <label className="form-label">Notes</label>
          <textarea className="form-control" rows="2" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="mt-3">
        <button className="btn btn-primary" type="submit" disabled={!isValid()}>
          {editing ? 'Update Brew' : 'Create Brew'}
        </button>
      </div>
    </form>
  );
}
