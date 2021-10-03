var intervalTime = 32
var isLoopRunning = false
var messageQueue = []
var entities = []
var animationSequences = {}
var activeCollisions = []
var held_directions = []
let screenWidth
let screenHeight

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

importScripts("./spritesheet.js")

onmessage = (e) => {
  switch (e.data.type) {
    case "TimerEnable":
      isLoopRunning = e.data.data.enabled
      break
    case "setWindowDims":
      screenWidth = e.data.data.w
      screenHeight = e.data.data.h
      break
    case "keypress":
      held_directions = e.data.data
      break
    case "Sequences":
      initAnimationSequences()
      break
    case "entityCreate":
      createEnt(e.data.data)
      assignAnimationSequence(e.data.data)
      break
    case "resize":
      screenWidth = e.data.data.w
      screenHeight = e.data.data.h
      break
    case "bullet":
      console.log(e.data)
      createEnt(e.data.data)
      break
    default:
      messageQueue.push(e.data)
  }
}

function initAnimationSequences() {
  //load spritesheet sequences
  animationSequences["asteroid1_forward"] = new Sequence("0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31", true, 110)
  animationSequences["asteroid1_reverse"] = new Sequence("0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31", true, 110, "reverse")
  animationSequences["asteroid2_forward"] = new Sequence("32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63", true, 110)
  animationSequences["asteroid2_reverse"] = new Sequence("32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63", true, 110, "reverse")
}

function assignAnimationSequence(ent) {
  if (ent.category === "asteroid") {
    switch (ent.sprite.sequence) {
      case 0:
        ent.sprite.sequence = new Sequence("0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31", true, 100)
        break
      case 1:
        ent.sprite.sequence = new Sequence("0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31", true, 100, "reverse")
        break
      case 2:
        ent.sprite.sequence = new Sequence("32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63", true, 100)
        break
      case 3:
        ent.sprite.sequence = new Sequence("32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63", true, 100, "reverse")
        break
      default:
        ent.sprite.sequence = new Sequence("0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31", true, 100)
        break
    }
  }
}

function toRads(degrees) {
  return (Math.PI * degrees) / 180
}

function setNewGapAngle(entity) {
  if (entity.velocity.theta != entity.body.theta) {
    entity.velocity.theta = normalizeAngle(entity.velocity.theta)
    entity.body.theta = normalizeAngle(entity.body.theta)

    deltaTheta = Math.abs(entity.body.theta - entity.velocity.theta)
    if (deltaTheta > 180) {
      deltaTheta = Math.abs(deltaTheta - 360)
    }
    //create angle incremeent based on velocity
    incrementAngle = deltaTheta / (entity.velocity.speed + 0.1)

    oppositeAngle = entity.velocity.theta + 180

    if (oppositeAngle >= 360) oppositeAngle -= 360
    else if (oppositeAngle < 0) {
      oppositeAngle += 360
    }

    //find out which way were turning

    if (Math.abs(oppositeAngle - entity.body.theta) < 180) {
      if (entity.body.theta > oppositeAngle) {
        direction = "CW"
      } else {
        direction = "CCW"
      }
    } else {
      if (entity.body.theta > oppositeAngle) {
        direction = "CCW"
      } else {
        direction = "CW"
      }
    }
  }
}

function closeGapofTheta(entity) {
  if (entity.body.theta != entity.velocity.theta) {
    if (deltaTheta < 2) {
      entity.velocity.theta = entity.body.theta
      incrementAngle = 0
    } else {
      if (direction == "CW") entity.velocity.theta -= incrementAngle
      else entity.velocity.theta += incrementAngle
    }

    if (entity.velocity.thet < 0) entity.velocity.thet += 360
  }
}

function normalizeAngle(angle) {
  if (Math.abs(angle) > 359) {
    if (angle > 0) angle -= 360
    else angle += 360
  } else if (angle < 0) {
    angle += 360
  }
  return angle
}

function createEnt(entity) {
  entities.push(entity)
}

/**
 * Time stamp variables and GameLoop
 *
 */
var previousTimestamp
var elapsed

function postMessagetoMain(data) {
  self.postMessage(data)
}

setInterval(() => {
  if (isLoopRunning) {
    //measure elapsed time
    if (previousTimestamp == undefined) {
      previousTimestamp = performance.now()
      elapsed = 0
    } else {
      elapsed = performance.now() - previousTimestamp
    }
    //for each entity, update each system
    entities.forEach((entity) => {
      systems.forEach((system) => {
        if (system.processEntity(entity)) {
          system.update(entity, elapsed)
        }
      })
    })
    previousTimestamp = performance.now()
  }
}, intervalTime)

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
    return entity.sprite.frameIndex != -1
  }

  update(entity, deltaTime) {
    if (entity.category == "asteroid") {
      //the entity div exists

      if (entity.sprite.sequence != null) {
        //get current index
        let i = entity.sprite.sequence.getCurrentFrameIndex()
        entity.sprite.sequence.updateElapsedTime(deltaTime)
        const frameObject = entity.sprite.sequence.step()

        //if step not ready to increment, returns null
        if (frameObject != null) {
          if (i != frameObject.index) {
            postMessagetoMain({ type: "spritesheet", data: { id: entity.id, frameData: frameObject.frame } })
          }
        }
      }
    }
  }
}

