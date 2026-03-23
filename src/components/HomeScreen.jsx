import { useState, useCallback } from 'react'
import useStore from '../context/ReaderContext'
import useEpubParser from '../hooks/useEpubParser'

const CARDS = [
  {
    id: 'archive',
    code: '001',
    icon: 'folder_open',
    title: 'The Archive',
    description: 'Read the novel with contextual annotations, episode navigation, and passage-level intelligence.',
    cta: 'ENTER THE ARCHIVE',
  },
  {
    id: 'debrief',
    code: '002',
    icon: 'forum',
    title: 'Intelligence Debrief',
    description: 'Interrogate the novel in real time. Ask about characters, themes, references, and what is actually happening.',
    cta: 'OPEN DEBRIEF',
  },
  {
    id: 'geo',
    code: '003',
    icon: 'public',
    title: 'Geographical Intelligence',
    description: "Track characters across the novel's geography — from London to the Zone, across four parts and two continents.",
    cta: 'VIEW INTELLIGENCE',
  },
]

export default function HomeScreen() {
  const setCurrentView = useStore(s => s.setCurrentView)
  const openChat = useStore(s => s.openChat)
  const openMap = useStore(s => s.openMap)
  const bookLoaded = useStore(s => s.bookLoaded)
  const { parseEpub } = useEpubParser()

  const [showUpload, setShowUpload] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)

  const handleCardClick = (cardId) => {
    if (cardId === 'archive') {
      if (!bookLoaded) {
        setPendingAction('archive')
        setShowUpload(true)
        return
      }
      setCurrentView('reader')
    } else if (cardId === 'debrief') {
      if (!bookLoaded) {
        setPendingAction('debrief')
        setShowUpload(true)
        return
      }
      setCurrentView('reader')
      openChat()
    } else if (cardId === 'geo') {
      setCurrentView('reader')
      openMap()
    }
  }

  const handleFileSelect = useCallback(async (file) => {
    if (!file) return
    setUploadLoading(true)
    try {
      await parseEpub(file)
      setShowUpload(false)
      // Execute the pending action after upload
      if (pendingAction === 'archive') {
        useStore.getState().setCurrentView('reader')
      } else if (pendingAction === 'debrief') {
        useStore.getState().setCurrentView('reader')
        useStore.getState().openChat()
      } else if (pendingAction === 'geo') {
        useStore.getState().setCurrentView('reader')
        useStore.getState().openMap()
      }
    } catch (err) {
      console.error('Failed to parse epub:', err)
      alert('Failed to parse epub file. Please try a different file.')
    } finally {
      setUploadLoading(false)
    }
  }, [parseEpub, pendingAction])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0]
    if (file && file.name.endsWith('.epub')) handleFileSelect(file)
  }, [handleFileSelect])

  return (
    <div className="h-full flex flex-col" style={{ background: '#f7f3ee' }}>
      {/* Top bar */}
      <div
        className="flex flex-shrink-0"
        style={{
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 2.5rem',
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.625rem',
            color: '#928D86',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          Gravity's Rainbow — Reading Companion
        </div>
      </div>

      {/* Main content — centered */}
      <div
        className="flex-1 flex flex-col"
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 2.5rem 4rem',
        }}
      >
        {/* Hero section */}
        <div className="flex flex-col" style={{ alignItems: 'center', gap: '1.25rem', marginBottom: '3.5rem' }}>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.625rem',
              color: '#928D86',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            Classified Dossier // Interface Selection
          </div>

          <h1
            style={{
              fontFamily: "'Newsreader', serif",
              fontSize: '4rem',
              fontStyle: 'italic',
              fontWeight: 400,
              color: '#1A1918',
              lineHeight: 1.1,
              textAlign: 'center',
            }}
          >
            Gravity's Rainbow
          </h1>

          {/* Thin line */}
          <div style={{ width: '3rem', height: '1px', background: '#D3CEC4' }} />

          <div
            style={{
              fontFamily: "'Newsreader', serif",
              fontSize: '1rem',
              color: '#4A4641',
              fontStyle: 'italic',
            }}
          >
            Thomas Pynchon, 1973
          </div>

          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.625rem',
              color: '#928D86',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginTop: '0.5rem',
            }}
          >
            Select Operational Mode
          </div>
        </div>

        {/* Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.25rem',
            maxWidth: '64rem',
            width: '100%',
          }}
        >
          {CARDS.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className="flex flex-col transition-all"
              style={{
                textAlign: 'left',
                padding: '1.75rem',
                background: '#FDFCFB',
                border: '1px solid #D3CEC4',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                justifyContent: 'space-between',
                minHeight: '14rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#7D6B4A'
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#D3CEC4'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div>
                {/* Card header */}
                <div className="flex" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.5625rem',
                      color: '#928D86',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Operative Mode // {card.code}
                  </span>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '1.25rem', color: '#928D86' }}
                  >
                    {card.icon}
                  </span>
                </div>

                {/* Card title */}
                <h2
                  style={{
                    fontFamily: "'Newsreader', serif",
                    fontSize: '1.5rem',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    color: '#1A1918',
                    marginBottom: '0.75rem',
                    lineHeight: 1.3,
                  }}
                >
                  {card.title}
                </h2>

                {/* Card description */}
                <p
                  style={{
                    fontFamily: "'Noto Serif', serif",
                    fontSize: '0.8125rem',
                    color: '#4A4641',
                    lineHeight: 1.6,
                  }}
                >
                  {card.description}
                </p>
              </div>

              {/* Card CTA */}
              <div
                className="flex"
                style={{
                  alignItems: 'center',
                  gap: '0.375rem',
                  marginTop: '1.5rem',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.6875rem',
                  color: '#7D6B4A',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                }}
              >
                {card.cta}
                <span style={{ fontSize: '0.875rem' }}>→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col" style={{ alignItems: 'center', gap: '0.5rem', marginTop: '3.5rem' }}>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.5625rem',
              color: '#D3CEC4',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            © Z.44 Radio/Frequency Shadow System
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.5625rem',
              color: '#D3CEC4',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Powered by Claude — Anthropic
          </div>
        </div>
      </div>

      {/* Upload overlay modal */}
      {showUpload && (
        <div
          className="fixed inset-0 z-50 flex"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(26, 25, 24, 0.4)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => { setShowUpload(false); setPendingAction(null) }}
        >
          <div
            className="flex flex-col"
            style={{
              background: '#FDFCFB',
              borderRadius: '0.5rem',
              padding: '2.5rem',
              maxWidth: '28rem',
              width: '90%',
              alignItems: 'center',
              gap: '1.5rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}
            onClick={(e) => e.stopPropagation()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {uploadLoading ? (
              <>
                <div className="flex" style={{ gap: '0.25rem' }}>
                  <span className="animate-bounce" style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', background: '#7D6B4A', animationDelay: '0ms' }} />
                  <span className="animate-bounce" style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', background: '#7D6B4A', animationDelay: '150ms' }} />
                  <span className="animate-bounce" style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', background: '#7D6B4A', animationDelay: '300ms' }} />
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#928D86', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Parsing epub...
                </div>
              </>
            ) : (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 36, color: '#7D6B4A' }}
                >
                  upload_file
                </span>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Newsreader', serif", fontSize: '1.125rem', color: '#1A1918' }}>
                    Upload your epub file
                  </div>
                  <div style={{ marginTop: '0.375rem', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#928D86' }}>
                    Drag and drop or click to browse
                  </div>
                </div>
                <label
                  className="w-full flex transition-colors"
                  style={{
                    cursor: 'pointer',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.75rem',
                    background: '#7D6B4A',
                    color: '#FDFCFB',
                    borderRadius: '0.25rem',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#4A3F2C' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#7D6B4A' }}
                >
                  Choose File
                  <input
                    type="file"
                    accept=".epub"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileSelect(file)
                    }}
                    className="hidden"
                  />
                </label>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.625rem', color: '#928D86' }}>
                  Processed entirely in your browser.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
