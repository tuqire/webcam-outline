import isWebglEnabled from 'detector-webgl'
import Stats from 'stats.js'
import Camera from './io/camera'
import Controls from './io/controls'
import Renderer from './io/renderer'
import Scene from './objects/scene'
import Particles from './objects/particles'

import getParameterByName from './helpers/getParameterByName'
import showInfoBox from './helpers/showInfoBox'
import isNotMobileScreen from './helpers/isNotMobileScreen'

document.addEventListener('DOMContentLoaded', () => {
  const quality = Number(getParameterByName('quality'))

  if (!quality || isNaN(quality)) {
    document.getElementById('select-quality').style.display = 'block'
    return
  }

  if (isWebglEnabled && isNotMobileScreen()) {
    showInfoBox()

    const container = document.getElementById('simulation')
    const renderer = new Renderer({ container })
    const scene = new Scene()
    const particles = new Particles({
      scene,
      renderer,
      numParticles: quality
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
    document.getElementById('no-support').style.display = 'block'
  }
})
