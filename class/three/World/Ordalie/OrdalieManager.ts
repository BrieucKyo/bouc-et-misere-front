import ORDALIES from '@/constants/ORDALIES'
import DIFFICULTY from '@/constants/DIFFICULTY'

import Ordalie from '@/class/three/World/Ordalie/Ordalie'

class OrdalieManager {
  private ordalies: Ordalie[] = []
  private lastType: ORDALIES
  private active: Ordalie
  private difficulty: DIFFICULTY

  constructor() {
    this.setDifficulty(DIFFICULTY.EASY)
  }

  /**
   * Create ordalie from type
   */
  create(_type: ORDALIES) {
    this.ordalies.push(new Ordalie(_type))
    this.lastType = _type
  }

  /**
   * Create next ordalie
   */
  createNext() {
    const random = Math.floor(Math.random() * 2)

    // @TODO Define logic
    switch (this.lastType) {
      case ORDALIES.CROIX:
        this.create(random === 0 ? ORDALIES.CAULDRON : ORDALIES.BBQ)
        break
      case ORDALIES.BBQ:
        this.create(random === 0 ? ORDALIES.CROIX : ORDALIES.CAULDRON)
        break
      case ORDALIES.CAULDRON:
        this.create(random === 0 ? ORDALIES.BBQ : ORDALIES.CROIX)
        break
    }
  }

  /**
   * Get all ordalies
   */
  getAll() {
    return this.ordalies
  }

  /**
   * Get active ordalie
   */
  getActive() {
    return this.active
  }

  /**
   * Set ordalies difficulty
   */
  setDifficulty(_difficulty: DIFFICULTY) {
    this.difficulty = _difficulty
  }

  /**
   * Get ordalies difficulty
   */
  getDifficulty() {
    return this.difficulty
  }

  onOrdalieCreated() {
    console.log('Ordalie created')
  }

  onOrdalieFinished() {
    console.log('Ordalie finished')
  }
}

export default new OrdalieManager()
