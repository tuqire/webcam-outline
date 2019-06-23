import DatGUI from 'dat-gui'

import { SHAPES } from '../objects/particles'

export default class Controls {
  constructor ({
    particles,
    scene
  } = {}) {
    this.gui = new DatGUI.GUI()

    this.addShapeControls(particles)
    this.addMouseRadiusControls(particles)
    this.addMousePushControls(particles)
    this.addYThresholdControls(particles)
    this.addSpeedControls(particles)
    this.addSizeControls(particles)
  }

  addShapeControls (particles) {
    this.gui.add(particles, 'particleShape', SHAPES)
      .onFinishChange(() => {
        particles.updateParticleVars()
      })
  }

  addYThresholdControls (particles) {
    this.gui.add(particles, 'yThreshold')
      .min(0)
      .max(0.5)
      .step(0.001)
      .onFinishChange(() => {
        particles.updateParticleVars()
      })
  }

  addMouseRadiusControls (particles) {
    this.gui.add(particles, 'mouseRadius')
      .min(0)
      .max(0.5)
      .step(0.01)
      .onFinishChange(() => {
        particles.updateParticleVars()
      })
  }

  addMousePushControls (particles) {
    this.gui.add(particles, 'mousePush')
      .min(0)
      .max(0.005)
      .step(0.00001)
      .onFinishChange(() => {
        particles.updateParticleVars()
      })
  }

  addSpeedControls (particles) {
    this.gui.add(particles, 'xSpeed')
      .min(0)
      .max(0.001)
      .step(0.000001)
      .onFinishChange(() => {
        particles.updateParticleParams()
      })

    this.gui.add(particles, 'ySpeed')
      .min(0)
      .max(0.001)
      .step(0.000001)
      .onFinishChange(() => {
        particles.updateParticleParams()
      })
  }

  addSizeControls (particles) {
    this.gui
      .add(particles, 'defaultSize')
      .min(0)
      .max(0.05)
      .step(0.0001)
      .onFinishChange(() => {
        particles.updateSizes()
      })

    this.gui
      .add(particles, 'outlineMultiplier')
      .min(0)
      .max(2)
      .step(0.01)
      .onFinishChange(() => {
        particles.updateSizes()
      })
  }
}
