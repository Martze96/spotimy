import { useState } from 'react'
import './styles/app.css'
import logo from './assets/logo.png'

function App() {
  const [count, setCount] = useState(0)
  const [songInfo, setSongInfo] = useState("Aktuell wird kein Song abgespielt.")

  return (
    <div className="App">
      <div className='title-box'>
        <img src={logo} alt="logo" className="logo" />
      </div>
      <div className="current-song-box">
        <div className="current-song-text">
          {songInfo}
        </div>
      </div>
    </div>
  )
}

export default App
