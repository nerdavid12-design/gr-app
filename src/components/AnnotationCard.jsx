import useStore from '../context/ReaderContext'

const TYPE_COLORS = {
  'Historical': '#2c3e6b',
  'Organization': '#8b3030',
  'Object': '#7D6B4A',
  'Concept': '#5a2d6b',
  'Language': '#2d5a3d',
  'Historical Ref': '#2c3e6b',
}

export default function AnnotationCard({ annotationId }) {
  const annotation = useStore(s => s.getAnnotationById(annotationId))
  const closeSidebar = useStore(s => s.closeSidebar)

  if (!annotation) return null

  const typeColor = TYPE_COLORS[annotation.type] || '#2c3e6b'

  return (
    <div className="h-full overflow-y-auto flex flex-col" style={{ padding: '1.5rem', gap: '1.5rem' }}>
      {/* Close button */}
      <div className="flex" style={{ justifyContent: 'flex-end' }}>
        <button
          onClick={closeSidebar}
          className="transition-colors"
          style={{ color: '#928D86', padding: '0.25rem' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>close</span>
        </button>
      </div>

      {/* Term name */}
      <h2
        style={{ fontFamily: "'Newsreader', serif", fontSize: '1.75rem', color: '#1A1918', lineHeight: 1.25 }}
      >
        {annotation.term}
      </h2>

      {/* Type badge */}
      <div>
        <span
          style={{
            padding: '0.25rem 0.75rem',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            background: `${typeColor}1a`,
            color: typeColor,
            borderRadius: '2px',
          }}
        >
          {annotation.type}
        </span>
      </div>

      {/* Description */}
      <p
        style={{ fontFamily: "'Noto Serif', serif", fontSize: '1rem', color: '#4A4641', lineHeight: 1.6 }}
      >
        {annotation.description}
      </p>

      {/* Thematic connections */}
      {annotation.thematicConnections?.length > 0 && (
        <div>
          <div
            style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.625rem', color: '#928D86', marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            THEMATIC CONNECTIONS
          </div>
          <div className="flex flex-wrap" style={{ gap: '0.5rem' }}>
            {annotation.thematicConnections.map(tag => (
              <span
                key={tag}
                style={{
                  padding: '0.25rem 0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.625rem',
                  background: '#EDE9E2',
                  color: '#4A4641',
                  borderRadius: '2px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Source */}
      {annotation.source && (
        <div
          className="italic"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.625rem', color: '#928D86' }}
        >
          Source: {annotation.source}
        </div>
      )}
    </div>
  )
}
