import "./style.css";

const { cos, sin, sqrt, acos, atan2, abs, PI } = Math;

export interface Vector {
  x: number;
  y: number;
  z: number;
}

export const vec = (x: number = 0, y: number = 0, z: number = 0): Vector => ({
  x,
  y,
  z,
});

vec.set = (o: Vector, x: number = 0, y: number = 0, z: number = 0): Vector => {
  o.x = x;
  o.y = y;
  o.z = z;
  return o;
};

export const clamp = (a: number, b: number, x: number): number =>
  x < a ? a : x > b ? b : x;

function project(o: Vector, { x, y, z }: Vector): Vector {
  let ct = cos(theta),
    st = sin(theta);
  let cp = cos(phi),
    sp = sin(phi);
  let a = x * ct + y * st;
  return vec.set(o, y * ct - x * st, cp * z - sp * a, cp * a + sp * z);
}

const Z: Vector = vec(0, 0, 1);

const limit: number = PI / 1000;
const center: number = (PI - limit) / 2;

let theta: number = center;
let phi: number = center;

let mouseX: number;
let mouseY: number;

const length = 250;
const lineWidth = 2;
const nbSections = 16;
const scleraStrokeColor = "#242323";
const scleraFillColor = "#fcfcfc";
const irisStrokeColor = "#70bee6";
const irisFillColor = "#70bee6";
const pupilStrokeColor = "#242323";
const pupilFillColor = "#242323";
const fill = true;
const effectDistance = 1;
const eyeRollRestriction = 120;

const height: number = length;
const width: number = length;
const radius: number = width / 2 - lineWidth;

const canvasId = "canvas-id";
const wrapperId = "wrapper-id";

export const elementNotFoundError = (elementId: string) =>
  new Error(`element with id '${elementId}' not found`);

const wrapper = document.getElementById(wrapperId) as HTMLDivElement | null;
if (!wrapper) throw elementNotFoundError(wrapperId);

const cvs = document.getElementById(canvasId) as HTMLCanvasElement | null;
if (!cvs) throw elementNotFoundError(canvasId);

const ctx: CanvasRenderingContext2D | null = cvs.getContext("2d");
if (!ctx) throw new Error("context null");

const scale: number = window.devicePixelRatio;
const maxDistanceOfEffect: number =
  Math.max(window.innerWidth, window.innerHeight) * effectDistance;

cvs.width = width * scale;
cvs.height = height * scale;
cvs.style.width = `${width}px`;
cvs.style.height = `${height}px`;

const _p: Vector = vec();

function draw_section(n: Vector, o: number = 0) {
  if (!ctx) return;

  let { x, y, z } = project(_p, n); // project normal on camera
  let a: number = atan2(y, x); // angle of projected normal -> angle of ellipse
  let ry: number = sqrt(1 - o * o); // radius of section -> y-radius of ellipse
  let rx: number = ry * abs(z); // x-radius of ellipse
  let W: number = sqrt(x * x + y * y);
  let sa: number = acos(clamp(-1, 1, (o * (1 / W - W)) / rx)); // ellipse start angle
  let sb: number = z > 0 ? 2 * PI - sa : -sa; // ellipse end angle

  ctx.beginPath();
  ctx.ellipse(
    x * o * radius,
    y * o * radius,
    rx * radius,
    ry * radius,
    a,
    sa,
    sb,
    z <= 0,
  );
  ctx.stroke();

  if (fill) ctx.fill();
}

function draw_arcs(): void {
  if (!ctx) return;

  ctx.lineWidth = lineWidth;

  let a: number = (2 / nbSections) * PI;
  ctx.strokeStyle = irisStrokeColor;
  ctx.fillStyle = irisFillColor;
  draw_section(Z, cos(a));

  a = (1 / nbSections) * PI;
  ctx.strokeStyle = pupilStrokeColor;
  ctx.fillStyle = pupilFillColor;
  draw_section(Z, cos(a));
}

ctx.fillStyle = "rgba(255, 255, 255, 0)";
ctx.lineCap = "round";
ctx.scale(scale, scale);

const getDistanceXY = (): { distanceX: number; distanceY: number } => {
  if (!wrapper)
    return {
      distanceX: 0,
      distanceY: 0,
    };

  const rect = wrapper.getBoundingClientRect();

  const centerX: number = rect.left + rect.width / 2;
  const centerY: number = rect.top + rect.height / 2;

  const distanceX: number = mouseX - centerX;
  const distanceY: number = mouseY - centerY;

  return {
    distanceX,
    distanceY,
  };
};

function render() {
  if (!ctx) return;

  // setup
  ctx.save();
  ctx.fillRect(0, 0, width, height);
  ctx.translate(width >> 1, height >> 1);
  ctx.scale(1, -1);

  const { distanceX, distanceY } = getDistanceXY();

  const angleRadians: number = atan2(distanceY, distanceX);
  let angleDegrees: number = angleRadians * (180 / PI) + 90;

  if (angleDegrees < 0) angleDegrees += 360;

  ctx.rotate((-angleDegrees * Math.PI) / 180);

  // fill sclera
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2 * PI);
  ctx.fillStyle = scleraFillColor;
  ctx.fill();

  // draw and fill pupil and iris
  draw_arcs();

  // sclera outline
  ctx.strokeStyle = scleraStrokeColor;
  ctx.lineWidth = lineWidth / 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2 * PI);
  ctx.stroke();
  ctx.restore();
}

const calculateTheta = () => {
  const { distanceX, distanceY } = getDistanceXY();
  const distance: number = Math.sqrt(
    distanceX * distanceX + distanceY * distanceY,
  );

  const distanceRatio = 1 - distance / maxDistanceOfEffect;
  const orientation = center * distanceRatio;

  const restrictedLimit: number = limit * eyeRollRestriction;

  if (orientation < restrictedLimit) {
    theta = restrictedLimit;
    phi = restrictedLimit;
    return;
  }

  theta = orientation;
  phi = orientation;
};

const rerender = () => {
  calculateTheta();
  render();
};

const onMouseMove = (event: MouseEvent) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
  rerender();
};

// render initial
render();

wrapper.style.width = `${width}px`;
wrapper.style.height = `${height}px`;

document.addEventListener("mousemove", onMouseMove);
