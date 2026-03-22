export default function MapTooltip({ character, location, position }) {
  if (!character || !position) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x + 12,
        top: position.y - 8,
        zIndex: 100,
        background: '#EDE8DC',
        border: '1px solid #D4C8BC',
        borderRadius: '6px',
        padding: '0.625rem 0.75rem',
        pointerEvents: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        maxWidth: '200px',
      }}
    >
      <div style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '0.875rem', color: '#2C2420' }}>
        {character.name}
      </div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.5625rem', color: '#9B8B7B', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.125rem' }}>
        {character.faction}
      </div>
      {location && (
        <div style={{ fontFamily: "'Noto Serif', serif", fontSize: '0.75rem', color: '#2C2420', marginTop: '0.375rem' }}>
          {location.placeName || location.name}
        </div>
      )}
    </div>
  )
}
