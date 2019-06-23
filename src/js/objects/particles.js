import FBO from 'three.js-fbo'
import { positionSizeSimulationFragmentShader, positionSizeSimulationVertexShader } from '../shaders/position-size-simulation-shaders'
import { differenceSimulationVertexShader, differenceSimulationFragmentShader } from '../shaders/difference-webcam'
import { vertexShader, fragmentShader } from '../shaders/shaders'

export const SHAPES = {
  CIRCLE: 'CIRCLE',
  SQUARE: 'SQUARE'
}

export default class Particles {
  constructor ({
    scene,
    configUniforms = {
      color: { value: new THREE.Color(0xffffff) },
      sizeMultiplierForScreen: { value: (window.innerHeight * window.devicePixelRatio) / 2 }
    },
    blending = THREE.AdditiveBlending,
    transparent = true,
    depthTest = true,
    depthWrite = false,

    renderer,

    numParticles = 10000,

    // webcam particle values
    mouseRadius = 0.075,
    mousePush = 0.0004,

    particleShape = SHAPES.CIRCLE,
    defaultSize = 0.003,
    outlineMultiplier = 0.6,
    xSpeed = 0.000065,
    ySpeed = 0.0002,
    yThreshold = 0.05
  }) {
    this.renderer = renderer

    this.numParticles = numParticles

    // webcm particle controls
    this.mouseRadius = mouseRadius
    this.mousePush = mousePush

    this.particleShape = particleShape
    this.defaultSize = defaultSize
    this.outlineMultiplier = outlineMultiplier

    this.xSpeed = xSpeed
    this.ySpeed = ySpeed
    this.yThreshold = yThreshold

    this.windowHalfX = window.innerWidth / 2
    this.windowHalfY = window.innerHeight / 2

    this.videoEl = document.createElement('video')
    this.videoWidth = 1280
    this.videoHeight = 720

    if (navigator.getUserMedia) {
      navigator.getUserMedia({ video: { width: this.videoWidth, height: this.videoHeight } }, stream => {
        const videoEl = this.videoEl
        videoEl.srcObject = stream
        videoEl.autoplay = true

        this.addParticles({
          scene,
          renderer,
          configUniforms,
          blending,
          transparent,
          depthTest,
          depthWrite
        })
      }, () => console.error('video failed to load'))
    } else {
      const info = document.getElementById('info')
      info.innerHTML = 'Requires use of webcam. Please use the latest version of Chrome.'
    }
  }

