import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'

import OTHERS from '@/constants/OTHERS'
import ORDALIES from '@/constants/ORDALIES'
import TRANSITIONS from '@/constants/TRANSITIONS'

import WebGL from '@/class/three/WebGL'
import Blocks from '@/class/three/World/Blocks'

class Block extends THREE.EventDispatcher {
  type: OTHERS | ORDALIES | TRANSITIONS
  // Model
  model: GLTF
  character: THREE.Mesh
  characterAnimations: THREE.AnimationClip[]
  textMesh: THREE.Mesh
  object: THREE.Object3D

  private position: THREE.Vector3 = new THREE.Vector3()
  // Box3
  private modelBox: THREE.Box3
  private planeTextBox: THREE.Box3
  private box: THREE.BoxHelper
  private size: THREE.Vector3

  constructor(_type: OTHERS | ORDALIES | TRANSITIONS) {
    super()

    console.log('Init Block ' + _type)

    this.type = _type
    this.setModel()
    this.setTextMesh()
    this.setCharacterModel()
    this.add()
    this.setPosition()
    // this.setBoxHelper()
    Blocks.onBlockCreated(this)
  }

  /**
   * Set model from type
   */
  setModel() {
    this.model = WebGL.resources.getItems(this.type, 'model') as GLTF
  }

  /**
   * Get model
   */
  getModel() {
    return this.model
  }

  /**
   * Set character from model
   */
  setCharacterModel() {
    this.character = this.model.scene.children.find((child) => child.name === 'character') as THREE.Mesh
  }

  /**
   * Get character model
   */
  getCharacterModel() {
    return this.character
  }

  /**
   * Set text region
   */
  setTextMesh() {
    this.textMesh = this.model.scene.children.find((child) => child.name === 'text') as THREE.Mesh
    this.getTextMeshBox()
  }

  getTextMeshBox() {
    this.planeTextBox = new THREE.Box3()
    if (!this.textMesh) return
    const { geometry, matrixWorld } = this.textMesh
    geometry.computeBoundingBox()
    this.planeTextBox.copy(geometry.boundingBox).applyMatrix4(matrixWorld)
    return this.planeTextBox
  }

  /**
   * Add model to scene
   */
  add() {
    this.object = this.model.scene
    this.modelBox = new THREE.Box3().setFromObject(this.object)
    this.size = this.modelBox.getSize(new THREE.Vector3())
    this.object.scale.set(1, 1, 1)
    WebGL.scene.add(this.object)
  }

  /**
   * Set position of model according to other blocks
   */
  setPosition() {
    if (Blocks.getBlockInstances().length < 1) return
    const lastBlockPositionX = Blocks.getLastBlockInstance().getPosition().x
    const lastBlockSizeX = Blocks.getLastBlockInstance().getSize().x
    const x = lastBlockSizeX + this.size.x
    this.object.position.setX(lastBlockPositionX + lastBlockSizeX / 2 + this.size.x / 2)
    this.position = this.object.position
  }

  /**
   * Get position
   */
  getPosition() {
    return this.position
  }

  /**
   * Get size of model
   */
  getSize() {
    return this.size
  }

  /**
   * Add box helper to model
   */
  setBoxHelper() {
    this.box = new THREE.BoxHelper(this.object, 0xffff00)
    WebGL.scene.add(this.box)
  }
}

export default Block