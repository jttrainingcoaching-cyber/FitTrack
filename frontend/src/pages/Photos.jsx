import { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

export default function Photos() {
  const { addToast } = useToast();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], notes: '', photo_data: null });
  const [previewSrc, setPreviewSrc] = useState(null);
  const [compareA, setCompareA] = useState(null);
  const [compareB, setCompareB] = useState(null);
  const [comparing, setComparing] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    api.get('/photos')
      .then(r => setPhotos(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      addToast('Image must be under 10MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewSrc(ev.target.result);
      setForm(f => ({ ...f, photo_data: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!form.photo_data) {
      addToast('Please select a photo first', 'error');
      return;
    }
    setUploading(true);
    try {
      const r = await api.post('/photos', form);
      // Re-fetch to get full data
      const all = await api.get('/photos');
      setPhotos(all.data);
      setForm({ date: new Date().toISOString().split('T')[0], notes: '', photo_data: null });
      setPreviewSrc(null);
      if (fileRef.current) fileRef.current.value = '';
      addToast('Photo saved!', 'success');
    } catch {
      addToast('Failed to save photo', 'error');
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this photo?')) return;
    try {
      await api.delete(`/photos/${id}`);
      setPhotos(prev => prev.filter(p => p.id !== id));
      if (compareA?.id === id) setCompareA(null);
      if (compareB?.id === id) setCompareB(null);
      addToast('Photo deleted', 'success');
    } catch {
      addToast('Failed to delete', 'error');
    }
  };

  const selectForCompare = (photo) => {
    if (!comparing) return;
    if (!compareA) {
      setCompareA(photo);
    } else if (!compareB && compareA.id !== photo.id) {
      setCompareB(photo);
    } else if (compareA.id === photo.id) {
      setCompareA(null);
    } else if (compareB?.id === photo.id) {
      setCompareB(null);
    } else {
      // Replace B with new selection
      setCompareB(photo);
    }
  };

  const isSelected = (photo) => compareA?.id === photo.id || compareB?.id === photo.id;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Progress Photos</h1>
        <p>Track your visual transformation over time</p>
      </div>

      {/* Privacy notice */}
      <div style={{
        padding: '0.65rem 1rem', marginBottom: '1.25rem',
        background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)',
        borderRadius: 10, fontSize: '0.78rem', color: 'var(--text-muted)',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <span>🔒</span>
        <span>Your photos are private and stored only on your device's database</span>
      </div>

      {/* Upload section */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="section-title">Upload Photo</div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="form-group">
              <label className="form-label">Photo</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{
                  width: '100%', padding: '0.7rem 0.9rem',
                  background: 'var(--bg-elevated)',
                  border: '1.5px solid var(--border)', borderRadius: 10,
                  color: 'var(--text)', fontSize: '0.85rem',
                  cursor: 'pointer', minHeight: 44,
                }}
              />
            </div>
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Date</label>
                <input
                  className="form-input" type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Notes (optional)</label>
                <input
                  className="form-input" type="text"
                  placeholder="e.g. Week 4, morning"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.85rem' }}
              onClick={handleUpload}
              disabled={uploading || !form.photo_data}
            >
              {uploading ? 'Saving…' : 'Save Photo'}
            </button>
          </div>
          {previewSrc && (
            <div style={{
              width: 160, height: 200, borderRadius: 12, overflow: 'hidden',
              border: '2px solid var(--border)', flexShrink: 0,
            }}>
              <img src={previewSrc} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>
      </div>

      {/* Photos grid */}
      {loading
        ? <div className="empty">Loading...</div>
        : photos.length === 0
          ? <div className="card"><div className="empty"><div className="empty-icon">📸</div>No photos yet — upload your first progress photo above</div></div>
          : <>
              {/* Compare controls */}
              <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Side-by-Side Comparison</div>
                    {comparing
                      ? <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          Click photos below to select them for comparison
                        </div>
                      : <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          Enable to compare two photos side-by-side
                        </div>
                    }
                  </div>
                  <button
                    className={`btn ${comparing ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setComparing(v => !v); setCompareA(null); setCompareB(null); }}
                  >
                    {comparing ? 'Done Comparing' : 'Compare Photos'}
                  </button>
                </div>

                {/* Comparison view */}
                {comparing && compareA && compareB && (
                  <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {[compareA, compareB].map((p, i) => (
                      <div key={p.id} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                          Photo {i + 1}
                        </div>
                        <div style={{ borderRadius: 12, overflow: 'hidden', border: '2px solid var(--indigo)', aspectRatio: '3/4' }}>
                          <img src={p.photo_data} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                          {p.date}
                          {p.notes && <span style={{ display: 'block' }}>{p.notes}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {comparing && (!compareA || !compareB) && (
                  <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.875rem', background: 'rgba(99,102,241,0.08)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Select {!compareA ? 'a first' : 'a second'} photo from the grid below
                  </div>
                )}
              </div>

              {/* Photos grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.85rem' }}>
                {photos.map(photo => (
                  <div
                    key={photo.id}
                    style={{
                      position: 'relative',
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: `2px solid ${isSelected(photo) ? 'var(--indigo)' : 'var(--border)'}`,
                      cursor: comparing ? 'pointer' : 'default',
                      transition: 'border-color 0.15s',
                      aspectRatio: '3/4',
                    }}
                    onClick={() => comparing && selectForCompare(photo)}
                  >
                    <img
                      src={photo.photo_data}
                      alt={photo.notes || photo.date}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    {/* Overlay */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      padding: '0.5rem 0.6rem',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#fff' }}>{photo.date}</div>
                      {photo.notes && <div style={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.1rem' }}>{photo.notes}</div>}
                    </div>
                    {/* Selection badge */}
                    {isSelected(photo) && (
                      <div style={{
                        position: 'absolute', top: '0.4rem', right: '0.4rem',
                        width: 24, height: 24, borderRadius: '50%',
                        background: 'var(--indigo)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, color: '#fff',
                      }}>
                        {compareA?.id === photo.id ? '1' : '2'}
                      </div>
                    )}
                    {/* Delete button (only when not comparing) */}
                    {!comparing && (
                      <button
                        onClick={() => handleDelete(photo.id)}
                        style={{
                          position: 'absolute', top: '0.4rem', right: '0.4rem',
                          width: 28, height: 28, borderRadius: 6,
                          background: 'rgba(239,68,68,0.85)',
                          border: 'none', color: '#fff',
                          cursor: 'pointer', fontSize: '0.75rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
      }
    </div>
  );
}
