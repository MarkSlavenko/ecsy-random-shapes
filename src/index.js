import { World, System, TagComponent} from "ecsy";

const NUM_ELEMENTS = 40;
const SPEED_MULTIPLIER = 0.15;

const canvas = document.querySelector("canvas");
const canvasWidth = canvas.width = window.innerWidth;
const canvasHeight = canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

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
  execute(delta) {
    this.queries.moving.results.forEach(entity => {
      const velocity = entity.getComponent(Velocity);
      const position = entity.getMutableComponent(Position);

      position.x += velocity.x * delta;
      position.y += velocity.y * delta;
    });
  }
}

MovableSystem.queries = {
  moving: {
    components: [Velocity, Position]
  }
}

class RendererSystem extends System {
  execute() {
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
});

const getRandomShape = () => ({
  primitive: Math.random() >= 0.5 ? 'circle' : 'box'
});

const getRandomSize = (min, max) => ({
  value: min + Math.random() * (max - min)
});

let lastTime = performance.now();
(function run() {
  const time = performance.now();
  const delta = time - lastTime;

  world.execute(delta, time);
  lastTime = time;
  requestAnimationFrame(run);
})();

canvas.addEventListener('mousedown', event => {
  for(let i = 0; i < NUM_ELEMENTS; i += 1) {
    const entity = world.createEntity();

    entity
    .addComponent(Shape, getRandomShape())
    .addComponent(Size, getRandomSize(1, 20))
    .addComponent(Position, {x: event.offsetX, y: event.offsetY})
    .addComponent(Velocity, getRandomVelocity(SPEED_MULTIPLIER))
    .addComponent(Renderable)

    setTimeout(() => entity.remove(), 1000 + Math.random() * 4000);
  }
});