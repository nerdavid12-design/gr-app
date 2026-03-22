import { useEffect, useCallback, useRef } from 'react'
import useStore from '../context/ReaderContext'

export default function useReadingPosition(readerRef) {
  const setScrollProgress = useStore(s => s.setScrollProgress)
  const currentPart = useStore(s => s.currentPart)
  const currentEpisode = useStore(s => s.currentEpisode)
  const setCurrentPosition = useStore(s => s.setCurrentPosition)
  const bookContent = useStore(s => s.bookContent)
  const rafRef = useRef(null)

  const handleScroll = useCallback(() => {
    if (!readerRef?.current) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const el = readerRef.current
      if (!el) return
      const { scrollTop, scrollHeight, clientHeight } = el
      const progress = scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0
      setScrollProgress(Math.min(1, Math.max(0, progress)))
    })
  }, [readerRef, setScrollProgress])

  useEffect(() => {
    const el = readerRef?.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [readerRef, handleScroll])

  const goToEpisode = useCallback((part, episode) => {
    if (!bookContent) return
    const p = bookContent.parts[part]
    if (!p) return
    if (episode >= 0 && episode < p.episodes.length) {
      setCurrentPosition(part, episode)
      if (readerRef?.current) {
        readerRef.current.scrollTop = 0
      }
    }
  }, [bookContent, setCurrentPosition, readerRef])

  const nextEpisode = useCallback(() => {
    if (!bookContent) return
    const part = bookContent.parts[currentPart]
    if (!part) return
    if (currentEpisode < part.episodes.length - 1) {
      goToEpisode(currentPart, currentEpisode + 1)
    } else if (currentPart < bookContent.parts.length - 1) {
      goToEpisode(currentPart + 1, 0)
    }
  }, [bookContent, currentPart, currentEpisode, goToEpisode])

  const prevEpisode = useCallback(() => {
    if (!bookContent) return
    if (currentEpisode > 0) {
      goToEpisode(currentPart, currentEpisode - 1)
    } else if (currentPart > 0) {
      const prevPart = bookContent.parts[currentPart - 1]
      goToEpisode(currentPart - 1, prevPart.episodes.length - 1)
    }
  }, [bookContent, currentPart, currentEpisode, goToEpisode])

  return { goToEpisode, nextEpisode, prevEpisode }
}
