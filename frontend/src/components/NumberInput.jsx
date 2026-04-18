export default function NumberInput({ value, onChange, min, max, step = 1, placeholder, unit, className = '' }) {
  const num = parseFloat(value) || 0;
  const decimals = (step.toString().split('.')[1] || '').length;

  const clamp = (v) => {
    let n = parseFloat(v);
    if (isNaN(n)) return value;
    if (min !== undefined) n = Math.max(min, n);
    if (max !== undefined) n = Math.min(max, n);
    return decimals > 0 ? parseFloat(n.toFixed(decimals)) : Math.round(n);
  };

  const inc = () => onChange(clamp(num + step));
  const dec = () => onChange(clamp(num - step));

  return (
    <div className={`number-input-wrap ${className}`}>
      <button type="button" className="number-btn" onClick={dec} onTouchEnd={e => { e.preventDefault(); dec(); }}>−</button>
      <div className="number-inner">
        <input
          type="number"
          className="number-field"
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onBlur={e => onChange(clamp(e.target.value))}
          min={min} max={max} step={step}
        />
        {unit && <span className="number-unit">{unit}</span>}
      </div>
      <button type="button" className="number-btn" onClick={inc} onTouchEnd={e => { e.preventDefault(); inc(); }}>+</button>
    </div>
  );
}
