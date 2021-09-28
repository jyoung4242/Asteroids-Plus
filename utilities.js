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
  healthDiv.style.visibility = "visible"
  ammoDiv.style.visibility = "visible"
  dataDiv.style.visibility = "visible"
  //fade out message after delay
  setTimeout(() => {
    msgdiv.style.visibility = "hidden"
    isLoopRunning = true
  }, 2000)
}
