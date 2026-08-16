import React, { useEffect, useState } from 'react';
import BrewList from './components/BrewList';
import BrewForm from './components/BrewForm';
import Filter from './components/Filter';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function App() {
  const [brews, setBrews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [filterMethod, setFilterMethod] = useState('');

  async function fetchBrews(method = '') {
    setLoading(true);
    const q = method ? `?method=${encodeURIComponent(method)}` : '';
    const res = await fetch(`${API_BASE}/api/brews${q}`);
    const data = await res.json();
    setBrews(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchBrews(filterMethod);
  }, [filterMethod]);

  useEffect(() => {
    document.title = `Brews: ${brews.length}`;
  }, [brews]);

  const handleCreate = async (brew) => {
    const res = await fetch(`${API_BASE}/api/brews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brew)
    });
    if (res.ok) {
      fetchBrews(filterMethod);
    } else {
      const err = await res.json();
      alert('Create failed: ' + (err.error || res.status));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this brew?')) return;
    const res = await fetch(`${API_BASE}/api/brews/${id}`, { method: 'DELETE' });
    if (res.status === 204) {
      fetchBrews(filterMethod);
    } else {
      alert('Delete failed');
    }
  };

  const handleEdit = (brew) => {
    setEditing(brew);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async (id, brew) => {
    const res = await fetch(`${API_BASE}/api/brews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brew)
    });
    if (res.ok) {
      setEditing(null);
      fetchBrews(filterMethod);
    } else {
      const err = await res.json();
      alert('Update failed: ' + (err.error || res.status));
    }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-3">Brews: {brews.length}</h1>

      <BrewForm
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        editing={editing}
        onCancel={() => setEditing(null)}
      />

      <div className="my-3 d-flex justify-content-between align-items-center">
        <Filter value={filterMethod} onChange={(v) => setFilterMethod(v)} />
        <div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => fetchBrews(filterMethod)}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? <div>Loading...</div> : (
        <BrewList brews={brews} onDelete={handleDelete} onEdit={handleEdit} />
      )}
    </div>
  );
}
