import { useState, useEffect } from "react"
import SpotifyPlayer from "react-spotify-web-playback";
import "./Player.css"; // import the CSS file for the player

export default function Player({ accessToken, trackUri }) {
  const [play, setPlay] = useState(false);

  useEffect(() => setPlay(true), [trackUri]);

  if (!accessToken) return null
  return (
    <div className="player-container">
      <SpotifyPlayer
        token={accessToken}
        showSaveIcon
        callback={(state) => {
          if (!state.isPlaying) setPlay(false);
        }}
        play={play}
        uris={trackUri ? [trackUri] : []}
      />
    </div>
  )
}