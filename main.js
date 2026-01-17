// three.js を CDN から直接読み込む
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

// =====================
// 基本セットアップ
// =====================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // 空色

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// =====================
// 光（これ無いと暗黒世界）
// =====================
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const light = new THREE.DirectionalLight(0xffffff, 0.6);
light.position.set(10, 20, 10);
scene.add(light);

// =====================
// ボクセル生成関数
// =====================
const voxelGeo = new THREE.BoxGeometry(1, 1, 1);

function addBox(x, y, z, color = 0x55ff55) {
  const mat = new THREE.MeshStandardMaterial({ color });
  const box = new THREE.Mesh(voxelGeo, mat);
  box.position.set(x, y, z);
  scene.add(box);
}

// =====================
// 地面を作る（超簡易ワールド）
// =====================
for (let x = -5; x <= 5; x++) {
  for (let z = -5; z <= 5; z++) {
    addBox(x, 0, z, 0x55aa55);
  }
}

// テスト用ブロック
addBox(0, 1, 0, 0xff5555);

// =====================
// ループ
// =====================
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// =====================
// リサイズ対応
// =====================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
