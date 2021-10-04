//keyboard variables
var held_directions = []
var isLoopRunning = false
var boolTouchControls = false

/*Weapon variables */
var isGun1Firing = true

/* Music Toggle*/
var isMusicPlaying = true

/* Direction key state */
const directions = {
  up: "up",
  down: "down",
  left: "left",
  right: "right",
}
const keys = {
  ArrowUp: directions.up,
  ArrowLeft: directions.left,
  ArrowRight: directions.right,
  ArrowDown: directions.down,
}

var jstick
var collisionBoxesVisible = false
var entities = []

/*****************************
 * Define custom events
 *
 *
 ****************************/

const fireEventPlayer = new CustomEvent("fireWeapon", { detail: "playerentity" })
const fireEventEnemy = new CustomEvent("fireWeapon", { detail: "enemyentity" })
const collisionAsteroid = new CustomEvent("asteroidCollide", { detail: {} })
const entityDestroyed = new CustomEvent("entityDestroyed", { detail: {} })
const increaseScore = new CustomEvent("increaseScore", { detail: {} })
const resetScore = new Event("resetScore")
const increaseHealth = new CustomEvent("increaseHealth", { detail: {} })
const decreaseHealth = new CustomEvent("decreaseHealth", { detail: {} })
const increaseAmmo = new CustomEvent("increaseAmmo", { detail: {} })
const decreaseAmmo = new CustomEvent("decreaseAmmo", { detail: {} })
const levelComplete = new Event("levelComplete")
const increaseDifficulty = new Event("incDifficulty")
const increaseLives = new Event("increaseLives")
const decreaseLives = new Event("decreaseLives")
const endGame = new Event("endGame")
const cameraShake = new Event("cameraShake")
const damageFlash = new Event("damageFlash")
const showEnemyScore = new CustomEvent("showEnemeyScore", { detail: {} })
const moveEnemy = new CustomEvent("moveEnemy", { detail: {} })
const fireWeaponEnemy = new CustomEvent("fireWeaponEnemy", { detail: {} })
const startGame = new Event("startGame")
const toggleCollisionBoxes = new Event("toggleCollisionBoxes")
const pauseLoop = new Event("pauseLoop")
const joystick = new Event("jstick")
/******************************
 * Define Handlers
 *
 *
 ******************************/

function keydownHandler(e) {
  //different modes of keyhandling

  if (isLoopRunning) {
    //is e.code an arrowkey?
    if (e.code == `ArrowUp` || e.code == `ArrowDown` || e.code == `ArrowLeft` || e.code == `ArrowRight`) {
      //keypress management during game
      var dir = keys[e.code]
      if (dir && held_directions.indexOf(dir) === -1) {
        held_directions.unshift(dir)
        postMessagetoWorker({ type: "keypress", data: held_directions })
      }
    } else {
      //some other key
      if (e.code == `Backquote`) {
        document.dispatchEvent(toggleCollisionBoxes)
      } else if (e.code == `Equal`) {
        document.dispatchEvent(pauseLoop)
      } else if (e.code == "Space") {
        document.dispatchEvent(fireEventPlayer)
      } else if (e.code == "Backslash") {
        //toggle music
        if (isMusicPlaying) {
          isMusicPlaying = false
          music.bgm.pause()
        } else {
          isMusicPlaying = true
          music.bgm.play()
        }
      }
    }
  } else {
    //keypress management outside of game
    //start bg music here
    document.dispatchEvent(startGame)
  }
}

