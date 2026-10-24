import TitleBar from './components/TitleBar'
import Welcome from './components/Welcome'

export default function App() {
  return (
    <div className="flex flex-col h-screen">
      <TitleBar />
      <main className="flex flex-1 overflow-hidden">
        <Welcome />
      </main>
    </div>
  )
}
