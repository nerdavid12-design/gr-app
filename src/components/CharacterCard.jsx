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

export default function CharacterCard({ characterId }) {
  const character = useStore(s => s.getCharacterById(characterId))
  const getRelationshipsForCharacter = useStore(s => s.getRelationshipsForCharacter)
  const openCharacterSidebar = useStore(s => s.openCharacterSidebar)
  const closeSidebar = useStore(s => s.closeSidebar)
  const openChat = useStore(s => s.openChat)
  const addChatMessage = useStore(s => s.addChatMessage)
  const characters = useStore(s => s.characters)

  if (!character) return null

  const rels = getRelationshipsForCharacter(characterId)
  const factionColor = FACTION_COLORS[character.faction] || '#6b6b6b'

  const handleAskClaude = () => {
    addChatMessage({
      role: 'user',
      content: `Tell me about ${character.name}`,
      timestamp: Date.now(),
    })
    openChat()
  }

  const getRelatedCharName = (rel) => {
    const otherId = rel.source === characterId ? rel.target : rel.source
    const other = characters.find(c => c.id === otherId)
    return other ? other.name : otherId
  }

  const getRelatedCharId = (rel) => {
    return rel.source === characterId ? rel.target : rel.source
  }

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

      {/* Name */}
      <h2
        style={{ fontFamily: "'Newsreader', serif", fontSize: '1.75rem', color: '#1A1918', lineHeight: 1.25 }}
      >
        {character.name}
      </h2>

      {/* Faction badge */}
      <div className="flex" style={{ alignItems: 'center', gap: '0.75rem' }}>
        <span
          style={{
            padding: '0.25rem 0.75rem',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            background: `${factionColor}1a`,
            color: factionColor,
            borderRadius: '2px',
          }}
        >
          {character.faction}
        </span>
        <span
          style={{ fontFamily: "'Inter', sans-serif", color: '#928D86', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          TIER {character.tier}
        </span>
      </div>

      {/* Description */}
      <p
        style={{ fontFamily: "'Noto Serif', serif", fontSize: '1rem', color: '#4A4641', lineHeight: 1.6 }}
      >
        {character.description}
      </p>

      {/* Metadata */}
      <div className="flex" style={{ gap: '2rem' }}>
        <div>
          <div
            style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.625rem', color: '#928D86', marginBottom: '0.25rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            FIRST APPEARED
          </div>
          <div style={{ fontFamily: "'Noto Serif', serif", fontSize: '0.875rem', color: '#1A1918' }}>
            Part {character.firstAppeared.part}, Ep. {character.firstAppeared.episode}
          </div>
        </div>
        <div>
          <div
            style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.625rem', color: '#928D86', marginBottom: '0.25rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            STATUS
          </div>
          <div className="flex" style={{ alignItems: 'center', gap: '0.5rem', fontFamily: "'Noto Serif', serif", fontSize: '0.875rem', color: '#1A1918' }}>
            <span
              className="inline-block"
              style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', background: character.status === 'Deceased' ? '#ba1a1a' : '#2d5a3d' }}
            />
            {character.status}
          </div>
        </div>
      </div>

      {/* Relationships */}
      {rels.length > 0 && (
        <div>
          <div
            style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.625rem', color: '#928D86', marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            PRIMARY RELATIONSHIPS
          </div>
          <div className="flex flex-col" style={{ gap: '0.75rem' }}>
            {rels.map(rel => (
              <div key={rel.id} className="flex" style={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
                <button
                  className="char-link"
                  onClick={() => openCharacterSidebar(getRelatedCharId(rel))}
                  style={{ fontFamily: "'Noto Serif', serif", fontSize: '0.875rem', color: '#1A1918', background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
                >
                  {getRelatedCharName(rel)}
                </button>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.625rem', color: '#928D86' }}>
                  {rel.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thematic roles */}
      <div>
        <div
          style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.625rem', color: '#928D86', marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          THEMATIC ROLE
        </div>
        <div className="flex flex-wrap" style={{ gap: '0.5rem' }}>
          {character.thematicRoles.map(tag => (
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

      {/* CTA */}
      <button
        onClick={handleAskClaude}
        className="w-full transition-opacity"
        style={{
          marginTop: 'auto',
          padding: '0.75rem 1rem',
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.875rem',
          background: '#7D6B4A',
          color: '#FDFCFB',
          borderRadius: '0.25rem',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Ask Claude about {character.name.split(' ')[0]} →
      </button>
    </div>
  )
}
