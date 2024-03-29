
import { useState, useEffect } from 'react'
import './styles/app.css'
import logo from './assets/logo.png'
import coopLogo from './assets/eventlogo.png'
import PersonLogo from './assets/person.svg'
import NoteLogo from './assets/note.svg'
import axios from 'axios';
import Modal from 'react-modal';
import './styles/modal.css'

const customStyles = {
  content: {
    top: '45%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    background: 'linear-gradient(180deg, rgba(0, 75, 15, 1) 0%, rgba(25, 20, 20, 1) 25%)',
    borderRadius: "25px",
    overflowY: "hidden",
    boxShadow: "0 0 10px 10px grey",
    border: "none"
  },
};
const IS_PROD = true;
const PROD_API_SERVER = "https://spotimy-backend.vercel.app"
const LOCAL_API_SERVER = "http://192.168.0.67:3000"

Modal.setAppElement('#root');

function App() {
  const [currentSongInfo, setCurrentSongInfo] = useState([]);
  const [songQueue, setSongQueue] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchArtist, setSearchArtist] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [currentSongImage, setCurrentSongImage] = useState(null);

  const [modalIsOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  function closeModal() {
    setIsOpen(false);
  }

  function handleSearchNameChange(event) {
    console.log(searchName);
    setSearchName(event.target.value);
  }

  function handleSearchArtistChange(event) {
    setSearchArtist(event.target.value);
  }

  function search() {
    if (searchName === '' && searchArtist === '') { return; }

    axios.get(`${IS_PROD ? PROD_API_SERVER : LOCAL_API_SERVER}/search`, {
      params: {
        songname: searchName,
        artist: searchArtist
      }
    }).then(res => setSearchResults(res.data));
  }

  function handleAdd(event) {
    console.log(event.target.parentNode.getAttribute("id"));
    let songId = event.target.parentNode.getAttribute("id");
    axios.get(`${IS_PROD ? PROD_API_SERVER : LOCAL_API_SERVER}/addToQueue/${songId}`)
    closeModal();
  }



  useEffect(() => {
    const interval = setInterval(() => {
      // get current song
      axios.get(`${IS_PROD ? PROD_API_SERVER : LOCAL_API_SERVER}/getCurrentSong`).then(res => {
        if (res.data === "No Song is currently playing or is not available.") {
          console.error("ERROR: Could not get CURRENTSONG")
          return;
        } else {
          setCurrentSongInfo(res.data);
          setCurrentSongImage(res.data[2]);
          console.log("CURRENT SONG RESPONSE: ", res.data)
        }
        // get Queue
        axios.get(`${IS_PROD ? PROD_API_SERVER : LOCAL_API_SERVER}/getQueue`).then(res => {
          if (res.data === "Queue is currently empty.") {
            console.error("ERROR: Could not get QUEUE")
            return;
          } else {
            setSongQueue(res.data);
            console.log("CURRENT QUEUE RESPONSE: ", res.data);
          }
        })

      });


    }, 5000);
    return () => clearInterval(interval);
  }, [])


  return (
    <div className="App" id="App">
      <div className='title-box' id="mytitle">
        <img src={coopLogo} alt="logo" className="logo" />
      </div>
      <div className="current-song-box">
        <div style={{ padding: "10px" }}>Aktuell wird folgender Song abgespielt:</div>
        {currentSongImage ? <img src={currentSongImage} alt="currentsongcover" className='current-song-cover-image' /> : <div className="lds-ripple"><div></div><div></div></div>}
        <div style={{ fontWeight: 200, padding: "10px" }}>{currentSongInfo[0]}</div>
        <div style={{ fontSize: "1.2rem" }}>{currentSongInfo[1]}</div>
      </div>
      <div className="add-song-button" onClick={openModal}>+ Song hinzufügen</div>
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <div className='modal-container'>
          <div className='modal-top-bar'>
            <div>Suche einen Song </div>
          </div>
          <div className='modal-searchbar'>
            <img src={NoteLogo} alt="Songtitel" className='searchinput-logo' />
            <input value={searchName} className='modal-song-input' placeholder='Songtitel' onChange={handleSearchNameChange} />
          </div>
          <div className='modal-searchbar'>
            <img src={PersonLogo} alt="Songtitel" className='searchinput-logo' />
            <input value={searchArtist} className='modal-song-input' placeholder='Interpret' onChange={handleSearchArtistChange} />
          </div>
          <div className='modal-search-button' onClick={search}>Suchen</div>
          <div className='modal-result-list'>
            {searchResults[0]?.name ? searchResults.map((item, index) => {
              return (<div className='search-list-entry' id={item.uri}>
                <img src={item.image} alt="searchresult-songcover" className='search-list-entry-cover' />
                <div className='searchlist-song-name'>{item.name}</div>
                <div className='searchlist-song-artist'>{item.artist}</div>
                <div className='searchlist-addtoqueue-button' onClick={handleAdd}>+</div>
              </div>)
            }) : "Songsuche hat keine Ergebnisse zurückgegeben."}
          </div>
        </div>
      </Modal>
      <div className='queue-box'>
        <div>Diese Songs werden als Nächstes abgespielt:</div>
        <div className="queue-list">
          {/*queueList*/}
          {songQueue[0]?.name ? songQueue.map(item => {
            return (<div className='queue-list-entry' key={item.name}>
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