function jstickHandler() {
  console.log(jstick)

  switch (jstick) {
    case "N":
      held_directions = []
      var dir = keys["ArrowUp"]
      if (dir && held_directions.indexOf(dir) === -1) {
        held_directions.unshift(dir)
      }
      break
    case "NE":
      held_directions = []
      var dir = keys["ArrowUp"]
      if (dir && held_directions.indexOf(dir) === -1) {
        held_directions.unshift(dir)
      }
      var dir = keys["ArrowRight"]
      if (dir && held_directions.indexOf(dir) === -1) {
        held_directions.unshift(dir)
      }
      break
    case "NW":
      held_directions = []
      var dir = keys["ArrowUp"]
      if (dir && held_directions.indexOf(dir) === -1) {
        held_directions.unshift(dir)
      }
      var dir = keys["ArrowLeft"]
      if (dir && held_directions.indexOf(dir) === -1) {
        held_directions.unshift(dir)
      }
      break
    case "E":
      held_directions = []
      var dir = keys["ArrowRight"]
      if (dir && held_directions.indexOf(dir) === -1) {
        held_directions.unshift(dir)
      }
      break
    case "W":
      held_directions = []
      var dir = keys["ArrowLeft"]
      if (dir && held_directions.indexOf(dir) === -1) {
        held_directions.unshift(dir)
      }
      break
    case "SE":
      held_directions = []
      var dir = keys["ArrowDown"]
      if (dir && held_directions.indexOf(dir) === -1) {
        held_directions.unshift(dir)
      }
      var dir = keys["ArrowRight"]
      if (dir && held_directions.indexOf(dir) === -1) {
        held_directions.unshift(dir)
      }
      break
    case "SW":
      held_directions = []
      var dir = keys["ArrowDown"]
      if (dir && held_directions.indexOf(dir) === -1) {
        held_directions.unshift(dir)
      }
      var dir = keys["ArrowLeft"]
      if (dir && held_directions.indexOf(dir) === -1) {
        held_directions.unshift(dir)
      }
      break
    case "C":
      held_directions = []
      break
  }
  postMessagetoWorker({ type: "keypress", data: held_directions })
}

function startGameHandler() {
  //show Level 1 in message
  gameLevel = 1
  showLevelIntro()
  //show all other HUD elements
}

function keyupHandler(e) {
  if (isLoopRunning) {
    let dir = keys[e.code]
    let index = held_directions.indexOf(dir)
    if (index > -1) {
      held_directions.splice(index, 1)
      postMessagetoWorker({ type: "keypress", data: held_directions })
    }
  }
}

function reportWindowSize(e) {
  postMessagetoWorker({ type: "resize", data: { w: window.innerWidth, h: window.innerHeight } })
}

function fireWeaponHandler(e) {
  if (!isLoopRunning) {
    gameLevel = 1
    showLevelIntro()
    return
  }
  let bulletPositionObject = {}
  //find player entity
  const playerentity = entities.find((ent) => ent.category == "player")
  //console.log(playerentity)
  //track the toggle of g1 vs g2
  if (isGun1Firing) {
    //Gun1
    isGun1Firing = false
    //find position of weapon Gun1

    bulletPositionObject = findGunPosition(1, playerentity)
  } else {
    //Gun2
    isGun1Firing = true
    //find position of weapon Gun2
    bulletPositionObject = findGunPosition(2, playerentity)
  }

  //create the entity
  let bulletEntity = createPlayerBullet(bulletPositionObject, isGun1Firing)

  entity = new Entity(bulletEntity.id, bulletEntity.category)
  for (const [component, data] of Object.entries(bulletEntity.components)) {
    Component.assignTo(entity, component, data)
  }
  entities.push(entity)
  makeDiv(entity)
  //console.log(entity, entities)

  //set sprite
  entity.innerHandle.style.backgroundImage = `url(${entity.sprite.path})`
  entity.innerHandle.style.transform = `rotate(-${entity.sprite.rotation}deg)`
  entity.innerHandle.style.backgroundSize = `contain`
  entity.innerHandle.style.backgroundRepeat = `no-repeat`
  set_visibility(entity, true)

  //send to worker
  postMessagetoWorker({
    type: "bullet",
    data: {
      id: entity.id,
      category: entity.category,
      body: entity.body,
      attack: entity.attack,
      sprite: entity.sprite,
      velocity: entity.velocity,
      health: entity.health,
      hitbox: entity.hitbox,
    },
  })

  sfx.fire.play()
}

function collisionWithAsteroidHandler(e) {
  let sound = Math.floor(Math.random() * 3)

  switch (sound) {
    case 0:
      sfx.collision1.play()
      break
    case 1:
      sfx.collision2.play()
      break
    case 2:
      sfx.collision3.play()
      break
    default:
      sfx.collision1.play()
      break
  }
}

function entityDestroyHandler(e) {
  console.log(`${e.detail} has been destroyed!`)
}

function incrementScoreHandler(e) {
  console.log(`Score has increased by ${e.detail}!`)
}

function resetScoreHandler() {
  console.log(`Score has been reset to 0!`)
}

function incHealthHandler(e) {
  console.log(`Health has increased by ${e.detail}!`)
}

