
import { useState, useEffect } from 'react'
import './styles/app.css'
import logo from './assets/logo.png'
import axios from 'axios';

function App() {
  const [currentSongInfo, setCurrentSongInfo] = useState([])
  const [songQueue, setSongQueue] = useState([]);
  const [queueList, setQueueList] = useState({});

  const renderQueueList = () => {
    console.log(songQueue + "length: " + songQueue.length);
    for (let i = 0; i < songQueue.length; i++) {
      setQueueList(
        <div classname="queue-list-entry">
          <img src={songQueue[i].image} alt="queuesongcover" />
          <div className='queuelist-song-name'>{songQueue[1].name}</div>
          <div className='queuelist-song-artist'>{songQueue[i].artist}</div>
        </div>);
    }
    songQueue.map(item => {
      console.log("DAS IST EIN ITEM: " + item);

    })
    return queueList;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      axios.get("http://192.168.0.67:3000/getCurrentSong").then(res => { setCurrentSongInfo(res.data) });
      axios.get("http://192.168.0.67:3000/getQueue").then(res => { setSongQueue(res.data); console.log(res.data); /*renderQueueList() */ })
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
          {songQueue.map(item => {
            return (<div className='queue-list-entry'>
              <img src={item.image} alt="queuesongcover" className='queue-list-entry-cover' />
              <div className='queuelist-song-name'>{item.name}</div>
              <div className='queuelist-song-artist'>{item.artist}</div>
            </div>)
          })}
        </div>
      </div>

    </div>
  )
}

export default App
