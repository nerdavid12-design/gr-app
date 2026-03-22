import { useCallback, useState } from 'react'
import useStore from './context/ReaderContext'
import useEpubParser from './hooks/useEpubParser'
import ProgressBar from './components/ProgressBar'
import TopBar from './components/TopBar'
import Reader from './components/Reader'
import Sidebar from './components/Sidebar'
import ChatPanel from './components/ChatPanel'
import CharacterGraph from './components/CharacterGraph'

function LandingScreen({ onFileSelect }) {
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0]
    if (file && file.name.endsWith('.epub')) {
      onFileSelect(file)
    }
  }, [onFileSelect])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const handleFileInput = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }, [onFileSelect])

  return (
    <div
      className="h-full flex"
      style={{ alignItems: 'center', justifyContent: 'center', background: '#f7f3ee' }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-col" style={{ alignItems: 'center', gap: '2rem', maxWidth: '32rem', textAlign: 'center', padding: '0 2rem' }}>
        {/* Title */}
        <div className="flex flex-col" style={{ alignItems: 'center', gap: '0.5rem' }}>
          <h1
            style={{
              fontFamily: "'Newsreader', serif",
              fontSize: '3.5rem',
              color: '#1A1918',
              fontWeight: 400,
              lineHeight: 1.25,
            }}
          >
            Gravity's Rainbow
          </h1>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              color: '#928D86',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            READING COMPANION
          </div>
        </div>

        {/* Divider dots */}
        <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              style={{ width: 4, height: 4, borderRadius: '9999px', background: '#D3CEC4' }}
            />
          ))}
        </div>

        {/* Upload area */}
        <label
          className="w-full flex flex-col transition-colors"
          style={{
            cursor: 'pointer',
            alignItems: 'center',
            gap: '1rem',
            padding: '3rem 2rem',
            background: '#FDFCFB',
            border: '1px dashed #D3CEC4',
            borderRadius: '0.25rem',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7D6B4A' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D3CEC4' }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 40, color: '#7D6B4A' }}
          >
            upload_file
          </span>
          <div>
            <div style={{ fontFamily: "'Noto Serif', serif", fontSize: '1rem', color: '#1A1918' }}>
              Upload your epub file
            </div>
            <div
              style={{ marginTop: '0.25rem', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#928D86' }}
            >
              Drag and drop or click to browse
            </div>
          </div>
          <input
            type="file"
            accept=".epub"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>

        {/* Footer note */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.625rem',
            color: '#928D86',
            lineHeight: 1.5,
          }}
        >
          Your file is processed entirely in the browser. Nothing is uploaded to any server.
        </p>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div
      className="h-full flex"
      style={{ alignItems: 'center', justifyContent: 'center', background: '#f7f3ee' }}
    >
      <div className="flex flex-col" style={{ alignItems: 'center', gap: '1rem' }}>
        <div className="flex" style={{ gap: '0.25rem' }}>
          <span className="animate-bounce" style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', background: '#7D6B4A', animationDelay: '0ms' }} />
          <span className="animate-bounce" style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', background: '#7D6B4A', animationDelay: '150ms' }} />
          <span className="animate-bounce" style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', background: '#7D6B4A', animationDelay: '300ms' }} />
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#928D86', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Parsing epub...
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const bookLoaded = useStore(s => s.bookLoaded)
  const { parseEpub } = useEpubParser()
  const [loading, setLoading] = useState(false)

  const handleFileSelect = useCallback(async (file) => {
    setLoading(true)
    try {
      await parseEpub(file)
    } catch (err) {
      console.error('Failed to parse epub:', err)
      alert('Failed to parse epub file. Please try a different file.')
    } finally {
      setLoading(false)
    }
  }, [parseEpub])

  if (loading) return <LoadingScreen />
  if (!bookLoaded) return <LandingScreen onFileSelect={handleFileSelect} />

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ProgressBar />
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <Reader />
        <Sidebar />
        <ChatPanel />
      </div>
      <CharacterGraph />
    </div>
  )
}