function decHealthHandler(e) {
  console.log(`Health has decreased by ${e.detail}!`)
}

function incAmmoHandler(e) {
  console.log(`Ammo has increased by ${e.detail}!`)
}

function decAmmoHandler(e) {
  console.log(`Ammo has decreased by ${e.detail}!`)
}

function levelCompleteHandler() {
  console.log(`The current level is completed`)
}

function incDifficultyHandler() {
  console.log(`The difficulty has increased`)
}

function incLivesHandler() {
  console.log(`Lives has increased!`)
}

function decLivesHandler() {
  console.log(`Lives has decreased!`)
}

function endGameHandler() {
  console.log(`GAME OVER!!!!`)
}

function cameraShakeHandler() {
  console.log(`SHAKEY CAM`)
}

function damageFlashHandler() {
  console.log(`I see red!!!!`)
}

function showEnemyScoreHandler(e) {
  console.log(`displaying enemy defeated score of  ${e.detail}!`)
}
function moveEnemyHandler(e) {
  console.log(`moving Enemy to  ${e.detail}!`)
}
function fireWeaponEnemyHandler(e) {
  console.log(`enemy firing at  ${e.detail}!`)
}

function toggleCollisionBoxesHandler() {
  if (collisionBoxesVisible) {
    collisionBoxesVisible = false

    entities.forEach((entity) => {
      entity.render.isBorderBoxVisible = false
      entity.render.isBorderBoxStateChanged = true
    })
    document.getElementById("diagnostics").classList.add("hidden")
  } else {
    collisionBoxesVisible = true
    entities.forEach((entity) => {
      entity.render.isBorderBoxVisible = true
      entity.render.isBorderBoxStateChanged = true
    })
    document.getElementById("diagnostics").classList.remove("hidden")
  }
}

function pauseHandler() {
  if (isLoopRunning) isLoopRunning = false
  else isLoopRunning = true
}

function toggleTouchEnable() {
  boolTouchControls = touchEnabled.checked

  if (boolTouchControls) {
    document.getElementById("joycontrols").style.visibility = "visible"
    document.getElementById("buttoncontrols").style.visibility = "visible"
    firebutton.addEventListener("click", fireWeaponHandler)
  } else {
    document.getElementById("joycontrols").style.visibility = "hidden"
    document.getElementById("buttoncontrols").style.visibility = "hidden"
    firebutton.removeEventListener("click", fireWeaponHandler)
  }
}

/******************************
 * Initialize Event Listeners
 *
 *
 ******************************/
function initEvents() {
  document.addEventListener("fireWeapon", fireWeaponHandler)
  document.addEventListener("asteroidCollide", collisionWithAsteroidHandler)
  document.addEventListener("entityDestroyed", entityDestroyHandler)
  document.addEventListener("increaseScore", incrementScoreHandler)
  document.addEventListener("resetScore", resetScoreHandler)
  document.addEventListener("increaseHealth", incHealthHandler)
  document.addEventListener("decreaseHealth", decHealthHandler)
  document.addEventListener("increaseAmmo", incAmmoHandler)
  document.addEventListener("decreaseAmmo", decAmmoHandler)
  document.addEventListener("levelComplete", levelCompleteHandler)
  document.addEventListener("incDifficulty", incDifficultyHandler)
  document.addEventListener("increaseLives", incLivesHandler)
  document.addEventListener("decreaseLives", decLivesHandler)
  document.addEventListener("endGame", endGameHandler)
  document.addEventListener("cameraShake", cameraShakeHandler)
  document.addEventListener("damageFlash", damageFlashHandler)
  document.addEventListener("showEnemeyScore", showEnemyScoreHandler)
  document.addEventListener("moveEnemy", moveEnemyHandler)
  document.addEventListener("fireWeaponEnemy", fireWeaponEnemyHandler)
  document.addEventListener("keydown", keydownHandler)
  document.addEventListener("keyup", keyupHandler)
  document.addEventListener("startGame", startGameHandler)
  document.addEventListener("toggleCollisionBoxes", toggleCollisionBoxesHandler)
  document.addEventListener("pauseLoop", pauseHandler)
  window.addEventListener("resize", reportWindowSize)
  touchEnabled.addEventListener("change", toggleTouchEnable)
  window.addEventListener("jstick", jstickHandler)
}
