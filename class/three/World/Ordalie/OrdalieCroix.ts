import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import DIFFICULTY from '@/constants/DIFFICULTY'
import ORDALIES from '@/constants/ORDALIES'
import DIFFICULTY_DATAS from '@/constants/DIFFICULTY_DATA'
import DATAS, { CroixInterface } from '@/constants/DIFFICULTY_DATA'

import WebGL from '@/class/three/WebGL'
import { remap } from '@/class/three/utils/Maths'
import Block from '@/class/three/World/Block'
import OrdalieManager from '@/class/three/World/Ordalie/OrdalieManager'
import Ordalie from '@/class/three/World/Ordalie/Ordalie'
import Character from '@/class/three/World/Character'
import useStore from '@/composables/useStore'

class OrdalieCroix {
  ordalie: Ordalie
  block: Block
  animation!: { [key: string]: any }

  // Gameplay
  debugObject: any
  timeScaleController: any
  gameplayParams: CroixInterface

  debugFolder: { [key: string]: any } | undefined

  constructor(_ordalie: Ordalie) {
    this.ordalie = _ordalie
    this.block = _ordalie.block
    this.gameplayParams = DIFFICULTY_DATAS[OrdalieManager.getDifficulty()].CROIX

    if (WebGL.debug.active) this.debugFolder = WebGL.debug.gui.addFolder('OrdalieCroixGame')
    this.setAnimation()
  }

  setHTMLPosition(container: HTMLDivElement) {
    //récupérer la taille de ce plane
    const planeSize = new THREE.Box3().setFromObject(this.block.getTextMesh())

    console.log('plane size', planeSize)

    const topLeftCorner3D = new THREE.Vector3(planeSize.min.x, planeSize.max.y, planeSize.max.z)
    const topRightCorner3D = new THREE.Vector3(planeSize.max.x, planeSize.max.y, planeSize.max.z)
    console.log('top left corner', topLeftCorner3D)
    console.log('top right corner', topRightCorner3D)

    //récupérer la position dans l'espace 2D de ce point en haut à gauche
    topLeftCorner3D.project(WebGL.camera.instance)
    const x1 = (topLeftCorner3D.x * 0.5 + 0.5) * WebGL.canvas.clientWidth
    const y = (topLeftCorner3D.y * -0.5 + 0.5) * WebGL.canvas.clientHeight

    topRightCorner3D.project(WebGL.camera.instance)
    const x2 = (topRightCorner3D.x * 0.5 + 0.5) * WebGL.canvas.clientWidth

    container.style.transform = `translate(${x1}px,${y}px)`

    const width = Math.abs(x1 - x2)
    container.style.width = width + 'px'
  }

  setAnimation() {
    this.animation = {}

    this.animation.mixer = new THREE.AnimationMixer(this.block.getModel().scene)

    this.animation.mixer.addEventListener('finished', (e) => {
      console.log(e)
      //le mec tape tellement vite qu'il remonte l'anim jusqu'au début
      if (e.direction === -1) {
        this.animation.actions['Croix_Descend'].stop()
        this.animation.actions['Croix_Descend'].play()
      } else {
        //fin de l'anim classique, le mec a perdu
      }

      // this.animation.actions['Croix_Descend'].timeScale = 1
      // this.animation.actions['Croix_Descend'].play()
    })

    this.animation.actions = {
      Croix_Descend: this.animation.mixer.clipAction(this.block.getModel().animations[0]),
      Croix_idle: this.animation.mixer.clipAction(this.block.getModel().animations[1]),
    }

    this.animation.actions.Croix_Descend.clampWhenFinished = true
    this.animation.actions.Croix_Descend.loop = THREE.LoopOnce
    this.animation.actions.Croix_Descend.timeScale = this.gameplayParams.fallingSpeedArm

    if (WebGL.debug.active) {
      this.debugFolder!.add(this.debugParams().animations, 'armsUp')
      this.debugFolder!.add(this.debugParams().animations, 'startGame')
      this.debug()
    }
  }

  debugParams() {
    return {
      animations: {
        armsUp: () => this.armsUp(),
        startGame: () => {
          this.animation.actions['Croix_Descend'].play()
          console.log('play ' + this.animation.actions['Croix_Descend'])
        },
      },
    }
  }

  armsUp() {
    this.animation.actions['Croix_Descend'].timeScale = this.gameplayParams.upSpeedArm

    setTimeout(() => {
      this.animation.actions['Croix_Descend'].timeScale = this.gameplayParams.fallingSpeedArm
    }, this.gameplayParams.upDurationArm)
  }

  play(animationName: string) {
    this.animation.actions[animationName].play()
  }

  debug() {
    this.debugObject = {
      timeScale: this.animation.actions['Croix_Descend'].timeScale,
      time: this.animation.actions['Croix_Descend'].time,

      animations: {
        armsUp: () => this.armsUp(),
        startGame: () => {
          this.animation.actions['Croix_Descend'].play()
          document.getElementById('input-typing').focus()
        },
      },
    }
    this.debugFolder.add(this.debugObject, 'timeScale').listen().disable()
    this.debugFolder.add(this.debugObject, 'time').step(0.01).listen().disable()
    this.debugFolder.add(this.debugObject.animations, 'armsUp')
    this.debugFolder.add(this.debugObject.animations, 'startGame')
  }

  update() {
    const { deltaTime } = WebGL.time

    // if (Character.getPosition().x > 3.5 && !useStore().ordalieCroix.value) {
    //   useStore().ordalieCroix.value = true
    //   this.animation.actions['Croix_Descend'].play()
    // }

    this.debugObject.timeScale = this.animation.actions['Croix_Descend'].timeScale
    this.debugObject.time = this.animation.actions['Croix_Descend'].time

    this.animation.mixer.update(deltaTime * 0.001)
    // console.log(remapped)
  }
}

export default OrdalieCroix
