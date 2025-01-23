export default class FPSCounter {
  constructor(interval = 1000) {
    this.fps = 0;
    this.fpsCount = 0;
    this.lastTime = 0;
    this.interval = interval;
  }
  update(timestamp) {
    const elapsed = timestamp - this.lastTime;
    if (elapsed >= this.interval) {
      this.fps = this.fpsCount / (elapsed / 1000);
      this.fpsCount = 1;
      this.lastTime = timestamp;
    } else {
      this.fpsCount++;
    }
  }
  reset() {
    this.fps = 0;
    this.fpsCount = 0;
    this.lastTime = 0;
  }
}
