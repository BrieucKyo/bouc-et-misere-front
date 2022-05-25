import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from 'gsap'

import ORDALIES from '@/constants/ORDALIES'

import Ordalie from '@/class/three/World/Ordalie/Ordalie'
import Block from '@/class/three/World/Block'
import WebGL from '@/class/three/WebGL'

import fragmentShader from '@/class/three/shaders/burning/fragment.glsl'
import vertexShader from '@/class/three/shaders/burning/vertex.glsl'

class OrdalieBBQ {
  instance: Ordalie
  block: Block
  character: THREE.Mesh
  texts: THREE.Mesh[]

  animation: { [key: string]: any }
  forwardSpeed = 0.1
  modulo = 0
  uniforms: any

  debugFolder: GUI

  constructor(_ordalie: Ordalie) {
    this.instance = _ordalie
    this.block = _ordalie.block
    this.texts = []
    if (WebGL.debug.isActive()) this.debugFolder = WebGL.debug.addFolder('OrdalieBBQ')

    this.instance.block.getModel().scene.traverse((mesh) => {
      if (mesh.name.startsWith('text')) {
        this.texts.push(mesh)
      }
    })

    const texture = this.texts[0].material.map as THREE.Texture

    const noise = WebGL.resources.getItems(this.block.getType(), 'noise') as THREE.Texture
    const gradient = WebGL.resources.getItems(this.block.getType(), 'gradient') as THREE.Texture

    this.setCharacter()
    this.setAnimation()

    this.uniforms = {
      uTexture: { value: texture },
      uNoise: { value: noise },
      uGradient: { value: gradient },
    }

    for (let i = 0; i < this.texts.length; i++) {
      this.texts[i].material = new THREE.ShaderMaterial({
        uniforms: { ...this.uniforms, uDissolve: { value: 0 } },
        fragmentShader: fragmentShader,
        vertexShader: vertexShader,
        transparent: true,
      })

      // if (this.debugFolder) {
      //   this.debugFolder
      //     .add(this.texts[i].material.uniforms.uDissolve, 'value', -0.1, 1.1)
      //     .step(0.01)
      //     .onChange((value) => {
      //       this.texts[i].material.uniforms.uDissolve.value = value
      //     })
      // }
    }
  }

  start() {
    useStore().currentOrdalie.value = ORDALIES.BBQ
  }

  end() {
    useStore().currentOrdalie.value = null
    //todo, call the manager to go to the next block
  }

  private setCharacter() {
    const rig = this.block.getModel().scene.children.find((child) => child.name === 'RIG_Cuisinier') as THREE.Mesh
    this.character = rig.children.find((child) => child.name === 'MAIN_SIDE_ROOT') as THREE.Mesh

    // console.log()
    // this.block.getModel().scene.traverse((mesh) => {
    // console.log(mesh.material)
    // if (mesh.material.name === 'cuisinier') {
    //   console.log(mesh)
    // }
    // })
  }

  private setAnimation() {
    this.animation = {}

    this.animation.mixer = new THREE.AnimationMixer(this.block.getModel().scene)

    this.animation.actions = {
      Braises_Cuisinier_Avance: this.animation.mixer.clipAction(this.block.getModel().animations[0]),
      Braises_Cuisinier_Idle: this.animation.mixer.clipAction(this.block.getModel().animations[1]),
      Braises_Cuisinier_Mort_V2: this.animation.mixer.clipAction(this.block.getModel().animations[2]),
    }

    this.animation.actions['Braises_Cuisinier_Avance'].clampWhenFinished = true
    this.animation.actions['Braises_Cuisinier_Avance'].loop = THREE.LoopOnce

    this.animation.actions['Braises_Cuisinier_Idle'].timeScale = 1.2
    // this.animation.actions['Braises_Cuisinier_Idle'].clampWhenFinished = true
    // this.animation.actions['Braises_Cuisinier_Idle'].loop = THREE.LoopOnce
    this.animation.actions['Braises_Cuisinier_Mort_V2'].clampWhenFinished = true
    this.animation.actions['Braises_Cuisinier_Mort_V2'].loop = THREE.LoopOnce

    // Play the action
    this.animation.play = (name: string) => {
      this.animation.actions[name].play()
    }

    this.animation.play('Braises_Cuisinier_Idle')

    this.animation.mixer.addEventListener('finished', (e) => {
      if (e.action._clip.name === 'Braises_Cuisinier_Avance') {
        this.animation.actions['Braises_Cuisinier_Avance'].stop()
        this.animation.actions['Braises_Cuisinier_Idle'].reset()
        this.animation.play('Braises_Cuisinier_Idle')
      }

      if (e.action._clip.name === 'Braises_Cuisinier_Mort_V2') {
        this.end()
      }
    })

    // Debug
    // if (WebGL.debug.isActive()) {
    //   this.debugFolder.add(this.debugParams().animations, 'playCharacterEnter')
    // }
  }

  makeAStep() {
    this.animation.actions['Braises_Cuisinier_Avance'].stop()
    this.animation.play('Braises_Cuisinier_Avance')

    this.animation.actions['Braises_Cuisinier_Idle'].crossFadeTo(this.animation.actions['Braises_Cuisinier_Avance'], 0.16)

    gsap.to(this.character.position, {
      x: this.character.position.x + this.forwardSpeed,
      duration: 1,
    })
  }

  gameOver() {
    this.animation.play('Braises_Cuisinier_Mort_V2')
    this.animation.actions['Braises_Cuisinier_Idle'].crossFadeTo(this.animation.actions['Braises_Cuisinier_Mort_V2'], 0.16)
    // this.animation.actions['Braises_Cuisinier_Mort_V2'].crossFadeFrom(this.animation.actions['Braises_Cuisinier_Idle'], 0.16)

    for (let i = 0; i < this.texts.length; i++) {
      const uDissolve = this.texts[i].material.uniforms.uDissolve

      gsap.to(uDissolve, {
        value: 1,
        duration: 1,
      })
    }
  }

  setHTMLPosition(container: HTMLDivElement, i: number) {
    //récupérer la taille de ce plane
    const planeSize = new THREE.Box3().setFromObject(this.texts[i])

    const topLeftCorner3D = new THREE.Vector3(planeSize.min.x, planeSize.max.y, planeSize.max.z)
    const topRightCorner3D = new THREE.Vector3(planeSize.max.x, planeSize.max.y, planeSize.max.z)
    const bottomLeftCorner3D = new THREE.Vector3(planeSize.min.x, planeSize.min.y, planeSize.max.z)

    const center3D = new THREE.Vector3((topLeftCorner3D.x + topRightCorner3D.x) / 2, (topLeftCorner3D.y + bottomLeftCorner3D.y) / 2, planeSize.max.z)

    //récupérer la position dans l'espace 2D de ce point en haut à gauche
    center3D.project(WebGL.camera.instance)
    const x1 = (center3D.x * 0.5 + 0.5) * WebGL.canvas.clientWidth
    const y1 = (center3D.y * -0.5 + 0.5) * WebGL.canvas.clientHeight

    container.style.transform = `translate(${x1}px,${y1}px)`
  }

  update() {
    const { deltaTime } = WebGL.time
    this.animation.mixer.update(deltaTime * 0.001)
  }
}

export default OrdalieBBQ
