import { useState, useEffect } from "react"
import useAuth from "./useAuth"
import Player from "./Player"
import TrackSearchResult from "./TrackSearchResult"
import { Container, Form } from "react-bootstrap"
import SpotifyWebApi from "spotify-web-api-node"
import axios from "axios"
import './Dashboard.css'

const spotifyApi = new SpotifyWebApi({
  clientId: "41e0e5270872455586eb4c11d26e8017",
})

export default function Dashboard({ code }) {
  const accessToken = useAuth(code)
  const [search, setSearch] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [playingTrack, setPlayingTrack] = useState()
  const [lyrics, setLyrics] = useState("")
  const [words, setWords] = useState([])
 
  const [currentInput, setCurrentInput] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(-1);
  const [currentChar, setCurrentChar] = useState("")

  function chooseTrack(track) {
    setPlayingTrack(track)
    setSearch("")
    setLyrics("")
  }

  function handleKeyDown({keyCode, key}) {
    if(keyCode === 32) {
      // keycode 32 is spacebar
      checkMatch()
      setCurrentInput("")
      setCurrentWordIndex(currentWordIndex + 1)
      setCurrentCharIndex(-1)
    } else if (keyCode === 8) {
      // keycode 8 is backspace
      setCurrentCharIndex(currentCharIndex - 1)
      setCurrentChar("")
    } 
      else if (keyCode !== 16) {
      setCurrentCharIndex(currentCharIndex + 1)
      setCurrentChar(key)
    }
  }

  function checkMatch() {
    const wordToCompare = words[currentWordIndex]
    const doesItMatch = wordToCompare === currentInput.trim()
    if(doesItMatch) {
      setCorrect(correct + 1)
    } else {
      setIncorrect(incorrect + 1)
    }
  }

  function getCharClass(wordIdx, charIdx, char) {
    if(wordIdx === currentWordIndex && charIdx === currentCharIndex && currentChar) {
      if(char === currentChar) {
        return "has-background-success"
      } else {
        return "has-background-danger"
      }
    } else if (wordIdx === currentWordIndex && currentCharIndex >= words[currentWordIndex].length) {
      return "has-background-success"
    } else {
      return ""
    }
  }

  useEffect(() => {
    if (!playingTrack) return

    axios
      .get("https://lyric-speed-typer-api.up.railway.app/lyrics", {
        params: {
          track: playingTrack.title,
          artist: playingTrack.artist,
        },
      })
      .then(res => {
        setLyrics(res.data.lyrics)
      })
  }, [playingTrack])

   useEffect(() => {
    setWords(lyrics.replace(/\n/g, " ").replace("  ", " ").split(" "))
    setCurrentWordIndex(0)
    setCorrect(0)
    setIncorrect(0)
    setCurrentCharIndex(-1)
    setCurrentChar("")
  }, [lyrics])


  useEffect(() => {
    if (!accessToken) return
    spotifyApi.setAccessToken(accessToken)
  }, [accessToken])



  useEffect(() => {
    if (!search) return setSearchResults([])
    if (!accessToken) return

    let cancel = false
    spotifyApi.searchTracks(search).then(res => {
      if (cancel) return
      setSearchResults(
        res.body.tracks.items.map(track => {
          const smallestAlbumImage = track.album.images.reduce(
            (smallest, image) => {
              if (image.height < smallest.height) return image
              return smallest
            },
            track.album.images[0]
          )

          return {
            artist: track.artists[0].name,
            title: track.name,
            uri: track.uri,
            albumUrl: smallestAlbumImage.url,
          }
        })
      )
    })

    return () => (cancel = true)
  }, [search, accessToken])

  return (
    <Container className="d-flex flex-column py-2 neumorphic-container" style={{ height: "100vh" }}>
  <Form.Control
    type="search"
    placeholder="Search Songs/Artists"
    value={search}
    onChange={e => setSearch(e.target.value)}
    className="search-input"
  />
  <div className="flex-grow-1 my-2 neumorphic-scroll neumorphic-text" >
    {searchResults.map(track => (
      <TrackSearchResult
        track={track}
        key={track.uri}
        chooseTrack={chooseTrack}
      />
    ))}
    {searchResults.length === 0 && (
      <div className="text-center neumorphic-text" style={{ whiteSpace: "pre", fontSize: "15px", display: "flex", flexWrap: "wrap" }}>
        {words.map((word, i) => (
          <span key={i}>
            {word.split("").map((char, idx) => (
              <span className={getCharClass(i, idx, char)} key={idx}>{char}</span>
            ))}
            {" "}
          </span>
        ))}
      </div>
    )}
  </div>
  <div className="control section neumorphic-input">
    <input placeholder="Welcome! Type along to the lyrics here!" type="text" className="input neumorphic-text" onKeyDown={handleKeyDown} value={currentInput} onChange={(e) => setCurrentInput(e.target.value)} />
  </div>
  <div className="section neumorphic-stats">
    <div className="columns">
      <div className="column has-text-centered">
        <p className="is-size-8 neumorphic-text">Correct Words:</p>
        <p className="has-text-primary is-size-4 neumorphic-text">
          {correct}
        </p>
      </div>
      <div className="column has-text-centered">
        <div className="is-size-8 neumorphic-text">Accuracy:</div>
        <p className="has-text-primary is-size-4 neumorphic-text">
          {Math.round(correct / (correct + incorrect) * 100)}%
        </p>
      </div>
    </div>
    <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
  </div>
</Container>
  )
}