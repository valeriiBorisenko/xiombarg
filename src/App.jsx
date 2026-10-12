import Logo from './assets/logo.svg?react'
import PixelDissolve from './components/PixelDissolve'
import './App.scss'

export default function App() {
  return (
    <main className="stage">
      <PixelDissolve />

      <div className="stage__content">
        <h1 className="stage__brand">
          <Logo className="stage__logo" />
          <span className="visually-hidden">Xiombarg</span>
        </h1>

        <p className="stage__tagline">Indie Games Publisher</p>
        <p className="stage__soon">coming soon…</p>
      </div>
    </main>
  )
}
