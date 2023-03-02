import React from "react"
import { Container, Button } from "react-bootstrap"
import './Login.css'

const AUTH_URL =
  "https://accounts.spotify.com/authorize?client_id=41e0e5270872455586eb4c11d26e8017&response_type=code&redirect_uri=http://localhost:3000&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state"


export default function Login() {
  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="neumorphism-form">
        <h1 className="form-title">Lyric Speed Typer</h1>
        <h2 className="form-description">
          Type along to the lyrics of your favorite songs!</h2>

        <Button className="neumorphism-btn" href={AUTH_URL}>
          Login with Spotify
        </Button>
      </div>
    </Container>
  )
}