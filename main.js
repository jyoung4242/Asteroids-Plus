/*Initialize and administer
 * Web Worker
 * Plus event listener, and message posting
 * creation of messages queue
 */

/*Init routine and UI handles
 *get global handles for reference
 */

var elemFPS = document.getElementById("fps")
var elemElapsed = document.getElementById("elapsed")

let assetPlayerSprite, assetAsteroidSprite, assetPlayerBulletSprite
let gameLevel = 1
let screenWidth = window.innerWidth
let screenHeight = window.innerHeight
let entityArray = []
var lastStickState
var sfx = {}
var music = {}

var UI = {
  WIDTH: 320,
  HEIGHT: 480,
  scale: 1,
  offset: { top: 0, left: 0 },
  RATIO: null,
  currentWidth: null,
  currentHeight: null,
  ua: null,
  android: null,
  ios: null,
}

var body = document.getElementsByTagName("body")[0]
body.style.width = window.innerWidth
body.style.height = window.innerHeight

console.log(`Screen Size: ${screen.width}, ${screen.height}`)
console.log(`Window Size: ${window.innerWidth}, ${window.innerHeight}`)

/**
 * Time stamp variables and GameLoop
 *
 */
var previousTimestamp
var elapsed
var fpsTimer = 0,
  frameCounter = 0,
  fps = 0

function configureLevel(level) {
  //clear out entities()
  let numAsteroids = level + Math.floor(Math.random() * 5)
  entities = []
  entityArray = addPlayerEntity(screenWidth, screenHeight)
  let tempArray = generateAsteroids(numAsteroids, screenWidth, screenHeight)
  entityArray = entityArray.concat(tempArray)
}

function init() {
  UI.RATIO = UI.width / UI.height
  UI.currentwidth = UI.width
  UI.currentheight = UI.height
  UI.ua = navigator.userAgent.toLowerCase()
  UI.android = UI.ua.indexOf("android") > -1 ? true : false
  UI.ios = UI.ua.indexOf("iphone") > -1 || UI.ua.indexOf("ipad") > -1 ? true : false

  touchEnabled.addEventListener("click", (e) => {
    console.log("click")
  })

  window.addEventListener(
    "touchstart",
    function (e) {
      e.preventDefault()
    },
    false
  )
  window.addEventListener(
    "touchmove",
    function (e) {
      e.preventDefault()
    },
    false
  )
  window.addEventListener(
    "touchend",
    function (e) {
      e.preventDefault()
    },
    false
  )

  window.dispatchEvent(new Event("resize"))

  //initialize events, including keyboard handler
  initEvents()

  //send initializtion messages to worker
  postMessagetoWorker({ type: "setWindowDims", data: { w: screenWidth, h: screenHeight } })

  //init spritesheets
  assetPlayerSprite = new Spritesheet("./assets/images/player1.png", 1, 1)
  assetPlayerSprite.init()
  assetAsteroidSprite = new Spritesheet("./assets/images/asteroid.png", 8, 8, 128, 128)
  assetAsteroidSprite.init()
  assetPlayerBulletSprite = new Spritesheet("./assets/images/playerbullet.png", 1, 1)
  assetPlayerBulletSprite.init()

  //seed random number generator
  Math.seedrandom(Date.now())

  //need to load entities starting with Player
  configureLevel(gameLevel)

  //assign components to each entity
  entityArray.forEach((entityData) => {
    const entity = new Entity(entityData.id, entityData.category)
    for (const [component, data] of Object.entries(entityData.components)) {
      Component.assignTo(entity, component, data)
    }

    entities.push(entity)
    makeDiv(entity)
  })

  //initialize Animation sequences
  //postMessagetoWorker({ type: "Sequences", data: {} })

  //make DOM elements for each entity
  //makeDivs(entities)

  //send entities to worker
  entities.forEach((ent) => {
    postMessagetoWorker({
      type: "entityCreate",
      data: {
        id: ent.id,
        category: ent.category,
        body: ent.body,
        attack: ent.attack,
        sprite: ent.sprite,
        velocity: ent.velocity,
        health: ent.health,
        hitbox: ent.hitbox,
      },
    })
  })

  //set intial sprites
  entities.forEach((entity) => {
    entity.innerHandle.style.backgroundImage = `url(${entity.sprite.path})`
    if (entity.category === "player") {
      entity.innerHandle.style.transform = `rotate(-${entity.sprite.rotation}deg)`
    }
    entity.innerHandle.style.backgroundRepeat = `no-repeat`
    set_visibility(entity, false)
  })
  loadSounds()
  showIntroScreen()
}

