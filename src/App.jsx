import useStore from './context/ReaderContext'
import ProgressBar from './components/ProgressBar'
import TopBar from './components/TopBar'
import Reader from './components/Reader'
import Sidebar from './components/Sidebar'
import ChatPanel from './components/ChatPanel'
import CharacterGraph from './components/CharacterGraph'
import GlobalMap from './components/GlobalMap'
import HomeScreen from './components/HomeScreen'

export default function App() {
  const currentView = useStore(s => s.currentView)

  if (currentView === 'home') {
    return <HomeScreen />
  }

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
      <GlobalMap />
    </div>
  )
}
