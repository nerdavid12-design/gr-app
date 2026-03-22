const FACTION_COLORS = {
  'PISCES': '#8B4A42',
  'Schwarzkommando': '#4A6B58',
  'The Firm': '#5B6B8B',
  'ACHTUNG': '#7D6B4A',
  'Soviet': '#5a2d6b',
  'SS': '#8B4A42',
  'German Military': '#4a4a3d',
  'Civilian': '#6b6b6b',
  'US Navy': '#5B6B8B',
  'Zone': '#6b6b6b',
  'IG Farben': '#5a4a2d',
}

export default function MapLegend() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '1rem',
        right: '1rem',
        zIndex: 10,
        background: '#EDE8DC',
        border: '1px solid #D4C8BC',
        borderRadius: '6px',
        padding: '0.875rem 1rem',
        width: '180px',
      }}
    >
      {/* Header */}
      <div style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.5625rem',
        color: '#9B8B7B',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '0.625rem',
      }}>
        Map Legend
      </div>

      {/* Marker types */}
      <div className="flex flex-col" style={{ gap: '0.375rem', marginBottom: '0.75rem' }}>
        <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#7D6B4A', flexShrink: 0 }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.625rem', color: '#2C2420' }}>
            Current location
          </span>
        </div>
        <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, border: '2px solid #7D6B4A', flexShrink: 0 }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.625rem', color: '#2C2420' }}>
            Origin
          </span>
        </div>
        <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 16, height: 0, borderTop: '2px dashed rgba(125,107,74,0.4)', flexShrink: 0 }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.625rem', color: '#2C2420' }}>
            Movement trail
          </span>
        </div>
        <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 10, height: 10, background: '#9B8B7B', transform: 'rotate(45deg)', flexShrink: 0 }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.625rem', color: '#2C2420' }}>
            Plot location
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#D4C8BC', marginBottom: '0.625rem' }} />

      {/* Faction colors */}
      <div className="flex flex-col" style={{ gap: '0.25rem' }}>
        {Object.entries(FACTION_COLORS).map(([name, color]) => (
          <div key={name} className="flex" style={{ alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.5625rem', color: '#9B8B7B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
