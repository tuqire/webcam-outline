import isWebglEnabled from 'detector-webgl'
import Stats from 'stats.js'
import Camera from './io/camera'
import Controls from './io/controls'
import Renderer from './io/renderer'
import Scene from './objects/scene'
import Particles from './objects/particles'

document.addEventListener('DOMContentLoaded', () => {
  if (isWebglEnabled) {
    const container = document.getElementById('webcam-simulation-container')
    const renderer = new Renderer({ container })
    const scene = new Scene()
    const particles = new Particles({
      scene,
      renderer,
      numParticles: window.matchMedia('(max-width: 480px)').matches ? 4000 : 100000,
      webcamOutlineStrength: 1000,
      defaultSize: 0.005,
      outlineMultiplier: 0.0003
    })
    const camera = new Camera({
      aspectRatio: 1,
      particles,
      position: {
        x: 0,
        y: 0.001,
        z: -1.37
      }
    })
    const stats = new Stats()

    const init = () => {
      new Controls({ particles }) // eslint-disable-line

      stats.showPanel(0)
      document.body.appendChild(stats.dom)
    }

    const animate = () => {
      requestAnimationFrame(animate) // eslint-disable-line
      render()
    }

    const render = () => {
      stats.begin()

      particles.update()

      renderer.render({
        scene: scene.get(),
        camera: camera.get()
      })

      stats.end()
    }

    init()
    animate()
  } else {
    const info = document.getElementById('info')
    info.innerHTML = 'Your browser is not supported. Please use the latest version of Firefox or Chrome.'
  }
})