import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import useStore from '../context/ReaderContext'

const FACTION_COLORS = {
  'PISCES': '#8b3030',
  'Schwarzkommando': '#2d5a3d',
  'The Firm': '#2c3e6b',
  'Counterforce': '#7D6B4A',
  'ACHTUNG': '#7D6B4A',
  'Soviet': '#5a2d6b',
  'Civilian': '#6b6b6b',
  'SS': '#802828',
  'IG Farben': '#5a4a2d',
  'German Military': '#4a4a3d',
  'US Navy': '#2c3e6b',
  'Zone': '#6b6b6b',
}

const EDGE_STYLES = {
  allied: { dash: false, width: 1.5 },
  adversarial: { dash: [5, 5], width: 1.5 },
  romantic: { dash: [2, 2], width: 1.5 },
  master_slave: { dash: false, width: 3 },
  colonial: { dash: false, width: 3 },
  manipulation: { dash: [8, 4], width: 1.5 },
  surveillance: { dash: [8, 4], width: 1 },
  family: { dash: [3, 3], width: 1 },
}

export default function CharacterGraph() {
  const graphOpen = useStore(s => s.graphOpen)
  const closeGraph = useStore(s => s.closeGraph)
  const characters = useStore(s => s.characters)
  const relationships = useStore(s => s.relationships)
  const openCharacterSidebar = useStore(s => s.openCharacterSidebar)

  const [factionFilter, setFactionFilter] = useState(new Set())
  const [spoilerFilter, setSpoilerFilter] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null)
  const graphRef = useRef(null)
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    if (graphOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDimensions({ width: rect.width, height: rect.height })
    }
  }, [graphOpen])

  const factions = useMemo(() => {
    const set = new Set()
    characters.forEach(c => set.add(c.faction))
    return Array.from(set)
  }, [characters])

  const toggleFaction = (f) => {
    setFactionFilter(prev => {
      const next = new Set(prev)
      if (next.has(f)) next.delete(f)
      else next.add(f)
      return next
    })
  }

  const graphData = useMemo(() => {
    let filteredChars = characters
    if (factionFilter.size > 0) {
      filteredChars = characters.filter(c => factionFilter.has(c.faction))
    }
    const charIds = new Set(filteredChars.map(c => c.id))

    const nodes = filteredChars.map(c => ({
      id: c.id,
      name: c.name,
      faction: c.faction,
      tier: c.tier,
      val: c.tier === 1 ? 8 : 4,
    }))

    const links = relationships
      .filter(r => charIds.has(r.source) && charIds.has(r.target))
      .map(r => ({
        source: r.source,
        target: r.target,
        types: r.types,
        label: r.label,
      }))

    return { nodes, links }
  }, [characters, relationships, factionFilter])

  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const color = FACTION_COLORS[node.faction] || '#6b6b6b'
    const size = node.tier === 1 ? 8 : 5
    const fontSize = Math.max(10 / globalScale, 3)

    // Draw node circle
    ctx.beginPath()
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()

    // Draw label
    ctx.font = `${fontSize}px Inter, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#1A1918'
    ctx.fillText(node.name.split(' ').pop(), node.x, node.y + size + 2)
  }, [])

  const linkCanvasObject = useCallback((link, ctx) => {
    const mainType = link.types?.[0] || 'allied'
    const style = EDGE_STYLES[mainType] || EDGE_STYLES.allied

    ctx.beginPath()
    ctx.strokeStyle = 'rgba(146, 141, 134, 0.4)'
    ctx.lineWidth = style.width

    if (style.dash) {
      ctx.setLineDash(style.dash)
    } else {
      ctx.setLineDash([])
    }

    const source = typeof link.source === 'object' ? link.source : { x: 0, y: 0 }
    const target = typeof link.target === 'object' ? link.target : { x: 0, y: 0 }

    ctx.moveTo(source.x, source.y)
    ctx.lineTo(target.x, target.y)
    ctx.stroke()
    ctx.setLineDash([])
  }, [])

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node.id)
    openCharacterSidebar(node.id)
  }, [openCharacterSidebar])

  if (!graphOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#F8F5F0' }}
    >
      {/* Header */}
      <div
        className="flex flex-shrink-0"
        style={{ alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid #D3CEC4' }}
      >
        <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
          <span
            className="material-symbols-outlined"
            style={{ color: '#7D6B4A', fontSize: 24 }}
          >
            account_tree
          </span>
          <h2
            style={{ fontFamily: "'Newsreader', serif", fontSize: '1.5rem', color: '#1A1918' }}
          >
            Relationship Map
          </h2>
        </div>
        <button onClick={closeGraph} style={{ color: '#928D86', padding: '0.5rem' }}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap flex-shrink-0" style={{ padding: '0.75rem 2rem', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #D3CEC4' }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.625rem', color: '#928D86', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          FACTIONS
        </span>
        {factions.map(f => {
          const active = factionFilter.size === 0 || factionFilter.has(f)
          const color = FACTION_COLORS[f] || '#6b6b6b'
          return (
            <button
              key={f}
              onClick={() => toggleFaction(f)}
              className="transition-opacity"
              style={{
                padding: '0.25rem 0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.625rem',
                background: active ? `${color}1a` : '#F3EFE9',
                color: active ? color : '#D3CEC4',
                border: 'none',
                borderRadius: '2px',
                cursor: 'pointer',
                opacity: active ? 1 : 0.5,
              }}
            >
              {f}
            </button>
          )
        })}

        <div className="flex" style={{ marginLeft: 'auto', alignItems: 'center', gap: '1rem' }}>
          {/* Legend */}
          <div className="flex" style={{ alignItems: 'center', gap: '0.75rem', fontFamily: "'Inter', sans-serif", fontSize: '0.5rem', color: '#928D86', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <span className="flex" style={{ alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ display: 'inline-block', width: 16, height: 2, background: '#928D86' }} /> Allied
            </span>
            <span className="flex" style={{ alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ display: 'inline-block', width: 16, height: 0, borderTop: '2px dashed #928D86' }} /> Adversarial
            </span>
            <span className="flex" style={{ alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ display: 'inline-block', width: 16, height: 0, borderTop: '2px dotted #928D86' }} /> Romantic
            </span>
            <span className="flex" style={{ alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ display: 'inline-block', width: 16, height: 3, background: '#928D86' }} /> Master/Slave
            </span>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div ref={containerRef} className="flex-1 relative">
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="transparent"
          nodeCanvasObject={nodeCanvasObject}
          linkCanvasObjectMode={() => 'replace'}
          linkCanvasObject={linkCanvasObject}
          onNodeClick={handleNodeClick}
          nodePointerAreaPaint={(node, color, ctx) => {
            const size = node.tier === 1 ? 8 : 5
            ctx.beginPath()
            ctx.arc(node.x, node.y, size + 4, 0, 2 * Math.PI)
            ctx.fillStyle = color
            ctx.fill()
          }}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          linkDirectionalParticles={0}
        />
      </div>
    </div>
  )
}
