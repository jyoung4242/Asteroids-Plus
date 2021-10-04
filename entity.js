var cameraHandle

function addPlayerEntity(w, h) {
  var rsltArray = []
  rsltArray.push({
    id: "player",
    category: "player",
    components: {
      body: {
        id: "player",
        width: 64,
        height: 64,
        x: w / 2 - 32,
        y: h / 2 + 32,
        theta: 0,
        centerpoint: { x: 0, y: 0 },
        isUserControlled: true,
        isAiControlled: false,
      },
      attack: {
        attackStrength: 1,
        fireRate: 10,
        regenTime: 10,
        maxAmmo: 25,
        weaponSpeed: 10,
        attackTick: 0,
      },
      health: {
        health: 25,
      },
      velocity: {
        deltaX: 0,
        deltaY: 0,
        theta: 0,
        deltaTheta: 0,
        maxAcceleration: 1,
        maxSpeed: 10,
        speed: 0,
        acceleration: 0.4,
      },
      render: {
        visible: false,
        isBorderBoxVisible: false,
        scale: 1,
      },
      sprite: {
        path: "./assets/images/player1.png",
        rotation: 90,
        sequence: null,
        frameIndex: -1,
      },
      hitbox: {
        shape: "rectangle",
        x: 0,
        y: 0,
        w: 64,
        h: 64,
        mass: 1,
      },
    },
  })

  return rsltArray
}

function generateAsteroids(numAsteroids, w, h) {
  var rsltArray = []
  //map animation sequence

  for (let i = 0; i < numAsteroids; i++) {
    //determine all the random decisions first
    //random size
    let rndmSize = Math.random() * 1.25 + 0.5
    //random starting angle
    let rndmAngle = Math.random() * 360
    //random speed
    let rndSpeed = 10 - rndmSize * 6
    //random starting point
    let rndX = Math.random() * w
    let rndY = Math.random() * h
    //random sequence and spin
    let rndSeq = Math.floor(Math.random() * 4)

    //rndSeq = animationMap[rndSeq]

    let idString = `asteroid_${i}`

    rsltArray.push({
      id: idString,
      category: "asteroid",
      components: {
        body: {
          width: 128,
          height: 128,
          x: rndX,
          y: rndY,
          centerpoint: { x: 0, y: 0 },
          theta: 0,
          isUserControlled: false,
          isAiControlled: false,
        },
        velocity: {
          deltaX: 0,
          deltaY: 0,
          theta: rndmAngle,
          deltaTheta: 0,
          maxAcceleration: 1,
          maxSpeed: 10,
          speed: rndSpeed,
          acceleration: 0.1,
        },
        render: {
          visible: false,
          isBorderBoxVisible: false,
          scale: rndmSize,
        },
        sprite: {
          path: "./assets/images/asteroid.png",
          rotation: 0,
          frameIndex: 0,
          sequence: rndSeq,
        },
        hitbox: {
          shape: "circle",
          x: 5,
          y: 10,
          w: 90,
          h: 90,
          mass: rndmSize,
        },
      },
    })
  }

  return rsltArray
}

function makeDiv(entity) {
  //create new div
  cameraHandle = document.getElementById("camera")

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

class Entity {
  constructor(id, category) {
    this.id = id
    this.category = category
    this.primaryHandle = null
    this.diagHandle = null
    this.innerHandle = null
  }
}

function createPlayerBullet(bulletPosition, g1) {
  let timestamp = performance.now().toFixed(0)
  let idString
  if (g1) {
    idString = `G1_bullet_${timestamp}`
  } else {
    idString = `G2_bullet_${timestamp}`
  }

  let bulletObject = {
    id: idString,
    category: "bullet",
    components: {
      body: {
        width: 20,
        height: 15,
        x: bulletPosition.x,
        y: bulletPosition.y,
        centerpoint: { x: 0, y: 0 },
        theta: bulletPosition.theta,
        isUserControlled: false,
        isAiControlled: false,
      },
      attack: {
        attackStrength: 1,
        fireRate: null,
        regenTime: null,
        maxAmmo: null,
        weaponSpeed: 10,
        attackTick: null,
      },
      velocity: {
        deltaX: 0,
        deltaY: 0,
        theta: bulletPosition.theta,
        deltaTheta: 0,
        maxAcceleration: 1,
        maxSpeed: 15,
        speed: 15,
        acceleration: 0.1,
      },
      render: {
        visible: true,
        isBorderBoxVisible: false,
        scale: 1,
      },
      sprite: {
        path: "./assets/images/playerbullet.png",
        rotation: 90,
        frameIndex: -1,
        sequence: null,
      },
      hitbox: {
        shape: "rectangle",
        x: 0,
        y: 0,
        w: 20,
        h: 15,
        mass: 0.05,
      },
    },
  }
  return bulletObject
}
