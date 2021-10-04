function set_visibility(entity, state) {
  entity.render.visible = state
  if (entity.render.visible) entity.primaryHandle.style.visibility = `visible`
  else entity.primaryHandle.style.visibility = `hidden`
}

function showIntroScreen() {
  //setup HUD state
  //only messagediv is visible
  let msgdiv = document.getElementById("messageDiv")
  msgdiv.style.visibility = "visible"
  //show welcome message
  let message = document.getElementById("messageText")
  message.innerHTML = "Press any key to begin"

  //make it blink
  msgdiv.classList.add("blink_me")

  //hide the rest
  let healthDiv = document.getElementById("health")
  let ammoDiv = document.getElementById("ammo")
  let dataDiv = document.getElementById("data")
  healthDiv.style.visibility = "hidden"
  ammoDiv.style.visibility = "hidden"
  dataDiv.style.visibility = "hidden"
}

function showLevelIntro() {
  //setup HUD state
  //all HUD  is visible
  let msgdiv = document.getElementById("messageDiv")
  msgdiv.style.visibility = "visible"
  //show welcome message
  let message = document.getElementById("messageText")
  message.innerHTML = `Level: ${gameLevel}`

  //remove blinker
  msgdiv.classList.remove("blink_me")

  //hide the rest
  let healthDiv = document.getElementById("health")
  let ammoDiv = document.getElementById("ammo")
  let dataDiv = document.getElementById("data")
  let instructDiv = document.getElementById("instructionsDiv")
  healthDiv.style.visibility = "visible"
  ammoDiv.style.visibility = "visible"
  dataDiv.style.visibility = "visible"
  instructDiv.style.visibility = "hidden"

  //fade out message after delay
  setTimeout(() => {
    msgdiv.style.visibility = "hidden"

    isLoopRunning = true
    entities.forEach((entity) => {
      set_visibility(entity, true)
      //send initializtion messages to worker
      postMessagetoWorker({ type: "TimerEnable", data: { enabled: true } })
    })
    music.bgm.play()
  }, 2000)
}

function findGunPosition(gunID, playerObject) {
  let bulletObjectPosition = { x: 0, y: 0, theta: 0 }
  let staticXg = playerObject.body.width / 8
  let staticYg = gunID == 1 ? -3 : -15
  ///console.log(staticXg, staticYg)
  let thetaG = Math.atan2(staticYg, staticXg) //radians
  let Hypotenuse = Math.sqrt(staticXg * staticXg + staticYg * staticYg)
  let absoluteTheta = -toRads(playerObject.body.theta) + thetaG //this will be in radians
  //console.log(thetaG, Hypotenuse, absoluteTheta)
  bulletObjectPosition.x = playerObject.body.centerpoint.x + Hypotenuse * Math.cos(absoluteTheta)
  bulletObjectPosition.y = playerObject.body.centerpoint.y + Hypotenuse * Math.sin(absoluteTheta)
  bulletObjectPosition.theta = playerObject.body.theta
  //console.log(bulletObjectPosition)
  return bulletObjectPosition
}

function loadSounds() {
  sfx = {
    fire: new Howl({
      src: ["./assets/audio/playerfire.mp3"],
    }),
    collision1: new Howl({
      src: ["./assets/audio/collision1.mp3"],
    }),
    collision2: new Howl({
      src: ["./assets/audio/collision2.mp3"],
    }),
    collision3: new Howl({
      src: ["./assets/audio/collision3.mp3"],
    }),
  }

  music = {
    bgm: new Howl({
      src: ["./assets/audio/bgm.mp3"],
      loop: true,
    }),
  }
}