class MovementSystem extends System {
  constructor() {
    super("movement")
  }

  processEntity(entity) {
    return entity.body != null && entity.velocity != null
  }

  update(entity, deltaTime) {
    if (entity.body.isUserControlled) {
      //player
      const held_direction = held_directions[0]
      if (held_direction) {
        //check for up or down in entire array
        let upPressed = held_directions.find((dir) => dir == directions.up)
        let downPressed = held_directions.find((dir) => dir == directions.down)

        if (upPressed != undefined || downPressed != undefined) {
          //if both pressed bail
          if (!(upPressed != undefined && downPressed != undefined)) {
            //if up pressed
            if (upPressed) {
              //if max speed reached
              closeGapofTheta(entity)
              setNewGapAngle(entity)
              if (entity.velocity.speed >= entity.velocity.maxSpeed) {
                entity.velocity.speed = entity.velocity.maxSpeed
              } else {
                entity.velocity.speed += entity.velocity.acceleration
              }
            } else {
              //if down pressed
              if (entity.velocity.speed <= -entity.velocity.maxSpeed) {
                entity.velocity.speed = -entity.velocity.maxSpeed
              } else {
                entity.velocity.speed -= entity.velocity.acceleration
              }
              //if -max speed reached
            }
          }
        }

        //Check for left right and change angle
        //check for up or down in entire array
        let leftPressed = held_directions.find((dir) => dir == directions.left)
        let rightPressed = held_directions.find((dir) => dir == directions.right)
        if (leftPressed != undefined || rightPressed != undefined) {
          //gaurd condition for pressing both at same time
          if (!(leftPressed != undefined && rightPressed != undefined)) {
            if (leftPressed) entity.velocity.deltaTheta = 4
            else entity.velocity.deltaTheta = -4
            setNewGapAngle(entity)
          }
        } else entity.velocity.deltaTheta = 0
      } else entity.velocity.deltaTheta = 0
    } else {
      //enemy or asteroid or bullets
      if (entity.velocity.speed >= 10) {
        entity.velocity.speed = 10
      }
    }

    //normalize angles to 0-359 degrees
    entity.body.theta = entity.body.theta + entity.velocity.deltaTheta
    entity.body.theta = normalizeAngle(entity.body.theta)
    entity.velocity.theta = normalizeAngle(entity.velocity.theta)

    //regardless if player or npc entity, add to velocity vector
    //if (!entity.hitbox.inCollision) {
    entity.velocity.deltaX = Math.cos(toRads(entity.velocity.theta)) * entity.velocity.speed
    entity.velocity.deltaY = Math.sin(toRads(-entity.velocity.theta)) * entity.velocity.speed
    //} else entity.hitbox.inCollision = false

    entity.body.x = entity.body.x + entity.velocity.deltaX
    entity.body.y = entity.body.y + entity.velocity.deltaY
    postMessagetoMain({ type: "movement", data: { id: entity.id, x: entity.body.x, y: entity.body.y, theta: entity.body.theta } })
  }
}

class screenCollisionSystem extends System {
  constructor() {
    super("screencollide")
  }

  processEntity(entity) {
    return entity.body != null && entity.velocity != null
  }

  update(entity, deltaTime) {
    let playerWidth = entity.body.width / 2

    if (entity.id) {
      let rectLeft = entity.body.x + entity.hitbox.x
      let rectRight = entity.body.x + entity.hitbox.x + entity.hitbox.w
      let rectTop = entity.body.y + entity.hitbox.y
      let rectBottom = entity.body.y + entity.hitbox.y + entity.hitbox.h

      //is there a screen collision
      let foundIndex
      if (rectRight > screenWidth + playerWidth) {
        //right collision
        if (entity.category == "bullet") {
          console.log("here")
          foundIndex = entities.findIndex((ent) => ent.id == entity.id)
          postMessagetoMain({ type: "delete", data: { id: entity.id } })
          entities.splice(foundIndex, 1)
        } else entity.body.x = 0
      } else if (rectTop < -playerWidth) {
        if (entity.category == "bullet") {
          foundIndex = entities.findIndex((ent) => ent.id == entity.id)
          postMessagetoMain({ type: "delete", data: { id: entity.id } })
          entities.splice(foundIndex, 1)
        } else entity.body.y = screenHeight - playerWidth * 2
      } else if (rectBottom > screenHeight + playerWidth) {
        if (entity.category == "bullet") {
          foundIndex = entities.findIndex((ent) => ent.id == entity.id)
          postMessagetoMain({ type: "delete", data: { id: entity.id } })
          entities.splice(foundIndex, 1)
        } else entity.body.y = 0
      } else if (rectLeft < -playerWidth) {
        if (entity.category == "bullet") {
          foundIndex = entities.findIndex((ent) => ent.id == entity.id)
          postMessagetoMain({ type: "delete", data: { id: entity.id } })
          entities.splice(foundIndex, 1)
        } else entity.body.x = screenWidth - playerWidth * 2
      }
    }
  }
}

