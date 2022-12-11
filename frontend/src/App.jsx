
import { useState, useEffect } from 'react'
import './styles/app.css'
import logo from './assets/logo.png'
import axios from 'axios';

function App() {
  const [currentSongInfo, setCurrentSongInfo] = useState([])
  const [songQueue, setSongQueue] = useState([]);
  const [queueList, setQueueList] = useState({});


  useEffect(() => {
    const interval = setInterval(() => {
      axios.get("http://192.168.0.67:3000/getCurrentSong").then(res => { setCurrentSongInfo(res.data); console.log(res.data) });
      axios.get("http://192.168.0.67:3000/getQueue").then(res => { setSongQueue(res.data); console.log(res.data); })
    }, 3000);
    return () => clearInterval(interval);
  }, [])

  return (
    <div className="App">
      <div className='title-box'>
        <img src={logo} alt="logo" className="logo" />
      </div>
      <div className="current-song-box">
        <div>Aktuell wird folgender Song abgespielt:</div>
        <img src={currentSongInfo[2]} alt="Cover des aktuellen Songs" className='current-song-cover-image' />
        <div style={{ fontWeight: 200 }}>{currentSongInfo[0]}</div>
        <div style={{ fontSize: "1.2rem" }}>{currentSongInfo[1]}</div>
      </div>
      <div className='queue-box'>
        <div>Diese Lieder werden als Nächstes abgespielt:</div>
        <div className="queue-list">
          {/*queueList*/}
          {songQueue[0]?.name ? songQueue.map(item => {
            return (<div className='queue-list-entry'>
              <img src={item.image} alt="queuesongcover" className='queue-list-entry-cover' />
              <div className='queuelist-song-name'>{item.name}</div>
              <div className='queuelist-song-artist'>{item.artist}</div>
            </div>)
          }) : "The Song queue is empty or not available."}
        </div>
      </div>

    </div>
  )
}

export default App
