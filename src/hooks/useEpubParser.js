import { useCallback } from 'react'
import ePub from 'epubjs'
import useStore from '../context/ReaderContext'

// Episode separator pattern: rows of dots, bullets, or centered asterisks
const EPISODE_SEPARATOR = /^\s*[•·∙●○◦⦁.*]{3,}\s*$/m

export default function useEpubParser() {
  const setBookLoaded = useStore(s => s.setBookLoaded)

  const parseEpub = useCallback(async (file) => {
    const arrayBuffer = await file.arrayBuffer()
    const book = ePub(arrayBuffer)
    await book.ready

    const spine = book.spine
    const sections = []

    // Load all spine items
    for (const item of spine.items) {
      if (item.href) {
        const doc = await book.load(item.href)
        const serializer = new XMLSerializer()
        const html = serializer.serializeToString(doc)
        // Extract text content
        const div = document.createElement('div')
        div.innerHTML = html
        const text = div.textContent || div.innerText || ''
        if (text.trim()) {
          sections.push({ href: item.href, text: text.trim(), html })
        }
      }
    }

    // Concatenate all text
    const fullText = sections.map(s => s.text).join('\n\n')

    // Split into episodes by separator pattern
    const rawEpisodes = fullText.split(EPISODE_SEPARATOR).filter(t => t.trim().length > 50)

    // Map to 4-part structure
    // GR has: Part 1 (29 eps), Part 2 (8 eps), Part 3 (32 eps), Part 4 (12 eps) = ~73+ episodes
    const PART_SIZES = [29, 8, 32, 12]
    const PART_NAMES = [
      'Beyond the Zero',
      "Un Perm' au Casino Hermann Goering",
      'In the Zone',
      'The Counterforce'
    ]

    const parts = []
    let episodeIndex = 0

    for (let p = 0; p < PART_NAMES.length; p++) {
      const episodeCount = Math.min(PART_SIZES[p], rawEpisodes.length - episodeIndex)
      const episodes = []
      for (let e = 0; e < episodeCount && episodeIndex < rawEpisodes.length; e++) {
        episodes.push({
          text: rawEpisodes[episodeIndex],
          index: e
        })
        episodeIndex++
      }
      // If we've run out of raw episodes but haven't filled all parts,
      // and this is the last part with content, dump remaining text
      if (episodes.length === 0 && p > 0) {
        // Skip empty parts at the end
        continue
      }
      parts.push({
        name: PART_NAMES[p],
        partNumber: p,
        episodes
      })
    }

    // If parsing didn't produce enough episodes, treat each section as an episode
    if (parts.length === 0 || parts.every(p => p.episodes.length === 0)) {
      const fallbackParts = [{
        name: PART_NAMES[0],
        partNumber: 0,
        episodes: sections.map((s, i) => ({ text: s.text, index: i }))
      }]
      setBookLoaded({ parts: fallbackParts }, book)
      return
    }

    setBookLoaded({ parts }, book)
  }, [setBookLoaded])

  return { parseEpub }
}
