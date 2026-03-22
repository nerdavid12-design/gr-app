import { useMemo, useCallback } from 'react'
import useStore from '../context/ReaderContext'

export default function useAnnotations() {
  const characters = useStore(s => s.characters)
  const annotations = useStore(s => s.annotations)
  const openCharacterSidebar = useStore(s => s.openCharacterSidebar)
  const openAnnotationSidebar = useStore(s => s.openAnnotationSidebar)

  // Build lookup maps
  const charLookup = useMemo(() => {
    const map = new Map()
    characters.forEach(c => {
      // Add all names and aliases
      const names = [c.name, ...c.aliases]
      names.forEach(name => {
        if (name && name.length > 1) {
          map.set(name.toLowerCase(), c.id)
        }
      })
    })
    return map
  }, [characters])

  const annoLookup = useMemo(() => {
    const map = new Map()
    annotations.forEach(a => {
      map.set(a.term.toLowerCase(), a.id)
    })
    return map
  }, [annotations])

  // Build a single regex that matches all character names and annotation terms
  const highlightRegex = useMemo(() => {
    const allTerms = []
    characters.forEach(c => {
      allTerms.push(c.name)
      c.aliases.forEach(a => { if (a) allTerms.push(a) })
    })
    annotations.forEach(a => {
      allTerms.push(a.term)
    })
    // Sort by length descending so longer matches take priority
    allTerms.sort((a, b) => b.length - a.length)
    // Escape regex special chars
    const escaped = allTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    if (escaped.length === 0) return null
    return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi')
  }, [characters, annotations])

  const annotateText = useCallback((text) => {
    if (!highlightRegex || !text) return [{ type: 'text', content: text }]

    const parts = []
    let lastIndex = 0
    let match

    // Reset regex
    highlightRegex.lastIndex = 0

    while ((match = highlightRegex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) })
      }

      const matched = match[0]
      const lower = matched.toLowerCase()
      const charId = charLookup.get(lower)
      const annoId = annoLookup.get(lower)

      if (charId) {
        parts.push({ type: 'character', content: matched, id: charId })
      } else if (annoId) {
        parts.push({ type: 'annotation', content: matched, id: annoId })
      } else {
        parts.push({ type: 'text', content: matched })
      }

      lastIndex = match.index + matched.length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) })
    }

    return parts
  }, [highlightRegex, charLookup, annoLookup])

  const handleClick = useCallback((type, id) => {
    if (type === 'character') {
      openCharacterSidebar(id)
    } else if (type === 'annotation') {
      openAnnotationSidebar(id)
    }
  }, [openCharacterSidebar, openAnnotationSidebar])

  return { annotateText, handleClick }
}
