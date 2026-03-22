import { useMemo } from 'react'

const PART_NAMES = ['PART I', 'PART II', 'PART III', 'PART IV']
const PART_EPISODES = [21, 8, 32, 12]

export default function MapTimeline({ currentPart, onPartChange }) {
  const totalEpisodes = useMemo(() => PART_EPISODES.reduce((a, b) => a + b, 0), [])

  const partOffsets = useMemo(() => {
    const offsets = []
    let acc = 0
    for (const count of PART_EPISODES) {
      offsets.push(acc / totalEpisodes * 100)
      acc += count
    }
    return offsets
  }, [totalEpisodes])

  return (
    <div
      className="flex-shrink-0"
      style={{
        padding: '0.75rem 2rem',
        borderTop: '1px solid #D4C8BC',
        background: '#EDE8DC',
      }}
    >
      {/* Part labels */}
      <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        {PART_NAMES.map((name, i) => (
          <button
            key={i}
            onClick={() => onPartChange(i)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.5625rem',
              color: currentPart === i ? '#2C2420' : '#9B8B7B',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: currentPart === i ? 600 : 400,
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Scrubber track */}
      <div style={{ position: 'relative', height: '20px' }}>
        {/* Track background */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '2px',
          background: '#D4C8BC',
          transform: 'translateY(-50%)',
        }} />

        {/* Part dividers */}
        {partOffsets.slice(1).map((offset, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${offset}%`,
              top: '20%',
              height: '60%',
              width: '1px',
              background: '#C8BFB0',
            }}
          />
        ))}

        {/* Active position indicator */}
        <div
          style={{
            position: 'absolute',
            left: `${partOffsets[currentPart] + (PART_EPISODES[currentPart] / totalEpisodes * 100) / 2}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '12px',
            height: '12px',
            borderRadius: '3px',
            background: '#9B8B7B',
            cursor: 'grab',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}
        />

        {/* Clickable regions for each part */}
        {PART_EPISODES.map((_, i) => (
          <div
            key={i}
            onClick={() => onPartChange(i)}
            style={{
              position: 'absolute',
              left: `${partOffsets[i]}%`,
              width: `${PART_EPISODES[i] / totalEpisodes * 100}%`,
              top: 0,
              height: '100%',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      {/* Current position label */}
      <div className="flex" style={{ justifyContent: 'space-between', marginTop: '0.375rem' }}>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.5625rem',
          color: '#9B8B7B',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          {PART_NAMES[currentPart]} — {PART_EPISODES[currentPart]} Episodes
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.5625rem',
          color: '#9B8B7B',
          letterSpacing: '0.05em',
        }}>
          {currentPart === 0 ? 'LAT: 51.5074° N / LONG: 0.1278° W / DEC 1944' :
           currentPart === 1 ? 'LAT: 43.7102° N / LONG: 7.2619° E / JAN 1945' :
           currentPart === 2 ? 'LAT: 51.1657° N / LONG: 10.4515° E / APR 1945' :
           'LAT: 52.5200° N / LONG: 13.4050° E / SEP 1945'}
        </div>
      </div>
    </div>
  )
}
