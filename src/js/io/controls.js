import DatGUI from 'dat-gui'

export default class Controls {
  constructor ({
    particles,
    scene
  } = {}) {
    this.gui = new DatGUI.GUI()

    this.addSizeControls(particles)
  }

  addSizeControls (particles) {
    this.gui
      .add(particles, 'defaultSize')
      .min(0)
      .max(0.025)
      .step(0.0005)
      .onFinishChange(() => {
        particles.updateSizes()
      })

    this.gui
      .add(particles, 'outlineMultiplier')
      .min(0)
      .max(0.005)
      .step(0.00005)
      .onFinishChange(() => {
        particles.updateSizes()
      })
  }
}
