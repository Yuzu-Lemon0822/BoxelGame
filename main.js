import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

// =====================
// Display（描画）
// =====================
const Display = {
  scene: null,
  camera: null,
  renderer: null,

  yaw: 0,
  pitch: 0,

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // 光
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const light = new THREE.DirectionalLight(0xffffff, 0.6);
    light.position.set(10, 20, 10);
    this.scene.add(light);
  },

  updateCameraRotation(dx, dy) {
    const sensitivity = 0.002;

    this.yaw   -= dx * sensitivity;
    this.pitch -= dy * sensitivity;

    // 上下向きすぎ防止
    this.pitch = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, this.pitch)
    );

    this.camera.rotation.set(this.pitch, this.yaw, 0);
  },

  render() {
    this.renderer.render(this.scene, this.camera);
  }
};

// =====================
// Input（キー・マウス）
// =====================
const Input = {
  keys: {},
  mouseDX: 0,
  mouseDY: 0,

  init(canvas) {
    window.addEventListener("keydown", e => {
      this.keys[e.code] = true;
    });
    window.addEventListener("keyup", e => {
      this.keys[e.code] = false;
    });

    // クリックでポインタロック
    canvas.addEventListener("click", () => {
      canvas.requestPointerLock();
    });

    // マウス移動量
    window.addEventListener("mousemove", e => {
      if (document.pointerLockElement === canvas) {
        this.mouseDX += e.movementX;
        this.mouseDY += e.movementY;
      }
    });
  },

  isDown(key) {
    return !!this.keys[key];
  },

  consumeMouse() {
    const dx = this.mouseDX;
    const dy = this.mouseDY;
    this.mouseDX = 0;
    this.mouseDY = 0;
    return { dx, dy };
  }
};

// =====================
// WorldData（データ）
// =====================
const WorldData = {
  blocks: new Map(),

  key(x, y, z) {
    return `${x},${y},${z}`;
  },

  setBlock(x, y, z, type) {
    this.blocks.set(this.key(x, y, z), type);
  },

  getBlock(x, y, z) {
    return this.blocks.get(this.key(x, y, z)) ?? "air";
  }
};

// =====================
// ボクセル描画
// =====================
const voxelGeo = new THREE.BoxGeometry(1, 1, 1);
const voxelMats = {
  grass: new THREE.MeshStandardMaterial({ color: 0x55aa55 })
};

function addVoxel(x, y, z, type) {
  const mesh = new THREE.Mesh(voxelGeo, voxelMats[type]);
  mesh.position.set(x, y, z);
  Display.scene.add(mesh);
}

// =====================
// Game（処理）
// =====================
const Game = {
  speed: 0.1,

  init() {
    Display.init();
    Input.init(Display.renderer.domElement);

    // 地面生成
    for (let x = -10; x <= 10; x++) {
      for (let z = -10; z <= 10; z++) {
        WorldData.setBlock(x, 0, z, "grass");
        addVoxel(x, 0, z, "grass");
      }
    }
  },

  update() {
    // マウス視点
    const { dx, dy } = Input.consumeMouse();
    Display.updateCameraRotation(dx, dy);

    // 移動方向
    const forward = new THREE.Vector3();
    Display.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3()
      .crossVectors(forward, new THREE.Vector3(0, 1, 0))
      .normalize();

    if (Input.isDown("KeyW"))
      Display.camera.position.addScaledVector(forward, this.speed);
    if (Input.isDown("KeyS"))
      Display.camera.position.addScaledVector(forward, -this.speed);
    if (Input.isDown("KeyA"))
      Display.camera.position.addScaledVector(right, -this.speed);
    if (Input.isDown("KeyD"))
      Display.camera.position.addScaledVector(right, this.speed);
  },

  loop() {
    this.update();
    Display.render();
    requestAnimationFrame(() => this.loop());
  }
};

Game.init();
Game.loop();

// =====================
// リサイズ対応
// =====================
window.addEventListener("resize", () => {
  Display.camera.aspect = window.innerWidth / window.innerHeight;
  Display.camera.updateProjectionMatrix();
  Display.renderer.setSize(window.innerWidth, window.innerHeight);
});
