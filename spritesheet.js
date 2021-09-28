class Spritesheet {
  //private attributes
  #sequences = {}
  #path = ""
  #numRows = 1
  #numCols = 1
  #naturalWidth = 64
  #naturalHeight = 64
  #frames = {}

  constructor(path = null, numrows = 1, numcols = 1, frameWidth = null, frameHeight = null) {
    this.#path = path
    this.#numRows = numrows
    this.#numCols = numcols
    this.image = new Image()
    this.reader = new FileReader()
    this.isImageLoaded = false
    this.frameWidth = frameWidth
    this.frameHeight = frameHeight
  }

  init() {
    this.reader.onload = (e) => {
      this.image.onload = () => {
        this.isImageLoaded = true
        this.#naturalWidth = this.image.naturalWidth
        this.#naturalHeight = this.image.naturalHeight

        if (this.frameWidth == null && !(this.frameHeight == null)) {
          this.frameWidth = this.#naturalWidth / this.#numCols
          this.frameHeight = this.#naturalHeight / this.#numRows
        }

        let ind = 0
        for (let r = 0; r < this.#numRows; r++) {
          for (let c = 0; c < this.#numCols; c++) {
            this.#frames[ind] = {
              x: c * this.frameWidth,
              y: r * this.frameHeight,
              w: this.frameWidth,
              h: this.frameHeight,
            }
            ind++
          }
        }
      }
      this.image.src = e.target.result
    }

    let filepath = this.urlToBlob(this.#path).then((response) => {
      this.reader.readAsDataURL(response)
    })
  }

  /********************************************
   * frame methods
   * getter and setter for frames
   * setter you can pass a series of frames to
   * and all get updated
   ********************************************/

  getIsImageLoaded() {
    return this.isImageLoaded
  }
  getImageSource() {
    return this.image.src
  }

  //accepts key (index) string, returns the key/value pair
  getFrames() {
    return this.#frames
  }

  //accepts key (index) string, returns the key/value pair
  getFrameAttributes(key) {
    return this.#frames[key]
  }

  //accepts object of frames key value pairs, returns
  //number of updated frames
  setFrameAttributes(obj) {
    let loop = 0
    Object.keys(obj).forEach((key, index) => {
      this.#frames[key] = obj[key]
      loop++
    })
    return loop
  }

  async urlToBlob(path) {
    let pathname = path.split("/")
    let filename = pathname[pathname.length - 1]
    let response = await fetch(this.#path)
    let data = await response.blob()
    let metadata = {
      type: "image/png",
    }
    let file = new File([data], filename, metadata)

    return file
  }
}

class Sequence {
  constructor(spritesheet, frameString, isLooping = false, frameRate = 60, direction = "normal") {
    //****************************** */
    //should do data validation here

    //****************************** */
    this.spritesheet = spritesheet
    this.frameString = frameString
    this.isLooping = isLooping
    this.frameRate = frameRate
    this.currentIndex = 0
    this.direction = direction
    this.numFrames = 0
    this.elapsedTime = 0
    //count number of frames
    let tempArray = frameString.split(",")
    this.numFrames = tempArray.length
    return
  }

  updateElapsedTime(time) {
    this.elapsedTime += time

    return this.elapsedTime
  }

  step() {
    if (this.elapsedTime > this.frameRate) {
      this.elapsedTime = 0
      if (this.direction == "normal") {
        this.currentIndex++
      } else {
        this.currentIndex--
      }
      //test for zero and going past end of sequence
      if (this.currentIndex < 0) this.currentIndex = this.numFrames - 1
      else if (this.currentIndex == this.numFrames) this.currentIndex = 0
      return this.currentIndex
    }
  }

  reset() {
    this.currentIndex = 0
    return this.currentIndex
  }

  getCurrentFrame() {
    return this.spritesheet.getFrameAttributes(this.currentIndex)
  }

  setFrameRate(newFrameRate) {
    this.frameRate = newFrameRate
    return this.frameRate
  }

  getFrameRate() {
    return this.frameRate
  }

  setFrameString(newFrameString) {
    this.frameRate = newFrameString
    return this.frameString
  }

  getFrameString() {
    return this.frameString
  }
}
