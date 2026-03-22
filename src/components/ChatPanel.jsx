import { useState, useRef, useEffect } from 'react'
import useStore from '../context/ReaderContext'

const SUGGESTED_PROMPTS = [
  "Who are the main players in this scene?",
  "What's actually happening right now?",
  "What themes are active here?",
  "Explain a reference in this passage",
]

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

  if (!chatOpen) return null

  const partName = getCurrentPartName()
  const progress = Math.round(getOverallProgress() * 100)
  const textWindow = getTextWindow()
  const contextSnippet = textWindow ? textWindow.slice(0, 80) + '...' : 'No text loaded'

  const buildSystemPrompt = () => {
    return `You are a knowledgeable reading companion for Thomas Pynchon's Gravity's Rainbow (1973).
The user is currently reading ${partName}, Episode ${currentEpisode + 1}.
Their reading progress: ${progress}% through the novel.
The surrounding text at their current position is:
---
${textWindow}
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
          <button onClick={closeChat} style={{ color: '#928D86', padding: '0.25rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>close</span>
          </button>
        </div>
        <div style={{ fontFamily: "'Noto Serif', serif", fontSize: '0.875rem', color: '#1A1918' }}>
          Context: {partName}, Episode {currentEpisode + 1}
        </div>
        <div
          className="truncate"
          style={{
            marginTop: '0.5rem',
            padding: '0.375rem 0.5rem',
            background: '#F3EFE9',
            borderRadius: '2px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.625rem',
            color: '#4A4641',
          }}
        >
          {contextSnippet}
        </div>
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
                {msg.content}
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
                {msg.content}
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
        <div className="flex" style={{ alignItems: 'flex-end', gap: '0.5rem' }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this passage..."
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
            style={{ padding: '0.5rem', color: '#7D6B4A', opacity: input.trim() ? 1 : 0.4 }}
            disabled={!input.trim() || chatLoading || !apiKey}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>send</span>
          </button>
        </div>
      </div>
    </div>
  )
}
