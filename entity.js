function addPlayerEntity(w, h) {
  var rsltArray = []
  rsltArray.push({
    id: "player",
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
        weaponSpeed: 1,
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
        acceleration: 0.1,
      },
      render: {
        visible: true,
        isBorderBoxVisible: false,
        scale: 1,
      },
      sprite: {
        path: "./assets/images/player1.png",
        rotation: 90,
        sequence: null,
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

function generateAsteroids(numAsteroids, w, h, animations) {
  var rsltArray = []
  //map animation sequence
  let animationMap = {
    0: animations["asteroid1_forward"],
    1: animations["asteroid1_reverse"],
    2: animations["asteroid2_forward"],
    3: animations["asteroid2_reverse"],
  }

  for (let i = 0; i < 5; i++) {
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
    rndSeq = animationMap[rndSeq]

    let idString = `asteroid_${i}`

    rsltArray.push({
      id: idString,
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
          visible: true,
          isBorderBoxVisible: false,
          scale: rndmSize,
        },
        sprite: {
          path: "./assets/images/asteroid.png",
          rotation: 0,
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

class Entity {
  constructor(id) {
    this.id = id
    this.primaryHandle = null
    this.diagHandle = null
    this.innerHandle = null
  }
}
