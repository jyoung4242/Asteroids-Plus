function toRads(degrees) {
  return (Math.PI * degrees) / 180
}

class Vector {
  constructor(x = null, y = null, theta = null, magnitude = null) {
    if (x == null && y == null && theta == null && magnitude == null) {
      this.x = 0
      this.y = 0
    } else if (x == null && y == null) {
      //angle in degress, must convert to Rads
      //use theta and magnitude, convert to x,y
      this.x = magnitude * Math.cos(toRads(theta))
      this.y = magnitude * Math.sin(toRads(theta))
    } else if (theta == null && magnitude == null) {
      //use x and y normally
      this.x = x
      this.y = y
    } else {
      return null
    }
  }

  add(delta, update = false) {
    const vector = update ? this : new Vector(this.x, this.y)
    vector.x += delta.x
    vector.y += delta.y
    return vector
  }
  multiply(delta, update = false) {
    const vector = update ? this : new Vector(this.x, this.y)
    const deltaVector = delta instanceof Vector ? delta : new Vector(delta, delta)
    vector.x *= deltaVector.x
    vector.y *= deltaVector.y
    return vector
  }
}
new Vector()

class Component {
  static components = {}

  constructor(name, type, assignValue = false) {
    this.name = name
    this.assignValue = assignValue
    Component.components[name] = type
  }

  static assignTo(entity, name, data) {
    const component = name != null ? new Component.components[name]() : new this()
    component.define(data)
    Object.assign(entity, { [component.name]: component.assignValue ? component.value : component })
  }

  define(data) {}
}

class Body extends Component {
  constructor() {
    super("body", Body, true)
    this.value = {}
  }

  define(data) {
    if (data != null) {
      this.value.x = data.x
      this.value.y = data.y
      this.value.theta = data.theta
      this.value.width = data.width
      this.value.height = data.height
      this.value.centerpoint = data.centerpoint
      this.value.isUserControlled = data.isUserControlled
      this.value.isAiControlled = data.isAiControlled
    }
  }
}
new Body()

class Health extends Component {
  constructor() {
    super("health", Health, true)
    this.value = {}
  }

  define(data) {
    if (data != null) {
      this.value.health = data.health
    }
  }
}
new Health()

class Velocity extends Component {
  constructor() {
    super("velocity", Velocity, true)
    this.value = {}
  }

  define(data) {
    if (data != null) {
      this.value.deltaX = data.deltaX
      this.value.deltaY = data.deltaY
      this.value.theta = data.theta
      this.value.deltaTheta = data.deltaTheta
      this.value.maxAcceleration = data.maxAcceleration
      this.value.acceleration = data.acceleration
      this.value.maxSpeed = data.maxSpeed
      this.value.speed = data.speed
    }
  }
}
new Velocity()

class Render extends Component {
  constructor() {
    super("render", Render, true)
    this.value = {}
  }

  define(data) {
    if (data != null) {
      this.value.visible = data.visible
      this.value.isBorderBoxVisible = data.isBorderBoxVisible
      this.value.scale = data.scale
    }
  }
}

new Render()

class Attack extends Component {
  constructor() {
    super("attack", Attack)
    this.value = {}
  }

  define(data) {
    if (data != null) {
      this.value.attackStrength = data.attackStrength
      this.value.fireRate = data.fireRate
      this.value.regenTime = data.regenTime
      this.value.maxAmmo = data.maxAmmo
      this.value.weaponSpeed = data.weaponSpeed
      this.value.attackTick = 0
    }
  }
}
new Attack()

class Sprite extends Component {
  constructor() {
    super("sprite", Sprite, true)
    this.value = {}
  }

  define(data) {
    if (data != null) {
      this.value.path = data.path
      this.value.rotation = data.rotation
      this.value.sequence = data.sequence
      this.value.isLoaded = false
    }
  }
}
new Sprite()

class HitBox extends Component {
  constructor() {
    super("hitbox", HitBox, true)
    this.value = {}
  }

  define(data) {
    if (data != null) {
      this.value.shape = data.shape
      this.value.w = data.w
      this.value.h = data.h
      this.value.x = data.x
      this.value.y = data.y
      this.value.mass = data.mass
      this.value.inCollision = false
    }
  }
}
new HitBox()