class A2ACollisionSystem extends System {
  constructor() {
    super("screencollide")
  }

  processEntity(entity) {
    return entity.category === "asteroid"
  }

  update(entity, deltaTime) {
    //list of other asteroids

    entities.forEach((ent) => {
      //check our entity against all the others
      //check for first pass and hasn't rendered
      if (entity.diagHandle === null) return
      if (ent.diagHandle === null) return
      //console.log(ent)
      if (ent.id.search("asteroid") != -1) {
        //entity is an asteroid
        //test for yourself
        if (ent.id != entity.id) {
          //not yourself
          //get radius and centerpoint of asteroid hitboxes

          let A1 = {
            left: ent.body.x + ent.hitbox.x,
            right: ent.body.x + ent.hitbox.x + ent.hitbox.w,
            top: ent.body.y + ent.hitbox.y,
            bottom: ent.body.y + ent.hitbox.y + ent.hitbox.h,
            cx: ent.body.x + ent.hitbox.x + ent.hitbox.w / 2,
            cy: ent.body.y + ent.hitbox.h + ent.hitbox.h / 2,
            rad: ent.hitbox.w / 2,
          }
          let A2 = {
            left: entity.body.x + entity.hitbox.x,
            right: entity.body.x + entity.hitbox.x + entity.hitbox.w,
            top: entity.body.y + entity.hitbox.y,
            bottom: entity.body.y + entity.hitbox.y + entity.hitbox.h,
            cx: entity.body.x + entity.hitbox.x + entity.hitbox.w / 2,
            cy: entity.body.y + entity.hitbox.h + entity.hitbox.h / 2,
            rad: entity.hitbox.w / 2,
          }

          let dx = A1.cx - A2.cx
          let dy = A1.cy - A2.cy
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < A1.rad + A2.rad) {
            activeCollisions.forEach((collisionPair, index) => {
              if ((collisionPair["a"] == entity.id && collisionPair["b"] == ent.id) || (collisionPair["b"] == entity.id && collisionPair["a"] == ent.id)) {
                collisionPair["count"] += 1 //if and active collision, incrememnt count
                if (collisionPair["count"] >= 10) {
                  //if count exceeds number "manage" the collision
                  return
                }
              } else {
                //if not an active collision, add to index
                activeCollisions.push({ a: entity.id, b: ent.id, count: 0 })
              }
            })

            //manage collisions and resolve
            let vCollision = { x: A2.left - A1.left, y: A2.top - A1.top }
            let vCollisionNorm = { x: vCollision.x / distance, y: vCollision.y / distance }
            let vRelativeVelocity = { x: ent.velocity.deltaX - entity.velocity.deltaX, y: ent.velocity.deltaY - entity.velocity.deltaY }
            let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y + 2
            let impulse = (2 * speed) / (ent.hitbox.mass + entity.hitbox.mass)

            ent.velocity.deltaX -= impulse * entity.hitbox.mass * vCollisionNorm.x
            ent.velocity.deltaY -= impulse * entity.hitbox.mass * vCollisionNorm.y
            ent.velocity.theta = -Math.atan2(ent.velocity.deltaY, ent.velocity.deltaX) * (180 / Math.PI)
            ent.velocity.speed = Math.sqrt(ent.velocity.deltaX * ent.velocity.deltaX + ent.velocity.deltaY * ent.velocity.deltaY)
            entity.velocity.deltaX += impulse * ent.hitbox.mass * vCollisionNorm.x
            entity.velocity.deltaY += impulse * ent.hitbox.mass * vCollisionNorm.y
            entity.velocity.theta = Math.atan2(entity.velocity.deltaY, entity.velocity.deltaX) * (180 / Math.PI)
            entity.velocity.speed = Math.sqrt(entity.velocity.deltaX * entity.velocity.deltaX + entity.velocity.deltaY * entity.velocity.deltaY)
          } else {
            //not a collision, if in active list, remove
            activeCollisions.forEach((collisionPair, index) => {
              if ((collisionPair["a"] == entity.id && collisionPair["b"] == ent.id) || (collisionPair["b"] == entity.id && collisionPair["a"] == ent.id)) {
                activeCollisions.splice(index, 1)
              }
            })
          }
        }
      }
    })
  }
}

const systems = [new SpriteSystem(), new MovementSystem(), new screenCollisionSystem(), new A2ACollisionSystem()]
