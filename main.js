let screenWidth = window.innerWidth
let screenHeight = window.innerHeight
let entityArray = []
var animationSequences = {}
let assetPlayerSprite, assetAsteroidSprite
var fpsTimer = 0,
  fps,
  frameCounter = 0,
  previousTimestamp,
  elapsed
let elemFPS, elemElapsed, elemtstamp
let gameLevel = 1

function init() {
  //Load Assets
  assetPlayerSprite = new Spritesheet("./assets/images/player1.png", 1, 1)
  assetPlayerSprite.init()
  assetAsteroidSprite = new Spritesheet("./assets/images/asteroid.png", 8, 8, 128, 128)
  assetAsteroidSprite.init()

  //path = null, numrows = 1, numcols = 1, frameWidth = null, frameHeight = null) {
  Math.seedrandom(Date.now())
  initEvents()

  //get global handles for reference
  elemFPS = document.getElementById("fps")
  elemElapsed = document.getElementById("elapsed")
  cameraHandle = document.getElementById("camera")

  //load spritesheet sequences
  animationSequences["asteroid1_forward"] = new Sequence(assetAsteroidSprite, "0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31", true, 110)
  animationSequences["asteroid1_reverse"] = new Sequence(assetAsteroidSprite, "0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31", true, 110, "reverse")
  animationSequences["asteroid2_forward"] = new Sequence(assetAsteroidSprite, "32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63", true, 110)
  animationSequences["asteroid2_reverse"] = new Sequence(assetAsteroidSprite, "32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63", true, 110, "reverse")
  configureLevel(gameLevel, animationSequences)

  //assign components to each entity
  entityArray.forEach((entityData) => {
    const entity = new Entity(entityData.id)
    for (const [component, data] of Object.entries(entityData.components)) {
      Component.assignTo(entity, component, data)
    }

    entities.push(entity)
    //console.log(entities)
  })

  showIntroScreen()
}

function configureLevel(level, animationobject) {
  //clear out entities()
  let numAsteroids = level + Math.floor(Math.random() * 5)
  entities = []
  entityArray = addPlayerEntity(screenWidth, screenHeight)
  let tempArray = generateAsteroids(numAsteroids, screenWidth, screenHeight, animationobject)
  entityArray = entityArray.concat(tempArray)
}

function gameLoop(deltaTime) {
  if (isLoopRunning) {
    //maintenance routines
    //do game logic checks here
    //do keyboard checks here
    //do HUD updates here
    //FPS Metric
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

    //entity systems
    entities.forEach((entity) => {
      systems.forEach((system) => {
        if (system.processEntity(entity)) {
          system.update(entity, elapsed)
        }
      })
    })
  }
  previousTimestamp = deltaTime
  window.requestAnimationFrame(gameLoop)
}

init()
window.requestAnimationFrame(gameLoop)
