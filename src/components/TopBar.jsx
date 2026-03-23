import { useState, useRef, useEffect, useCallback } from 'react'
import useStore from '../context/ReaderContext'

const PART_ROMANS = ['I', 'II', 'III', 'IV']

export default function TopBar() {
  const currentPart = useStore(s => s.currentPart)
  const currentEpisode = useStore(s => s.currentEpisode)
  const getCurrentPartName = useStore(s => s.getCurrentPartName)
  const toggleMap = useStore(s => s.toggleMap)
  const toggleChat = useStore(s => s.toggleChat)
  const bookLoaded = useStore(s => s.bookLoaded)
  const bookContent = useStore(s => s.bookContent)
  const setCurrentPosition = useStore(s => s.setCurrentPosition)
  const navigateHome = useStore(s => s.navigateHome)

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const toggleRef = useRef(null)

  const partName = getCurrentPartName()
  const partRoman = PART_ROMANS[currentPart] || ''
  const episodeCount = bookContent?.parts[currentPart]?.episodes.length || 0

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        toggleRef.current && !toggleRef.current.contains(e.target)
      ) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  if (!bookLoaded) return null

  const handleNavigate = (partIdx, epIdx) => {
    setCurrentPosition(partIdx, epIdx)
    setMenuOpen(false)
  }

  return (
    <div
      className="flex flex-shrink-0 relative"
      style={{
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 2rem',
        background: '#FDFCFB',
        borderBottom: '1px solid #D3CEC4',
      }}
    >
      {/* Left: GR home link + Part/Episode info */}
      <div className="flex" style={{ alignItems: 'baseline', gap: '1.25rem' }}>
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
          letterSpacing: '0.02em',
        }}
        title="Back to Home"
      >
        GR
      </button>
      <button
        ref={toggleRef}
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex"
        style={{
          alignItems: 'baseline',
          gap: '1rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <span
          style={{ fontFamily: "'Inter', sans-serif", color: '#928D86', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          PART {partRoman}
        </span>
        <span
          style={{ fontFamily: "'Newsreader', serif", color: '#1A1918', fontSize: '1.125rem' }}
        >
          {partName}
        </span>
        <span style={{ fontFamily: "'Inter', sans-serif", color: '#4A4641', fontSize: '0.75rem' }}>
          — Episode {currentEpisode + 1} of {episodeCount}
        </span>
        <span className="material-symbols-outlined" style={{ color: '#928D86', fontSize: '0.875rem', marginLeft: '-0.5rem' }}>
          {menuOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      </div>

      {/* Right: icon buttons */}
      <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={toggleMap}
          className="transition-colors"
          style={{ padding: '0.5rem', borderRadius: '0.25rem' }}
          title="Global Map"
        >
          <span className="material-symbols-outlined" style={{ color: '#928D86', fontSize: '1.25rem' }}>
            public
          </span>
        </button>
        <button
          onClick={toggleChat}
          className="transition-colors"
          style={{ padding: '0.5rem', borderRadius: '0.25rem' }}
          title="Ask Claude"
        >
          <span className="material-symbols-outlined" style={{ color: '#928D86', fontSize: '1.25rem' }}>
            chat_bubble
          </span>
        </button>
      </div>

      {/* Chapter navigation menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute z-50 overflow-y-auto"
          style={{
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: '70vh',
            background: '#FDFCFB',
            borderBottom: '1px solid #D3CEC4',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          {bookContent.parts.map((part, pIdx) => (
            <div key={pIdx}>
              {/* Part header */}
              <div
                style={{
                  padding: '0.75rem 2rem',
                  background: '#F3EFE9',
                  borderBottom: '1px solid #D3CEC4',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                }}
              >
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.625rem',
                  color: '#928D86',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>
                  PART {PART_ROMANS[pIdx]}
                </span>
                <span style={{
                  fontFamily: "'Newsreader', serif",
                  fontSize: '1rem',
                  color: '#1A1918',
                  marginLeft: '0.75rem',
                }}>
                  {part.name}
                </span>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.625rem',
                  color: '#928D86',
                  marginLeft: '0.75rem',
                }}>
                  {part.episodes.length} episodes
                </span>
              </div>

              {/* Episode grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1px',
                background: '#D3CEC4',
              }}>
                {part.episodes.map((ep, eIdx) => {
                  const isActive = pIdx === currentPart && eIdx === currentEpisode
                  const preview = ep.text.slice(0, 80).replace(/\s+/g, ' ') + '…'
                  return (
                    <button
                      key={eIdx}
                      onClick={() => handleNavigate(pIdx, eIdx)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        padding: '0.625rem 2rem',
                        background: isActive ? '#EDE9E2' : '#FDFCFB',
                        border: 'none',
                        borderLeft: isActive ? '2px solid #7D6B4A' : '2px solid transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#F3EFE9' }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = '#FDFCFB' }}
                    >
                      <span style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.625rem',
                        color: isActive ? '#7D6B4A' : '#928D86',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        minWidth: '2rem',
                        paddingTop: '0.15rem',
                        flexShrink: 0,
                      }}>
                        EP {eIdx + 1}
                      </span>
                      <span style={{
                        fontFamily: "'Noto Serif', serif",
                        fontSize: '0.75rem',
                        color: isActive ? '#1A1918' : '#4A4641',
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {preview}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
