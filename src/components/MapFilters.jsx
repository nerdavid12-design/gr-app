const FACTION_COLORS = {
  'PISCES': '#8B4A42',
  'Schwarzkommando': '#4A6B58',
  'The Firm': '#5B6B8B',
  'ACHTUNG': '#7D6B4A',
  'Soviet': '#5a2d6b',
  'SS': '#8B4A42',
  'IG Farben': '#5a4a2d',
  'German Military': '#4a4a3d',
  'Civilian': '#6b6b6b',
  'US Navy': '#5B6B8B',
  'Zone': '#6b6b6b',
}

export default function MapFilters({ factions, factionFilter, onToggleFaction, showOrigins, onToggleOrigins, showTrails, onToggleTrails }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: 10,
        background: '#EDE8DC',
        border: '1px solid #D4C8BC',
        borderRadius: '6px',
        padding: '1rem',
        width: '200px',
      }}
    >
      {/* Header */}
      <div style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.5625rem',
        color: '#9B8B7B',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '0.75rem',
      }}>
        Filters
      </div>

      {/* Faction pills */}
      <div className="flex flex-wrap" style={{ gap: '0.375rem', marginBottom: '1rem' }}>
        {factions.map(f => {
          const active = factionFilter.size === 0 || factionFilter.has(f)
          const color = FACTION_COLORS[f] || '#6b6b6b'
          return (
            <button
              key={f}
              onClick={() => onToggleFaction(f)}
              style={{
                padding: '0.1875rem 0.375rem',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.5625rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: active ? `${color}22` : 'transparent',
                color: active ? color : '#D4C8BC',
                border: `1px solid ${active ? color : '#D4C8BC'}`,
                borderRadius: '3px',
                cursor: 'pointer',
                opacity: active ? 1 : 0.5,
              }}
            >
              {f}
            </button>
          )
        })}
      </div>

      {/* Toggles */}
      <div className="flex flex-col" style={{ gap: '0.5rem' }}>
        <label className="flex" style={{ alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showOrigins}
            onChange={onToggleOrigins}
            style={{ accentColor: '#6B6540' }}
          />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6875rem', color: '#2C2420' }}>
            Show origins
          </span>
        </label>
        <label className="flex" style={{ alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showTrails}
            onChange={onToggleTrails}
            style={{ accentColor: '#6B6540' }}
          />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6875rem', color: '#2C2420' }}>
            Show movement trails
          </span>
        </label>
      </div>
    </div>
  )
}
