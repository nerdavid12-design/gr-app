import { Marker } from 'react-simple-maps'

const FACTION_COLORS = {
  'PISCES': '#8B4A42',
  'Schwarzkommando': '#4A6B58',
  'The Firm': '#5B6B8B',
  'Counterforce': '#7D6B4A',
  'ACHTUNG': '#7D6B4A',
  'Soviet': '#5a2d6b',
  'Civilian': '#6b6b6b',
  'SS': '#8B4A42',
  'IG Farben': '#5a4a2d',
  'German Military': '#4a4a3d',
  'US Navy': '#5B6B8B',
  'Zone': '#6b6b6b',
}

export default function MapMarker({ coordinates, character, isOrigin, onClick, onMouseEnter, onMouseLeave }) {
  const color = FACTION_COLORS[character.faction] || '#6b6b6b'
  const size = character.tier === 1 ? 14 : 9
  const half = size / 2

  return (
    <Marker coordinates={coordinates}>
      <g
        style={{ cursor: 'pointer' }}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {isOrigin ? (
          <rect
            x={-half}
            y={-half}
            width={size}
            height={size}
            rx={3}
            fill="none"
            stroke={color}
            strokeWidth={2}
          />
        ) : (
          <rect
            x={-half}
            y={-half}
            width={size}
            height={size}
            rx={3}
            fill={color}
          />
        )}
        {character.tier === 1 && (
          <text
            textAnchor="middle"
            y={half + 12}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '8px',
              fill: '#2C2420',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              pointerEvents: 'none',
            }}
          >
            {character.name.split(' ').pop()}
          </text>
        )}
      </g>
    </Marker>
  )
}

export function PlotMarker({ coordinates, name, onMouseEnter, onMouseLeave }) {
  return (
    <Marker coordinates={coordinates}>
      <g
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <rect
          x={-5}
          y={-5}
          width={10}
          height={10}
          rx={0}
          fill="#9B8B7B"
          transform="rotate(45)"
        />
        <text
          textAnchor="middle"
          y={14}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '7px',
            fill: '#9B8B7B',
            letterSpacing: '0.05em',
            pointerEvents: 'none',
          }}
        >
          {name}
        </text>
      </g>
    </Marker>
  )
}
