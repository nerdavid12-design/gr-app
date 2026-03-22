import useStore from '../context/ReaderContext'
import CharacterCard from './CharacterCard'
import AnnotationCard from './AnnotationCard'

export default function Sidebar() {
  const sidebarOpen = useStore(s => s.sidebarOpen)
  const sidebarContent = useStore(s => s.sidebarContent)

  if (!sidebarOpen || !sidebarContent) return null

  return (
    <div
      className="flex-shrink-0 h-full overflow-hidden"
      style={{
        width: 380,
        background: '#FDFCFB',
        borderLeft: '1px solid #D3CEC4',
      }}
    >
      {sidebarContent.type === 'character' && (
        <CharacterCard characterId={sidebarContent.id} />
      )}
      {sidebarContent.type === 'annotation' && (
        <AnnotationCard annotationId={sidebarContent.id} />
      )}
    </div>
  )
}