  addParticles ({
    scene,
    renderer,
    configUniforms,
    blending,
    transparent,
    depthTest,
    depthWrite
  }) {
    // height and width that set up a texture in memory
    // this texture is used to store particle values
    const tHeight = this.tHeight = Math.ceil(Math.sqrt(this.numParticles))
    const tWidth = this.tWidth = tHeight
    this.numParticles = tWidth * tHeight

    const webcamEl = this.webcamEl = document.createElement('canvas')
    this.webcamElContext = webcamEl.getContext('2d')

    const webcamTexture = this.webcamTexture = new THREE.Texture(webcamEl)
    webcamTexture.minFilter = webcamTexture.magFilter = THREE.NearestFilter
    webcamTexture.needsUpdate = true

    this.webcamDifferenceFBO = new FBO({
      tWidth: this.webcamEl.width,
      tHeight: this.webcamEl.height,
      renderer: renderer.get(),
      uniforms: {
        webcamWidth: { type: 'f', value: this.webcamEl.width },
        webcamHeight: { type: 'f', value: this.webcamEl.height },
        tWebcam: { type: 't', value: webcamTexture }
      },
      simulationVertexShader: differenceSimulationVertexShader,
      simulationFragmentShader: differenceSimulationFragmentShader
    })

    this.positionSizeFBO = new FBO({
      tWidth: this.webcamEl.width,
      tHeight: this.webcamEl.height,
      renderer: renderer.get(),
      uniforms: {
        tWebcam: { type: 't', value: 0 },

        tParams: { type: 't', value: 0 },
        mouse: { value: new THREE.Vector3(10000, 10000, 10000) },
        mouseRadius: { type: 'f', value: this.mouseRadius },
        mousePush: { type: 'f', value: this.mousePush },
        yThreshold: { type: 'f', value: this.yThreshold },

        defaultSize: { type: 'f', value: this.defaultSize },
        outlineMultiplier: { type: 'f', value: this.outlineMultiplier }
      },
      simulationVertexShader: positionSizeSimulationVertexShader,
      simulationFragmentShader: positionSizeSimulationFragmentShader
    })

    this.updateParticleParams()

    const uniforms = Object.assign({}, configUniforms, {
      isCircle: { type: 'b', value: this.particleShape === SHAPES.CIRCLE },
      tSize: { type: 't', value: this.positionSizeFBO.targets[0] },
      tWebcam: { type: 't', value: 0 },

      tColour: { type: 't', value: webcamTexture }
    })

    this.material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      blending,
      depthTest,
      depthWrite,
      transparent
    })

    // set uv coords of particles in texture as positions
    const geometry = new THREE.Geometry()

    for (let i = 0; i < this.numParticles; i++) {
      const vertex = new THREE.Vector3()
      vertex.x = (i % tWidth) / tWidth
      vertex.y = Math.floor(i / tWidth) / tHeight
      geometry.vertices.push(vertex)
    }

    this.particles = new THREE.Points(geometry, this.material)
    this.particles.frustumCulled = false

    scene.add(this.get())

    this.ready = true
    document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false)
  }

  updateParticleParams () {
    const params = new Float32Array(this.numParticles * 4)

    for (let i = 0, i4 = 0; i < this.numParticles; i++, i4 += 4) {
      const velocity = this.getVelocity()

      params[i4] = velocity.x
      params[i4 + 1] = velocity.y
      // params[i4 + 2] = this.getSize()
      // params[i4 + 3] = this.getSizeInc()
    }

    this.positionSizeFBO.setTextureUniform('tParams', params)
  }

  getVelocity () {
    return {
      x: this.xSpeed * Math.random(),
      y: this.ySpeed * (Math.random() / 2 + 0.5)
    }
  }

  getSize () {
    return this.particleSize * Math.random() / 2
  }

  getSizeInc () {
    return this.particleSizeInc * Math.random() * 2
  }

  onDocumentMouseMove (event) {
    this.mouseX = this.windowHalfX - event.clientX
    this.mouseY = event.clientY - this.windowHalfY

    this.positionSizeFBO.simulationShader.uniforms.mouse.value.set(0.5 * this.mouseX / this.windowHalfX, -0.5 * this.mouseY / this.windowHalfY, 0)
  }

  update () {
    if (this.ready) {
      const { videoEl, webcamElContext, webcamEl: { width: videoWidth, height: videoHeight }, webcamTexture } = this
      if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
        webcamElContext.drawImage(videoEl, 0, 0, videoWidth, videoHeight)
        webcamTexture.needsUpdate = true
      }

      this.webcamDifferenceFBO.simulate()
      this.positionSizeFBO.simulationShader.uniforms.tWebcam.value = this.webcamDifferenceFBO.getCurrentFrame()
      this.positionSizeFBO.simulate()
      this.material.uniforms.tSize.value = this.positionSizeFBO.getCurrentFrame()
    }
  }

  get () {
    return this.particles
  }

  setCameraZ (newCameraZ) {
    this.cameraZ = newCameraZ
  }

  updateParticleVars () {
    this.positionSizeFBO.simulationShader.uniforms.mouseRadius.value = this.mouseRadius
    this.positionSizeFBO.simulationShader.uniforms.mousePush.value = this.mousePush
    this.positionSizeFBO.simulationShader.uniforms.yThreshold.value = this.yThreshold
    this.material.uniforms.isCircle.value = this.particleShape === SHAPES.CIRCLE
  }

  updateSizes () {
    this.positionSizeFBO.simulationShader.uniforms.defaultSize.value = this.defaultSize
    this.positionSizeFBO.simulationShader.uniforms.outlineMultiplier.value = this.outlineMultiplier
  }
}
