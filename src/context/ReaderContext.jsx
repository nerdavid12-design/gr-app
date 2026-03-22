import { create } from 'zustand'
import characters from '../data/characters.json'
import relationships from '../data/relationships.json'
import annotations from '../data/annotations.json'
import preloadedBook from '../data/bookContent.json'

const PART_NAMES = [
  'Beyond the Zero',
  'Un Perm\' au Casino Hermann Goering',
  'In the Zone',
  'The Counterforce'
]

const PART_EPISODE_COUNTS = preloadedBook
  ? preloadedBook.parts.map(p => p.episodes.length)
  : [21, 8, 32, 12]

const useStore = create((set, get) => ({
  // Epub state — preloaded with embedded book content
  bookLoaded: !!preloadedBook,
  bookContent: preloadedBook || null,
  rawBook: null, // epubjs Book instance (only if user uploads)

  // Reading position
  currentPart: 0,
  currentEpisode: 0,
  scrollProgress: 0, // 0-1 within current episode

  // View routing
  currentView: 'home', // 'home' | 'reader'

  // Panels
  sidebarOpen: false,
  sidebarContent: null, // { type: 'character'|'annotation', id: string }
  chatOpen: false,
  graphOpen: false,
  mapOpen: false,

  // API key — prefer env var so it works across devices without prompting
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || localStorage.getItem('anthropic_api_key') || '',

  // Selected paragraph for chat context (Sefaria-style segment linking)
  selectedParagraph: null, // { part, episode, index, text }

  // Chat
  chatMessages: [],
  chatLoading: false,

  // Data
  characters,
  relationships,
  annotations,
  partNames: PART_NAMES,
  partEpisodeCounts: PART_EPISODE_COUNTS,

  // Actions
  setCurrentView: (view) => set({ currentView: view }),
  navigateHome: () => set({ currentView: 'home', graphOpen: false, mapOpen: false, chatOpen: false, sidebarOpen: false }),
  setBookLoaded: (bookContent, rawBook) => set({ bookLoaded: true, bookContent, rawBook }),
  setCurrentPosition: (part, episode) => set({ currentPart: part, currentEpisode: episode, selectedParagraph: null }),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),

  openCharacterSidebar: (charId) => set({ sidebarOpen: true, sidebarContent: { type: 'character', id: charId } }),
  openAnnotationSidebar: (annoId) => set({ sidebarOpen: true, sidebarContent: { type: 'annotation', id: annoId } }),
  closeSidebar: () => set({ sidebarOpen: false, sidebarContent: null }),

  toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
  openChat: () => set({ chatOpen: true }),
  closeChat: () => set({ chatOpen: false }),

  toggleGraph: () => set((s) => ({ graphOpen: !s.graphOpen })),
  openGraph: () => set({ graphOpen: true }),
  closeGraph: () => set({ graphOpen: false }),

  toggleMap: () => set((s) => ({ mapOpen: !s.mapOpen })),
  openMap: () => set({ mapOpen: true }),
  closeMap: () => set({ mapOpen: false }),

  setApiKey: (key) => {
    localStorage.setItem('anthropic_api_key', key)
    set({ apiKey: key })
  },

  setSelectedParagraph: (para) => set({ selectedParagraph: para }),
  clearSelectedParagraph: () => set({ selectedParagraph: null }),

  addChatMessage: (message) => set((s) => ({ chatMessages: [...s.chatMessages, message] })),
  setChatLoading: (loading) => set({ chatLoading: loading }),

  // Computed
  getOverallProgress: () => {
    const { currentPart, currentEpisode, partEpisodeCounts } = get()
    let total = 0
    let current = 0
    for (let i = 0; i < partEpisodeCounts.length; i++) {
      total += partEpisodeCounts[i]
      if (i < currentPart) current += partEpisodeCounts[i]
    }
    current += currentEpisode
    return total > 0 ? current / total : 0
  },

  getPartProgress: () => {
    const { currentEpisode, currentPart, partEpisodeCounts } = get()
    const count = partEpisodeCounts[currentPart] || 1
    return currentEpisode / count
  },

  getCurrentPartName: () => {
    const { currentPart, partNames } = get()
    return partNames[currentPart] || ''
  },

  getTextWindow: () => {
    const { bookContent, currentPart, currentEpisode } = get()
    if (!bookContent) return ''
    const part = bookContent.parts[currentPart]
    if (!part) return ''
    const ep = part.episodes[currentEpisode]
    if (!ep) return ''
    const text = ep.text || ''
    // Return ~500 word window from start of current episode
    const words = text.split(/\s+/)
    return words.slice(0, 500).join(' ')
  },

  getEpisodeParagraphs: () => {
    const { bookContent, currentPart, currentEpisode } = get()
    if (!bookContent) return []
    const part = bookContent.parts[currentPart]
    if (!part) return []
    const ep = part.episodes[currentEpisode]
    if (!ep) return []
    return ep.text.split(/\n\n+/).filter(p => p.trim())
  },

  getCharacterById: (id) => {
    return get().characters.find(c => c.id === id) || null
  },

  getAnnotationById: (id) => {
    return get().annotations.find(a => a.id === id) || null
  },

  getRelationshipsForCharacter: (charId) => {
    return get().relationships.filter(r => r.source === charId || r.target === charId)
  },
}))

export default useStore
