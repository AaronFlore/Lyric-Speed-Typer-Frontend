import { useState, useEffect } from "react";
import Axios from "axios";
import SpotifyPlayer from "react-spotify-web-playback";
import "./Player.css"; // import the CSS file for the player

export default function Player({ accessToken, trackUri }) {
  const [play, setPlay] = useState(false);

  useEffect(() => setPlay(true), [trackUri]);

  useEffect(() => {
    if (!accessToken) return;
    Axios.post("https://lyricspeedtyper-api.onrender.com/refresh", { refreshToken: accessToken.refreshToken })
      .then(res => {
        setAccessToken(res.data.accessToken);
        setExpiresIn(res.data.expiresIn);
      })
      .catch(() => console.log('Error refreshing access token'));
  }, [accessToken]);

  return (
    <div className="player-container">
      <SpotifyPlayer
        token={accessToken ? accessToken.accessToken : ""}
        showSaveIcon
        callback={(state) => {
          if (!state.isPlaying) setPlay(false);
        }}
        play={play}
        uris={trackUri ? [trackUri] : []}
      />
    </div>
  );
}
