var deltaTheta = 0
var accelTick = 0
let oppositeAngle = 0
let incrementAngle = 0
var cameraHandle
var diagAngle, diagSpeed, diagVelAngle, diagDeltaAngle
let time1, time2
var activeCollisions = []

class System {
  constructor(name) {
    this.name = name
  }

  processEntity(entity) {
    return entity[this.name] != null
  }
}

function setNewGapAngle(entity) {
  if (entity.velocity.theta != entity.body.theta) {
    entity.velocity.theta = normalizeAngle(entity.velocity.theta)
    entity.body.theta = normalizeAngle(entity.body.theta)

    deltaTheta = Math.abs(entity.body.theta - entity.velocity.theta)
    if (deltaTheta > 180) {
      deltaTheta = Math.abs(deltaTheta - 360)
    }
    incrementAngle = deltaTheta / 20

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
      //div exists, get inner canvas (to be replaced with Div later)
      //var elemCnv = document.getElementById(id.concat("_innerCnv"))
      //var elemCnvCtx = elemCnv.getContext("2d")

      //check entity for visibility and compare to DOM state
      let vis = entity.primaryHandle.style.visibility
      if (entity.render.visible && vis != "visible") {
        entity.primaryHandle.style.visibility = `visible`
      } else if (!entity.render.visible && vis == "visible") {
        entity.primaryHandle.style.visibility = `visible`
      }

      //this is the diagnostic mode, if enabled, show canvas and diagnstic data
      vis = entity.diagHandle.style.visibility
      if (entity.render.isBorderBoxVisible && vis != "visible") {
        entity.diagHandle.style.visibility = `visible`
      } else if (!entity.render.visible && vis == "visible") {
        entity.diagHandle.style.visibility = `visible`
      }

      if (entity.render.isBorderBoxVisible) {
        entity.diagHandle.style.border = `1px solid rgb(255,0,255)`
      } else entity.diagHandle.style.border = `0`

      //RENDERING LINE HERE
      entity.body.centerpoint = { x: entity.body.x + entity.body.width / 2, y: entity.body.y + entity.body.height / 2 }
      entity.primaryHandle.style.transform = `translate(${entity.body.x}px, ${entity.body.y}px) rotate(${-entity.body.theta}deg) scale(${entity.render.scale})`
    } else {
      //create new div

      entity.primaryHandle = document.createElement("div")
      entity.primaryHandle.setAttribute("id", entity.id)
      entity.primaryHandle.setAttribute("class", "entity")
      entity.primaryHandle.setAttribute("width", `${entity.body.width}`)
      entity.primaryHandle.setAttribute("height", `${entity.body.height}`)
      entity.primaryHandle.setAttribute("style", `width: ${entity.body.width}px; height: ${entity.body.height}px;  position: absolute`)

      entity.innerHandle = document.createElement("div")
      entity.innerHandle.setAttribute("id", entity.id.concat("_inner"))
      entity.innerHandle.setAttribute("class", "entityImage")
      entity.innerHandle.setAttribute("width", `${entity.body.width}`)
      entity.innerHandle.setAttribute("height", `${entity.body.height}`)
      entity.innerHandle.setAttribute("style", `width: ${entity.body.width}px; height: ${entity.body.height}px;  position: absolute`)

      entity.diagHandle = document.createElement("div")
      entity.diagHandle.setAttribute("id", entity.id.concat("_diag"))
      entity.diagHandle.setAttribute("class", "entityDiag")
      entity.diagHandle.setAttribute("width", `${entity.hitbox.w}`)
      entity.diagHandle.setAttribute("height", `${entity.hitbox.h}`)

      if (entity.hitbox.shape === "circle") {
        entity.diagHandle.setAttribute("style", `width: ${entity.hitbox.w}px; height: ${entity.hitbox.h}px;  position: absolute; border-radius: 50%;`)
        entity.diagHandle.style.transform = `translate(${entity.hitbox.x}px, ${entity.hitbox.y}px)`
      } else {
        entity.diagHandle.setAttribute("style", `width: ${entity.hitbox.w}px; height: ${entity.hitbox.h}px;  position: absolute;)`)
        entity.diagHandle.style.transform = `translate(${entity.hitbox.x}px, ${entity.hitbox.y}px)`
      }

      cameraHandle.appendChild(entity.primaryHandle)
      entity.primaryHandle.appendChild(entity.innerHandle)
      entity.primaryHandle.appendChild(entity.diagHandle)
    }
  }
}

