import { useState, useMemo, useCallback } from 'react'
import { ComposableMap, Geographies, Geography, Line, ZoomableGroup } from 'react-simple-maps'
import useStore from '../context/ReaderContext'
import locationData from '../data/character_locations.json'
import MapMarker, { PlotMarker } from './MapMarker'
import MapTooltip from './MapTooltip'
import MapTimeline from './MapTimeline'
import MapFilters from './MapFilters'
import MapLegend from './MapLegend'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const FACTION_COLORS = {
  'PISCES': '#8B4A42',
  'Schwarzkommando': '#4A6B58',
  'The Firm': '#5B6B8B',
  'ACHTUNG': '#7D6B4A',
  'Soviet': '#5a2d6b',
  'SS': '#8B4A42',
  'Civilian': '#6b6b6b',
  'IG Farben': '#5a4a2d',
  'German Military': '#4a4a3d',
  'US Navy': '#5B6B8B',
  'Zone': '#6b6b6b',
}

export default function GlobalMap() {
  const mapOpen = useStore(s => s.mapOpen)
  const closeMap = useStore(s => s.closeMap)
  const navigateHome = useStore(s => s.navigateHome)
  const characters = useStore(s => s.characters)
  const currentPart = useStore(s => s.currentPart)
  const openCharacterSidebar = useStore(s => s.openCharacterSidebar)

  const [timelinePart, setTimelinePart] = useState(currentPart)
  const [factionFilter, setFactionFilter] = useState(new Set())
  const [showOrigins, setShowOrigins] = useState(true)
  const [showTrails, setShowTrails] = useState(true)
  const [tooltip, setTooltip] = useState(null)

  const factions = useMemo(() => {
    const set = new Set()
    characters.forEach(c => set.add(c.faction))
    return Array.from(set)
  }, [characters])

  const toggleFaction = useCallback((f) => {
    setFactionFilter(prev => {
      const next = new Set(prev)
      if (next.has(f)) next.delete(f)
      else next.add(f)
      return next
    })
  }, [])

  // Build visible markers for current timeline position
  const mapData = useMemo(() => {
    const charMap = new Map(characters.map(c => [c.id, c]))
    const results = []

    for (const charLoc of locationData.characters) {
      const character = charMap.get(charLoc.characterId)
      if (!character) continue
      if (factionFilter.size > 0 && !factionFilter.has(character.faction)) continue

      // Find current location for selected part
      const currentLoc = charLoc.locations.find(l => l.part === timelinePart + 1)
      // Find previous location for trail
      const prevLoc = charLoc.locations.find(l => l.part === timelinePart)

      const origin = charLoc.origin

      results.push({
        character,
        origin,
        currentLoc,
        prevLoc,
      })
    }

    return results
  }, [characters, factionFilter, timelinePart])

  const handleMarkerHover = useCallback((character, location, e) => {
    setTooltip({ character, location, position: { x: e.clientX, y: e.clientY } })
  }, [])

  const handleMarkerLeave = useCallback(() => {
    setTooltip(null)
  }, [])

  const handleMarkerClick = useCallback((charId) => {
    openCharacterSidebar(charId)
  }, [openCharacterSidebar])

  if (!mapOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#F2EDE4' }}
    >
      {/* Header */}
      <div
        className="flex flex-shrink-0"
        style={{ alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid #C8BFB0' }}
      >
        <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={navigateHome}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontFamily: "'Newsreader', serif",
              fontSize: '1.125rem',
              fontStyle: 'italic',
              color: '#7D6B4A',
              fontWeight: 400,
            }}
            title="Back to Home"
          >
            GR
          </button>
          <span style={{ color: '#D4C8BC', fontSize: '1.25rem', fontWeight: 200 }}>/</span>
          <span
            className="material-symbols-outlined"
            style={{ color: '#7D6B4A', fontSize: 24 }}
          >
            public
          </span>
          <div>
            <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: '1.5rem', color: '#2C2420' }}>
              Global Character Map
            </h2>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.5625rem',
              color: '#9B8B7B',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              Geographical Intelligence // Active Theatre
            </div>
          </div>
        </div>
        <button onClick={closeMap} style={{ color: '#9B8B7B', padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Map area */}
      <div className="flex-1 relative" style={{ overflow: 'hidden' }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            center: [10, 45],
            scale: 400,
          }}
          style={{ width: '100%', height: '100%', background: '#E8E0D4' }}
        >
          <ZoomableGroup>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#F2EDE4"
                    stroke="#C8BFB0"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: '#EDE8DC' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Movement trails */}
            {showTrails && mapData.map(({ character, currentLoc, prevLoc }) => {
              if (!currentLoc?.coordinates || !prevLoc?.coordinates) return null
              if (currentLoc.coordinates[0] === prevLoc.coordinates[0] && currentLoc.coordinates[1] === prevLoc.coordinates[1]) return null
              const color = FACTION_COLORS[character.faction] || '#6b6b6b'
              return (
                <Line
                  key={`trail-${character.id}`}
                  from={prevLoc.coordinates}
                  to={currentLoc.coordinates}
                  stroke={color}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeDasharray="4 3"
                  strokeOpacity={0.25}
                />
              )
            })}

            {/* Origin trails to current */}
            {showTrails && showOrigins && mapData.map(({ character, origin, currentLoc }) => {
              if (!origin?.coordinates || !currentLoc?.coordinates) return null
              if (origin.coordinates[0] === currentLoc.coordinates[0] && origin.coordinates[1] === currentLoc.coordinates[1]) return null
              // Don't draw if there's already a prev trail going to the same place
              const color = FACTION_COLORS[character.faction] || '#6b6b6b'
              return (
                <Line
                  key={`origin-trail-${character.id}`}
                  from={origin.coordinates}
                  to={currentLoc.coordinates}
                  stroke={color}
                  strokeWidth={1}
                  strokeLinecap="round"
                  strokeDasharray="2 4"
                  strokeOpacity={0.15}
                />
              )
            })}

            {/* Plot location markers */}
            {locationData.plotLocations.map((pl) => (
              <PlotMarker
                key={pl.name}
                coordinates={pl.coordinates}
                name={pl.name}
                onMouseEnter={(e) => setTooltip({
                  character: { name: pl.name, faction: 'Plot Location' },
                  location: { placeName: pl.description },
                  position: { x: e.clientX, y: e.clientY },
                })}
                onMouseLeave={handleMarkerLeave}
              />
            ))}

            {/* Origin markers */}
            {showOrigins && mapData.map(({ character, origin, currentLoc }) => {
              if (!origin?.coordinates) return null
              // Don't show origin if it's the same as current location
              if (currentLoc?.coordinates &&
                  origin.coordinates[0] === currentLoc.coordinates[0] &&
                  origin.coordinates[1] === currentLoc.coordinates[1]) return null
              return (
                <MapMarker
                  key={`origin-${character.id}`}
                  coordinates={origin.coordinates}
                  character={character}
                  isOrigin={true}
                  onClick={() => handleMarkerClick(character.id)}
                  onMouseEnter={(e) => handleMarkerHover(character, origin, e)}
                  onMouseLeave={handleMarkerLeave}
                />
              )
            })}

            {/* Current location markers */}
            {mapData.map(({ character, currentLoc }) => {
              if (!currentLoc?.coordinates) return null
              return (
                <MapMarker
                  key={`current-${character.id}`}
                  coordinates={currentLoc.coordinates}
                  character={character}
                  isOrigin={false}
                  onClick={() => handleMarkerClick(character.id)}
                  onMouseEnter={(e) => handleMarkerHover(character, currentLoc, e)}
                  onMouseLeave={handleMarkerLeave}
                />
              )
            })}
          </ZoomableGroup>
        </ComposableMap>

        {/* Filters panel */}
        <MapFilters
          factions={factions}
          factionFilter={factionFilter}
          onToggleFaction={toggleFaction}
          showOrigins={showOrigins}
          onToggleOrigins={() => setShowOrigins(!showOrigins)}
          showTrails={showTrails}
          onToggleTrails={() => setShowTrails(!showTrails)}
        />

        {/* Legend */}
        <MapLegend />

        {/* Tooltip */}
        {tooltip && (
          <MapTooltip
            character={tooltip.character}
            location={tooltip.location}
            position={tooltip.position}
          />
        )}
      </div>

      {/* Timeline scrubber */}
      <MapTimeline
        currentPart={timelinePart}
        onPartChange={setTimelinePart}
      />
    </div>
  )
}
