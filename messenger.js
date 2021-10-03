var messageQueue = []

/**
 * Types of data objects:
 *  -create entity (entity data)
 *  -enable/diable interval timer
 *  -keypress states
 *  message object:{
 *  type: "messagetype",
 *  data: {},
 *  }
 */
function postMessagetoWorker(dataToSend) {
  worker.postMessage(dataToSend)
}
var worker = new Worker("./systems.js")
worker.addEventListener(
  "message",
  function (event) {
    messageQueue.push(event.data)
  },
  false
)

/**
 * Message Queue processing
 *
 */
let found
function processMessages() {
  if (messageQueue.length) {
    for (let i = 0; i < messageQueue.length; i++) {
      let message = messageQueue.shift()
      switch (message.type) {
        case "spritesheet":
          found = entities.findIndex((entity) => entity.id == message.data.id)
          entities[found].sprite.frameIndex = message.data.frameData
          //console.log(message)
          break
        case "movement":
          found = entities.findIndex((entity) => entity.id == message.data.id)
          entities[found].body.x = message.data.x
          entities[found].body.y = message.data.y
          entities[found].body.theta = message.data.theta
          break
        case "delete":
          console.log(message)
          found = entities.findIndex((entity) => entity.id == message.data.id)
          console.log(found)
          id = document.getElementById(entities[found].id)
          console.log(id)
          id.remove()

          break
        default:
          break
      }
    }
  }
}
