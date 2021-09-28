//keyboard variables
let held_directions = []
var isLoopRunning = false

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
      }
    } else {
      //some other key
      if (e.code == `Backquote`) {
        document.dispatchEvent(toggleCollisionBoxes)
      }
      if (e.code == `Equal`) {
        document.dispatchEvent(pauseLoop)
      }
    }
  } else {
    //keypress management outside of game
    document.dispatchEvent(startGame)
  }
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
    }
  }
}

function fireWeaponHandler(e) {
  console.log(e.detail, "Weapon Fired!")
}

function collisionWithAsteroidHandler(e) {
  console.log(`${e.detail} hit an asteroid!`)
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
    })
    document.getElementById("diagnostics").classList.add("hidden")
  } else {
    collisionBoxesVisible = true
    entities.forEach((entity) => {
      entity.render.isBorderBoxVisible = true
    })
    document.getElementById("diagnostics").classList.remove("hidden")
  }
}

function pauseHandler() {
  if (isLoopRunning) isLoopRunning = false
  else isLoopRunning = true
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
}
