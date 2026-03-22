export default function EpisodeDivider() {
  return (
    <div className="flex" style={{ alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '3rem 0' }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: 4,
            borderRadius: '9999px',
            background: '#D3CEC4',
          }}
        />
      ))}
    </div>
  )
}
