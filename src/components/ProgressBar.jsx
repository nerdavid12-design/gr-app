import useStore from '../context/ReaderContext'

export default function ProgressBar() {
  const getOverallProgress = useStore(s => s.getOverallProgress)
  const getPartProgress = useStore(s => s.getPartProgress)

  const overall = getOverallProgress()
  const part = getPartProgress()

  return (
    <div className="w-full flex-shrink-0">
      <div className="w-full" style={{ height: '0.25rem', background: '#EDE9E2' }}>
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${overall * 100}%`,
            background: 'linear-gradient(155deg, #7D6B4A, #4A3F2C)',
          }}
        />
      </div>
      <div className="w-full" style={{ height: '0.125rem', background: '#EDE9E2' }}>
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${part * 100}%`,
            background: '#4a7a9e',
          }}
        />
      </div>
    </div>
  )
}
