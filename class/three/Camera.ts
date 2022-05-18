import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'

import WebGL from '@/class/three/WebGL'
import Blocks from './World/Blocks'
import { clamp } from '@/class/three/utils/Maths'

class Camera extends THREE.EventDispatcher {
  parent: THREE.Group
  instance: THREE.PerspectiveCamera
  private target: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
  private controls: OrbitControls
  private currentPosX = 0
  private debugFolder: { [key: string]: any }
  private debugParams: { [key: string]: any }

  constructor() {
    super()

    if (WebGL.debug.active) this.debugFolder = WebGL.debug.gui.addFolder('camera')

    this.debugParams = {
      parallaxFactor: 0.18,
      moveXSpeed: 0.3,
    }

    this.setInstance()
    // this.setControls()
    this.setFov()
  }

  setInstance() {
    this.parent = new THREE.Group()
    this.parent.position.set(0, 0, 16)
    this.instance = new THREE.PerspectiveCamera(0, WebGL.sizes.width / WebGL.sizes.height, 1, 1000)
    this.instance.position.set(0, 0, 0)
    this.parent.add(this.instance)

    this.setFov()
    WebGL.scene.add(this.parent)

    if (WebGL.debug.active) {
      this.debugFolder.add(this.debugParams, 'parallaxFactor', 0, 1.9).step(0.1)
      this.debugFolder.add(this.debugParams, 'moveXSpeed', 0.0001, 2).step(0.1)
      this.debugFolder.add(this.parent.position, 'x')
      this.debugFolder.add(this.parent.position, 'z')
    }
  }

  setPlane() {
    const geometry = new THREE.PlaneGeometry(20, 20)
    geometry.rotateX(-Math.PI / 2)
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    const mesh = new THREE.Mesh(geometry, material)
    WebGL.scene.add(mesh)
  }

  setControls() {
    this.controls = new OrbitControls(this.instance!, WebGL.canvas)
    this.controls.enableDamping = true
    this.controls.enabled = false

    if (WebGL.debug.active) {
      this.debugFolder.add(this.controls, 'enabled')
    }
  }

  setFov() {
    const dist = this.parent.position.z - 0 // plane position z
    const height = (WebGL.sizes.height / WebGL.sizes.width) * 2 // plane height
    this.instance.fov = 2 * Math.atan(height / (2 * dist)) * (180 / Math.PI)
    this.instance!.updateProjectionMatrix()
  }

  getPosition() {
    return this.parent.position
  }

  getTargetPosition() {
    return this.target
  }

  moveOnX(direction: 'left' | 'right') {
    if (!this.instance) return

    const maxBlocksX = Blocks.getLastBlockInstance().getPosition().x
    const directionCoef = direction === 'right' ? -1 : 1
    this.currentPosX += 0.02 * directionCoef
    this.currentPosX = clamp(this.currentPosX, 0, maxBlocksX)

    this.parent.position.x = this.currentPosX
    this.target.x = this.currentPosX
  }

  onResize() {
    this.instance!.aspect = WebGL.sizes.width / WebGL.sizes.height
    this.setFov()
    this.instance!.updateProjectionMatrix()
  }

  onUpdate() {
    this.setSmooth()
  }

  setSmooth() {
    this.instance.position.x += (WebGL.mouse.screenPosition.x - this.instance.position.x) * this.debugParams.parallaxFactor
    this.instance.position.y += (WebGL.mouse.screenPosition.y - this.instance.position.y) * this.debugParams.parallaxFactor
    this.instance.lookAt(this.target)
  }

  destroy() {
    this.controls!.dispose()
  }
}

export default Camera