class SpriteSystem extends System {
  constructor() {
    super("sprite")
  }

  update(entity, deltaTime) {
    if (entity.primaryHandle != null) {
      //the entity div exists

      if (entity.sprite.sequence != null) {
        if (entity.sprite.isLoaded == false) {
          //todo-first time through
          const frameData = entity.sprite.sequence.getCurrentFrame()
          const divImage = entity.sprite.sequence.spritesheet.image.src
          entity.innerHandle.style.backgroundImage = `url(${divImage})`
          entity.innerHandle.style.backgroundRepeat = "no-repeat"
          entity.innerHandle.style.backgroundPosition = `-${frameData.x}px -${frameData.y}px`
          entity.sprite.isLoaded = true
        } else {
          //check framerate here

          entity.sprite.sequence.updateElapsedTime(deltaTime)
          entity.sprite.sequence.step()
          const frameData = entity.sprite.sequence.getCurrentFrame()
          const bgPosition = entity.innerHandle.style.backgroundPosition
          if (bgPosition != `-${frameData.x}px -${frameData.y}px`) entity.innerHandle.style.backgroundPosition = `-${frameData.x}px -${frameData.y}px`
        }
      } else {
        //static image

        if (entity.sprite.isLoaded == false) {
          //first time through
          if (entity.innerHandle) {
            entity.innerHandle.style.backgroundImage = `url(${entity.sprite.path})`
            entity.innerHandle.style.backgroundRepeat = `no-repeat`
            entity.innerHandle.style.backgroundSize = `${entity.body.width}px, ${entity.body.height}px`
            entity.innerHandle.style.transform = `rotate(-${entity.sprite.rotation}deg)`
            entity.sprite.isLoaded = true
          }
        }
      }
    }
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
      let screenWidth = window.innerWidth
      let screenHeight = window.innerHeight
      let rectLeft = entity.body.x + entity.hitbox.x
      let rectRight = entity.body.x + entity.hitbox.x + entity.hitbox.w
      let rectTop = entity.body.y + entity.hitbox.y
      let rectBottom = entity.body.y + entity.hitbox.y + entity.hitbox.h

      //is there a screen collision

      if (rectRight > screenWidth + playerWidth) {
        //right collision
        entity.body.x = 0
      } else if (rectTop < -playerWidth) {
        entity.body.y = screenHeight - playerWidth * 2
      } else if (rectBottom > screenHeight + playerWidth) {
        entity.body.y = 0
      } else if (rectLeft < -playerWidth) {
        entity.body.x = screenWidth - playerWidth * 2
      }
    }
  }
}

class A2ACollisionSystem extends System {
  constructor() {
    super("screencollide")
  }

  processEntity(entity) {
    return entity.body.isUserControlled == false && entity.body.isAiControlled == false
  }

  update(entity, deltaTime) {
    //list of other asteroids
    entities.forEach((ent) => {
      //check our entity against all the others
      //check for first pass and hasn't rendered
      if (entity.diagHandle === null) return
      if (ent.diagHandle === null) return
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

class AISystem extends System {
  constructor() {
    super("AI")
  }

  update(entity, deltaTime) {}
}

const systems = [new AISystem(), new SpriteSystem(), new MovementSystem(), new screenCollisionSystem(), new A2ACollisionSystem(), new RenderSystem()]
