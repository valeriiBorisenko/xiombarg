import { useEffect, useRef } from 'react'
import './PixelDissolve.scss'

const PIXEL = 3
const MAX_PARTICLES = 180
const SPAWN_PER_MOVE = 5

function createParticle(x, y, speed) {
  const size = PIXEL + Math.floor(Math.random() * 3)
  const angle = Math.random() * Math.PI * 2
  const velocity = 0.15 + Math.random() * (0.55 + speed * 0.02)

  return {
    x,
    y,
    size,
    vx: Math.cos(angle) * velocity,
    vy: Math.sin(angle) * velocity - 0.12,
    life: 1,
    decay: 0.012 + Math.random() * 0.02,
    alpha: 0.18 + Math.random() * 0.35,
  }
}

export default function PixelDissolve() {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const pointerRef = useRef({ x: -9999, y: -9999, prevX: -9999, prevY: -9999 })
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const onPointerMove = (event) => {
      const { clientX: x, clientY: y } = event
      const pointer = pointerRef.current
      const dx = x - pointer.prevX
      const dy = y - pointer.prevY
      const speed = Math.min(Math.hypot(dx, dy), 40)

      pointer.prevX = pointer.x
      pointer.prevY = pointer.y
      pointer.x = x
      pointer.y = y

      if (pointer.prevX < -1000) {
        pointer.prevX = x
        pointer.prevY = y
        return
      }

      const count = Math.min(
        SPAWN_PER_MOVE + Math.floor(speed / 8),
        MAX_PARTICLES - particlesRef.current.length,
      )

      for (let i = 0; i < count; i += 1) {
        const offsetX = (Math.random() - 0.5) * 18
        const offsetY = (Math.random() - 0.5) * 18
        particlesRef.current.push(createParticle(x + offsetX, y + offsetY, speed))
      }

      if (particlesRef.current.length > MAX_PARTICLES) {
        particlesRef.current.splice(0, particlesRef.current.length - MAX_PARTICLES)
      }
    }

    const onPointerLeave = () => {
      pointerRef.current = { x: -9999, y: -9999, prevX: -9999, prevY: -9999 }
    }

    const tick = () => {
      const { innerWidth: w, innerHeight: h } = window
      ctx.clearRect(0, 0, w, h)

      const particles = particlesRef.current
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.985
        p.vy *= 0.985
        p.life -= p.decay

        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }

        ctx.globalAlpha = p.alpha * p.life
        ctx.fillStyle = '#f2f2f2'
        ctx.fillRect(
          Math.round(p.x / PIXEL) * PIXEL,
          Math.round(p.y / PIXEL) * PIXEL,
          p.size,
          p.size,
        )
      }

      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="pixel-dissolve" aria-hidden="true" />
}
