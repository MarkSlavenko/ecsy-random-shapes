import { World, System, TagComponent, Component, Types } from "ecsy";

const NUM_ELEMENTS = 40;
const SPEED_MULTIPLIER = 0.1;

let canvas = document.querySelector("canvas");
let canvasWidth = canvas.width = window.innerWidth;
let canvasHeight = canvas.height = window.innerHeight;
let ctx = canvas.getContext("2d");

class Velocity {
  constructor() {
    this.x = this.y = 0;
  }
}

class Position {
  constructor() {
    this.x = this.y = 0;
  }
}

class Shape {
  constructor() {
    this.primitive = 'box';
  }
}

class Size {
  constructor() {
    this.value = 0;
  }
}

class Renderable extends TagComponent {}

class MovableSystem extends System {
  execute(delta, time) {
    this.queries.moving.results.forEach(entity => {
      const velocity = entity.getComponent(Velocity);
      const position = entity.getMutableComponent(Position);
      const size = entity.getComponent(Size).value;

      position.x += velocity.x * delta;
      position.y += velocity.y * delta;
      
      if (position.x > canvasWidth + size) position.x = - size;
      if (position.x < - size) position.x = canvasWidth + size;
      if (position.y > canvasHeight + size) position.y = - size;
      if (position.y < - size) position.y = canvasHeight + size;
    });
  }
}

MovableSystem.queries = {
  moving: {
    components: [Velocity, Position]
  }
}

class RendererSystem extends System {
  execute(delta, time) {
    
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    this.queries.renderables.results.forEach(entity => {
      const shape = entity.getComponent(Shape);
      const position = entity.getComponent(Position);
      const size = entity.getComponent(Size);

      if (shape.primitive === 'box') {
        this.drawBox(position, size.value);
      } else {
        this.drawCircle(position, size.value);
      }
    });
  }
  
drawCircle(position, size) {
  ctx.fillStyle = "#888";
  ctx.beginPath();
  ctx.arc(position.x, position.y, size, 0, 2 * Math.PI, false);
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#222";
  ctx.stroke();    
}
  
drawBox(position, size) {
  ctx.beginPath();
  ctx.rect(position.x - size, position.y - size, size, size);
  ctx.fillStyle= "#f28d89";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#800904";
  ctx.stroke();  
  }
}

RendererSystem.queries = {
  renderables: { components: [Renderable, Shape] }
}


const world = new World();
world
  .registerComponent(Velocity)
  .registerComponent(Position)
  .registerComponent(Shape)
  .registerComponent(Size)
  .registerComponent(Renderable)
  .registerSystem(MovableSystem)
  .registerSystem(RendererSystem);


const getRandomVelocity = (speed) => ({
  x: speed * (2 * Math.random() - 1),  
  y: speed * (2 * Math.random() - 1)
})

const getRandomShape = () => ({
  primitive: Math.random() >= 0.5 ? 'circle' : 'box'
})

const getRandomSize = (min, max) => ({
  value: min + Math.random() * (max - min)
})

let lastTime = performance.now();
(function run() {
  const time = performance.now();
  const delta = time - lastTime;

  world.execute(delta, time);
  lastTime = time;
  requestAnimationFrame(run);
})();