import { useRef, useState, useCallback, useEffect } from 'react'
import useStore from '../context/ReaderContext'
import useReadingPosition from '../hooks/useReadingPosition'
import useAnnotations from '../hooks/useAnnotations'
import EpisodeDivider from './EpisodeDivider'

export default function Reader() {
  const readerRef = useRef(null)
  const bookContent = useStore(s => s.bookContent)
  const currentPart = useStore(s => s.currentPart)
  const currentEpisode = useStore(s => s.currentEpisode)
  const openChat = useStore(s => s.openChat)
  const addChatMessage = useStore(s => s.addChatMessage)
  const selectedParagraph = useStore(s => s.selectedParagraph)
  const setSelectedParagraph = useStore(s => s.setSelectedParagraph)
  const clearSelectedParagraph = useStore(s => s.clearSelectedParagraph)

  const { nextEpisode, prevEpisode } = useReadingPosition(readerRef)
  const { annotateText, handleClick } = useAnnotations()

  const [selectionPopup, setSelectionPopup] = useState(null)
  const [hoveredPara, setHoveredPara] = useState(null)

  // Find which paragraph index the selected text lives in
  const getParaIndexFromSelection = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || !sel.anchorNode) return null
    const paraEl = sel.anchorNode.nodeType === 3
      ? sel.anchorNode.parentElement?.closest('[data-para-index]')
      : sel.anchorNode.closest?.('[data-para-index]')
    if (!paraEl) return null
    return parseInt(paraEl.dataset.paraIndex, 10)
  }, [])

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()
    if (text && text.length > 2) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const readerRect = readerRef.current?.getBoundingClientRect()
      const paraIndex = getParaIndexFromSelection()
      if (readerRect) {
        setSelectionPopup({
          text,
          paraIndex,
          x: rect.left - readerRect.left + rect.width / 2,
          y: rect.top - readerRect.top - 8,
        })
      }
    } else {
      setSelectionPopup(null)
    }
  }, [getParaIndexFromSelection])

  const handleAskAboutSelection = useCallback(() => {
    if (selectionPopup?.text) {
      const paraRef = selectionPopup.paraIndex != null ? ` (¶${selectionPopup.paraIndex + 1})` : ''
      addChatMessage({
        role: 'user',
        content: `What does this mean?${paraRef} "${selectionPopup.text}"`,
        timestamp: Date.now(),
      })
      openChat()
      setSelectionPopup(null)
      window.getSelection()?.removeAllRanges()
    }
  }, [selectionPopup, addChatMessage, openChat])

  const handleParagraphClick = useCallback((index, text, e) => {
    // Don't select paragraph if user clicked a character/annotation link
    if (e.target.closest('.char-link, .anno-link')) return
    // Don't select if user is making a text selection
    const selection = window.getSelection()
    if (selection && selection.toString().trim().length > 2) return

    const isAlreadySelected = selectedParagraph?.index === index
      && selectedParagraph?.part === currentPart
      && selectedParagraph?.episode === currentEpisode

    if (isAlreadySelected) {
      clearSelectedParagraph()
    } else {
      setSelectedParagraph({
        part: currentPart,
        episode: currentEpisode,
        index,
        text,
      })
    }
  }, [selectedParagraph, currentPart, currentEpisode, setSelectedParagraph, clearSelectedParagraph])

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (!e.target.closest('.selection-popup')) {
        setSelectionPopup(null)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  if (!bookContent) return null

  const part = bookContent.parts[currentPart]
  if (!part) return null
  const episode = part.episodes[currentEpisode]
  if (!episode) return null

  const paragraphs = episode.text.split(/\n\n+/).filter(p => p.trim())

  const renderAnnotatedText = (text) => {
    const parts = annotateText(text)
    return parts.map((part, i) => {
      if (part.type === 'character') {
        return (
          <span
            key={i}
            className="char-link"
            onClick={() => handleClick('character', part.id)}
          >
            {part.content}
          </span>
        )
      }
      if (part.type === 'annotation') {
        return (
          <span
            key={i}
            className="anno-link"
            onClick={() => handleClick('annotation', part.id)}
          >
            {part.content}
          </span>
        )
      }
      return <span key={i}>{part.content}</span>
    })
  }

  const isParaSelected = (index) =>
    selectedParagraph?.index === index
    && selectedParagraph?.part === currentPart
    && selectedParagraph?.episode === currentEpisode

  const hasPrev = currentEpisode > 0 || currentPart > 0
  const hasNext = currentEpisode < part.episodes.length - 1 || currentPart < bookContent.parts.length - 1

  return (
    <div
      ref={readerRef}
      className="flex-1 h-full overflow-y-auto relative"
      style={{ background: '#f7f3ee' }}
      onMouseUp={handleMouseUp}
    >
      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '3rem 3rem 3rem 4rem' }}>
        {/* Episode text */}
        <div className="flex flex-col" style={{ gap: '0.25rem' }}>
          {paragraphs.map((para, i) => {
            const selected = isParaSelected(i)
            const hovered = hoveredPara === i
            return (
              <div
                key={i}
                data-para-index={i}
                id={`para-${i}`}
                className="flex"
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: '3px',
                  transition: 'background 0.15s, border-color 0.15s',
                  background: selected ? '#EDE8DC' : hovered ? '#f0ece5' : 'transparent',
                  borderLeft: selected ? '3px solid #7D6B4A' : '3px solid transparent',
                  padding: '0.625rem 0.875rem 0.625rem 0.5rem',
                  marginLeft: '-1.5rem',
                }}
                onClick={(e) => handleParagraphClick(i, para, e)}
                onMouseEnter={() => setHoveredPara(i)}
                onMouseLeave={() => setHoveredPara(null)}
              >
                {/* Paragraph number */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-1.75rem',
                    top: '0.75rem',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.5625rem',
                    color: selected ? '#7D6B4A' : hovered ? '#9B8B7B' : '#D3CEC4',
                    fontWeight: selected ? 600 : 400,
                    userSelect: 'none',
                    transition: 'color 0.15s',
                    width: '1.5rem',
                    textAlign: 'right',
                  }}
                >
                  {i + 1}
                </div>

                {/* Paragraph text */}
                <p
                  style={{
                    fontFamily: "'Noto Serif', serif",
                    fontSize: '1rem',
                    color: '#2D2926',
                    lineHeight: 1.8,
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {renderAnnotatedText(para)}
                </p>
              </div>
            )
          })}
        </div>

        {/* Episode divider */}
        <EpisodeDivider />

        {/* Navigation footer */}
        <div className="flex" style={{ alignItems: 'center', justifyContent: 'space-between', padding: '2rem 0' }}>
          <button
            onClick={prevEpisode}
            disabled={!hasPrev}
            className="flex transition-colors"
            style={{
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              color: hasPrev ? '#4A4641' : '#D3CEC4',
              background: 'transparent',
              border: 'none',
              cursor: hasPrev ? 'pointer' : 'default',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_back</span>
            Previous Episode
          </button>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.625rem',
              color: '#928D86',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Episode {currentEpisode + 1} of {part.episodes.length}
          </span>
          <button
            onClick={nextEpisode}
            disabled={!hasNext}
            className="flex transition-colors"
            style={{
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              color: hasNext ? '#4A4641' : '#D3CEC4',
              background: 'transparent',
              border: 'none',
              cursor: hasNext ? 'pointer' : 'default',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Next Episode
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Selection popup */}
      {selectionPopup && (
        <div
          className="absolute z-50 selection-popup"
          style={{
            left: selectionPopup.x,
            top: selectionPopup.y,
            transform: 'translate(-50%, -100%)',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleAskAboutSelection}
            className="flex"
            style={{
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.75rem',
              whiteSpace: 'nowrap',
              background: '#7D6B4A',
              color: '#FDFCFB',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '0.25rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chat_bubble</span>
            Ask about ¶{(selectionPopup.paraIndex ?? 0) + 1}
          </button>
        </div>
      )}
    </div>
  )
}
