import { useState, useRef, useEffect, useCallback } from 'react'
import useStore from '../context/ReaderContext'

const SUGGESTED_PROMPTS = [
  "Who are the main players in this scene?",
  "What's actually happening right now?",
  "What themes are active here?",
  "Explain a reference in this passage",
]

// Scroll to a paragraph in the reader by index
function scrollToParagraph(index) {
  const el = document.getElementById(`para-${index}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Flash highlight
    el.style.background = '#E2DACC'
    setTimeout(() => { el.style.background = '' }, 1200)
  }
}

// Render message content with clickable ¶N references
function renderMessageContent(content) {
  // Match ¶N or ¶N-M patterns
  const parts = content.split(/(¶\d+(?:[–-]\d+)?)/g)
  return parts.map((part, i) => {
    const match = part.match(/^¶(\d+)(?:[–-](\d+))?$/)
    if (match) {
      const paraIndex = parseInt(match[1], 10) - 1 // convert to 0-based
      return (
        <span
          key={i}
          onClick={() => scrollToParagraph(paraIndex)}
          style={{
            color: '#7D6B4A',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: '1px dashed #7D6B4A',
          }}
        >
          {part}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export default function ChatPanel() {
  const chatOpen = useStore(s => s.chatOpen)
  const closeChat = useStore(s => s.closeChat)
  const chatMessages = useStore(s => s.chatMessages)
  const addChatMessage = useStore(s => s.addChatMessage)
  const chatLoading = useStore(s => s.chatLoading)
  const setChatLoading = useStore(s => s.setChatLoading)
  const apiKey = useStore(s => s.apiKey)
  const setApiKey = useStore(s => s.setApiKey)
  const currentPart = useStore(s => s.currentPart)
  const currentEpisode = useStore(s => s.currentEpisode)
  const getCurrentPartName = useStore(s => s.getCurrentPartName)
  const getOverallProgress = useStore(s => s.getOverallProgress)
  const getTextWindow = useStore(s => s.getTextWindow)
  const selectedParagraph = useStore(s => s.selectedParagraph)
  const clearSelectedParagraph = useStore(s => s.clearSelectedParagraph)
  const getEpisodeParagraphs = useStore(s => s.getEpisodeParagraphs)

  const [input, setInput] = useState('')
  const [keyInput, setKeyInput] = useState('')
  const [showKeyPrompt, setShowKeyPrompt] = useState(!apiKey)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, chatLoading])

  useEffect(() => {
    if (chatOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [chatOpen])

  const handleAskAboutParagraph = useCallback(() => {
    if (!selectedParagraph) return
    const paraNum = selectedParagraph.index + 1
    const snippet = selectedParagraph.text.slice(0, 120)
    sendMessage(`Explain what's happening in ¶${paraNum}: "${snippet}..."`)
  }, [selectedParagraph])

  if (!chatOpen) return null

  const partName = getCurrentPartName()
  const progress = Math.round(getOverallProgress() * 100)
  const textWindow = getTextWindow()

  // Build numbered paragraph context for the system prompt
  const buildParagraphContext = () => {
    const paragraphs = getEpisodeParagraphs()
    if (!paragraphs.length) return textWindow
    return paragraphs.map((p, i) => `¶${i + 1}: ${p}`).join('\n\n')
  }

  const buildSystemPrompt = () => {
    const paraContext = buildParagraphContext()
    const selectedCtx = selectedParagraph
      ? `\nThe user has selected ¶${selectedParagraph.index + 1}. Focus your answer on this paragraph unless they ask about something else.`
      : ''

    return `You are a knowledgeable reading companion for Thomas Pynchon's Gravity's Rainbow (1973).
The user is currently reading ${partName}, Episode ${currentEpisode + 1}.
Their reading progress: ${progress}% through the novel.

The episode text is shown below with paragraph numbers (¶1, ¶2, etc.).
IMPORTANT: When you reference specific text, ALWAYS cite the paragraph number using the ¶N notation (e.g. "In ¶3, Slothrop..."). This helps the user locate exactly what you're talking about.
${selectedCtx}

---
${paraContext}
---

Answer questions about the novel with the depth of a scholar and the clarity of a good teacher.
Do not spoil future plot events unless the user explicitly asks.
When relevant, connect the current passage to major themes: paranoia vs anti-paranoia,
the Elect and the Preterite, entropy, colonialism and the Herero genocide, the rocket as
death-object, Pavlovian conditioning and control.
Be honest when something in GR is genuinely ambiguous or unresolved — do not pretend
the novel has clean answers.
Keep responses concise unless the user asks for depth.`
  }

  const sendMessage = async (text) => {
    if (!text.trim() || !apiKey) return

    const userMessage = { role: 'user', content: text.trim(), timestamp: Date.now() }
    addChatMessage(userMessage)
    setInput('')
    setChatLoading(true)

    try {
      const systemPrompt = buildSystemPrompt()
      const allMessages = [...chatMessages, userMessage]
      const messagesForApi = allMessages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: systemPrompt,
          messages: messagesForApi,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error?.message || `API error: ${response.status}`)
      }

      const data = await response.json()
      const assistantText = data.content?.[0]?.text || 'No response received.'

      addChatMessage({
        role: 'assistant',
        content: assistantText,
        timestamp: Date.now(),
      })
    } catch (err) {
      addChatMessage({
        role: 'assistant',
        content: `Error: ${err.message}`,
        timestamp: Date.now(),
      })
    } finally {
      setChatLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleSaveKey = () => {
    if (keyInput.trim()) {
      setApiKey(keyInput.trim())
      setShowKeyPrompt(false)
    }
  }

  // Check if a selected paragraph is from the current episode
  const hasActiveSelection = selectedParagraph
    && selectedParagraph.part === currentPart
    && selectedParagraph.episode === currentEpisode

  return (
    <div
      className="flex-shrink-0 h-full flex flex-col overflow-hidden"
      style={{
        width: 380,
        background: '#FDFCFB',
        borderLeft: '1px solid #D3CEC4',
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0" style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid #D3CEC4' }}>
        <div className="flex" style={{ alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div
            style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.625rem', color: '#928D86', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            INTELLIGENCE BRIEF
          </div>
          <button onClick={closeChat} style={{ color: '#928D86', padding: '0.25rem', background: 'none', border: 'none', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>close</span>
          </button>
        </div>
        <div style={{ fontFamily: "'Noto Serif', serif", fontSize: '0.875rem', color: '#1A1918' }}>
          {partName}, Episode {currentEpisode + 1}
        </div>

        {/* Selected paragraph indicator */}
        {hasActiveSelection ? (
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem 0.625rem',
              background: '#EDE8DC',
              borderLeft: '3px solid #7D6B4A',
              borderRadius: '0 2px 2px 0',
              position: 'relative',
            }}
          >
            <div className="flex" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.5625rem',
                  color: '#7D6B4A',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                ¶{selectedParagraph.index + 1} SELECTED
              </span>
              <button
                onClick={clearSelectedParagraph}
                style={{ color: '#9B8B7B', padding: '0', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>close</span>
              </button>
            </div>
            <div
              style={{
                fontFamily: "'Noto Serif', serif",
                fontSize: '0.75rem',
                color: '#4A4641',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {selectedParagraph.text.slice(0, 200)}{selectedParagraph.text.length > 200 ? '...' : ''}
            </div>
            {/* Quick ask button */}
            <button
              onClick={() => handleAskAboutParagraph()}
              className="flex"
              style={{
                alignItems: 'center',
                gap: '0.25rem',
                marginTop: '0.5rem',
                padding: '0.375rem 0.625rem',
                background: '#7D6B4A',
                color: '#FDFCFB',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.625rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                borderRadius: '2px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>chat_bubble</span>
              Explain this passage
            </button>
          </div>
        ) : (
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.375rem 0.5rem',
              background: '#F3EFE9',
              borderRadius: '2px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.625rem',
              color: '#9B8B7B',
              fontStyle: 'italic',
            }}
          >
            Click a paragraph in the reader to anchor your question
          </div>
        )}
      </div>

      {/* API Key prompt */}
      {showKeyPrompt && (
        <div className="flex flex-col" style={{ padding: '1.25rem', gap: '0.75rem', borderBottom: '1px solid #D3CEC4' }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#4A4641' }}>
            Enter your Anthropic API key to enable chat:
          </div>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full"
            style={{
              background: 'transparent',
              paddingBottom: '0.5rem',
              outline: 'none',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.875rem',
              color: '#1A1918',
              border: 'none',
              borderBottom: '1px solid #D3CEC4',
            }}
            onFocus={(e) => { e.target.style.borderBottomColor = '#7D6B4A' }}
            onBlur={(e) => { e.target.style.borderBottomColor = '#D3CEC4' }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveKey() }}
          />
          <button
            onClick={handleSaveKey}
            className="w-full"
            style={{
              padding: '0.5rem 0',
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              background: '#7D6B4A',
              color: '#FDFCFB',
              borderRadius: '0.25rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Save Key
          </button>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto flex flex-col" style={{ padding: '1rem 1.25rem', gap: '1rem' }}>
        {chatMessages.length === 0 && !chatLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="transition-colors"
                style={{
                  textAlign: 'left',
                  padding: '0.75rem',
                  background: '#F3EFE9',
                  borderRadius: '2px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.75rem',
                  color: '#4A4641',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.target.style.background = '#EDE9E2' }}
                onMouseLeave={(e) => { e.target.style.background = '#F3EFE9' }}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className="flex"
            style={{ justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            {msg.role === 'user' ? (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: '#F3EFE9',
                  borderRadius: '2px',
                  fontFamily: "'Noto Serif', serif",
                  fontSize: '0.875rem',
                  color: '#1A1918',
                  maxWidth: '85%',
                }}
              >
                {renderMessageContent(msg.content)}
              </div>
            ) : (
              <div
                style={{
                  padding: '0.75rem 0 0.75rem 1rem',
                  borderLeft: '2px solid #7D6B4A',
                  fontFamily: "'Noto Serif', serif",
                  fontSize: '0.875rem',
                  color: '#4A4641',
                  maxWidth: '85%',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {renderMessageContent(msg.content)}
              </div>
            )}
          </div>
        ))}

        {chatLoading && (
          <div className="flex" style={{ justifyContent: 'flex-start' }}>
            <div className="flex" style={{ gap: '0.25rem', padding: '0.75rem 0 0.75rem 1rem', borderLeft: '2px solid #7D6B4A' }}>
              <span className="animate-bounce" style={{ width: '0.375rem', height: '0.375rem', borderRadius: '9999px', background: '#928D86', animationDelay: '0ms' }} />
              <span className="animate-bounce" style={{ width: '0.375rem', height: '0.375rem', borderRadius: '9999px', background: '#928D86', animationDelay: '150ms' }} />
              <span className="animate-bounce" style={{ width: '0.375rem', height: '0.375rem', borderRadius: '9999px', background: '#928D86', animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0" style={{ padding: '0.75rem 1.25rem 1.25rem', borderTop: '1px solid #D3CEC4' }}>
        {hasActiveSelection && (
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.5625rem',
            color: '#7D6B4A',
            marginBottom: '0.375rem',
            letterSpacing: '0.05em',
          }}>
            Asking about ¶{selectedParagraph.index + 1}
          </div>
        )}
        <div className="flex" style={{ alignItems: 'flex-end', gap: '0.5rem' }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasActiveSelection ? `Ask about ¶${selectedParagraph.index + 1}...` : 'Ask about this passage...'}
            className="flex-1"
            style={{
              background: 'transparent',
              paddingBottom: '0.5rem',
              outline: 'none',
              fontFamily: "'Noto Serif', serif",
              fontSize: '0.875rem',
              color: '#1A1918',
              border: 'none',
              borderBottom: '1px solid #D3CEC4',
            }}
            onFocus={(e) => { e.target.style.borderBottomColor = '#7D6B4A' }}
            onBlur={(e) => { e.target.style.borderBottomColor = '#D3CEC4' }}
            disabled={!apiKey || showKeyPrompt}
          />
          <button
            onClick={() => sendMessage(input)}
            className="transition-opacity"
            style={{ padding: '0.5rem', color: '#7D6B4A', opacity: input.trim() ? 1 : 0.4, background: 'none', border: 'none', cursor: 'pointer' }}
            disabled={!input.trim() || chatLoading || !apiKey}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>send</span>
          </button>
        </div>
      </div>
    </div>
  )
}
