import gsap from 'gsap'

import OTHERS from '@/constants/OTHERS'

import Block from '@/class/three/World/Block'
import OtherManager from '@/class/three/World/Other/OtherManager'
import OtherSplashscreen from '@/class/three/World/Other/OtherSplashscreen'
import OtherCinematic from '@/class/three/World/Other/OtherCinematic'
import OtherTutorial from '@/class/three/World/Other/OtherTutorial'

class Other {
  block: Block
  instance: OtherSplashscreen | OtherCinematic | OtherTutorial
  updateId: () => void

  constructor(_type: OTHERS) {
    this.block = new Block(_type)
    switch (_type) {
      case OTHERS.SPLASHSCREEN:
        this.instance = new OtherSplashscreen(this)
        break
      case OTHERS.CINEMATIC:
        this.instance = new OtherCinematic(this)
        break
      case OTHERS.TUTORIAL:
        this.instance = new OtherTutorial(this)
        break
    }
    this.updateId = this.update
  }

  start() {
    this.instance.start()
    gsap.ticker.add(this.updateId)
    OtherManager.onStarted()
  }

  end() {
    gsap.ticker.remove(this.updateId)
    OtherManager.onEnded()
  }

  update = () => {
    this.instance && this.instance.update()
  }
}

export default Other
