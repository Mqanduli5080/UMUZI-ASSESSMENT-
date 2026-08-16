import React from 'react';

export default function BrewItem({ brew, onDelete, onEdit }) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between">
          <h5 className="card-title mb-1">{brew.method}</h5>
          <small className="text-muted">{new Date(brew.createdAt).toLocaleString()}</small>
        </div>
        <h6 className="card-subtitle mb-2 text-muted">{brew.beans}</h6>
        <p className="mb-1">
          <strong>Dose:</strong> {brew.dose} g &nbsp; <strong>Yield:</strong> {brew.yield} g &nbsp; <strong>Time:</strong> {brew.time}s
        </p>
        <p className="card-text text-truncate" title={brew.notes}>{brew.notes}</p>
      </div>
      <div className="card-footer d-flex justify-content-end gap-2">
        <button className="btn btn-outline-secondary btn-sm" onClick={onEdit}>Edit</button>
        <button className="btn btn-outline-danger btn-sm" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