function gameLoop(deltaTime) {
  if (isLoopRunning) {
    //measure elapsed time
    if (previousTimestamp == undefined) {
      previousTimestamp = deltaTime
      elapsed = 0
    } else {
      elapsed = deltaTime - previousTimestamp
      elemElapsed.innerHTML = `Elapsed time: ${parseFloat(elapsed).toFixed(3)}`
    }

    fpsTimer += elapsed
    frameCounter++

    if (fpsTimer > 1000) {
      fps = frameCounter
      frameCounter = fpsTimer = 0

      elemFPS.innerHTML = `FPS: ${fps}`
    }

    //process updates from web worker
    processMessages()

    //check joystick

    if (boolTouchControls) {
      jstick = joy.GetDir()

      if (lastStickState === undefined) {
        // first loop through
        lastStickState = jstick
        window.dispatchEvent(joystick, { detail: jstick })
      } else if (jstick !== lastStickState) {
        //state changed
        lastStickState = jstick
        window.dispatchEvent(joystick, { detail: jstick })
      }
    }

    //mangage div renderings
    entities.forEach((entity) => {
      systems.forEach((system) => {
        if (system.processEntity(entity)) {
          system.update(entity, elapsed)
        }
      })
    })
  }
  previousTimestamp = deltaTime
  requestAnimationFrame(gameLoop)
}

window.addEventListener("load", () => {
  init()
  window.requestAnimationFrame(gameLoop)
})

window.addEventListener("resize", () => {
  UI.currentHeight = window.innerHeight
  UI.currentWidth = window.innerWidth
  if (UI.android || UI.ios) {
    document.body.style.height = window.innerHeight + 50 + "px"
  }

  // we use a timeout here as some mobile
  // browsers won't scroll if there is not
  // a small delay
  window.setTimeout(function () {
    window.scrollTo(0, 1)
  }, 1)
})

class System {
  constructor(name) {
    this.name = name
  }

  processEntity(entity) {
    return entity[this.name] != null
  }
}

class SpriteSystem extends System {
  constructor() {
    super("sprite")
  }

  processEntity(entity) {
    try {
      return entity.sprite.frameIndex != -1
    } catch (error) {
      console.log(entity)
    }
  }

  update(entity) {
    if (entity.sprite.frameIndex != -1) {
      const fdata = assetAsteroidSprite.getFrameAttributes(entity.sprite.frameIndex)

      entity.innerHandle.style.backgroundPosition = `-${fdata.x}px -${fdata.y}px`
    }
  }
}

class RenderSystem extends System {
  constructor() {
    super("render")
  }

  processEntity(entity) {
    return entity.id != null
  }

  update(entity, deltaTime) {
    //test first if div exists
    if (entity.primaryHandle != null) {
      //this is the diagnostic mode, if enabled, show canvas and diagnstic data
      if (entity.render.isBorderBoxStateChanged) {
        if (entity.render.isBorderBoxVisible) {
          entity.diagHandle.style.border = `1px solid rgb(255,0,255)`
          entity.diagHandle.innerHTML = `${entity.id}`
        } else {
          entity.diagHandle.style.border = `0`
          entity.diagHandle.innerHTML = ``
        }
      }

      //RENDERING LINE HERE
      entity.body.centerpoint = { x: entity.body.x + entity.body.width / 2, y: entity.body.y + entity.body.height / 2 }
      entity.primaryHandle.style.transform = `translate(${entity.body.x}px, ${entity.body.y}px) rotate(${-entity.body.theta}deg) scale(${entity.render.scale})`
    }
  }
}

const systems = [new SpriteSystem(), new RenderSystem()]
