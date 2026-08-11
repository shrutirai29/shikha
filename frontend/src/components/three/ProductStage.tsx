import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

/**
 * YarnStage — the brand centerpiece of the landing hero: a soft periwinkle
 * ball of wool yarn with three wooden knitting needles passing through it.
 * The ball is built from a procedural canvas texture (wrapped strands +
 * woolly fuzz) so it needs no external assets. The whole stage tilts gently
 * toward the pointer and floats with a soft contact shadow.
 */

const YARN_RADIUS = 1.12;

/**
 * Builds a wrapped-yarn texture in soft periwinkle blues: layered arcs over
 * a muted blue base, plus fine fibre flecks. Used as both the color map and
 * the bump map for strand ridges.
 */
function createYarnTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // Soft periwinkle wool base
  const base = ctx.createLinearGradient(0, 0, size, size);
  base.addColorStop(0, "#8A99B5");
  base.addColorStop(1, "#64748F");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // Wrapped strands — soft arcs in every direction
  const yarnColors = [
    "#7B8BA5",
    "#5B6C8A",
    "#9AA8C0",
    "#6E7FA0",
    "#B4BEDA",
    "#8392AC",
  ];

  ctx.lineCap = "round";

  for (let i = 0; i < 320; i++) {
    ctx.strokeStyle = yarnColors[i % yarnColors.length];
    ctx.globalAlpha = 0.35 + Math.random() * 0.45;
    ctx.lineWidth = 2.5 + Math.random() * 5;
    ctx.beginPath();
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 40 + Math.random() * 300;
    const start = Math.random() * Math.PI * 2;
    const sweep = Math.PI * (0.5 + Math.random() * 1.6);
    ctx.arc(x, y, r, start, start + sweep, Math.random() > 0.5);
    ctx.stroke();
  }

  // Woolly fuzz + fibre flecks
  for (let i = 0; i < 5000; i++) {
    ctx.globalAlpha = 0.04 + Math.random() * 0.09;
    ctx.fillStyle = Math.random() > 0.5 ? "#E6EAF2" : "#3E4A63";
    ctx.beginPath();
    ctx.arc(
      Math.random() * size,
      Math.random() * size,
      0.6 + Math.random() * 1.7,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;

  return texture;
}

const NEEDLE_LENGTH = 3.6;
const NEEDLE_RADIUS = 0.05;

/** A single wooden knitting needle: shaft, tapered point, round knob. */
function KnittingNeedle({
  rotation,
}: {
  rotation: [number, number, number];
}) {
  const wood = { roughness: 0.55, metalness: 0.02 };

  return (
    <group rotation={rotation}>
      {/* Shaft */}
      <mesh>
        <cylinderGeometry
          args={[NEEDLE_RADIUS, NEEDLE_RADIUS, NEEDLE_LENGTH, 20]}
        />
        <meshStandardMaterial color="#D4BC9B" {...wood} />
      </mesh>

      {/* Tapered point */}
      <mesh position={[0, NEEDLE_LENGTH / 2 + 0.13, 0]}>
        <coneGeometry args={[NEEDLE_RADIUS, 0.26, 20]} />
        <meshStandardMaterial color="#C9A97F" {...wood} />
      </mesh>

      {/* Round knob */}
      <mesh position={[0, -NEEDLE_LENGTH / 2 - 0.18, 0]}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial color="#C9A97F" {...wood} />
      </mesh>
    </group>
  );
}

function StageContent() {
  const group = useRef<THREE.Group>(null);
  const turntable = useRef<THREE.Group>(null);

  const yarnTexture = useMemo(() => createYarnTexture(), []);

  useFrame((state, delta) => {
    const { pointer } = state;

    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        pointer.x * 0.4,
        2.4,
        delta
      );
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        -pointer.y * 0.22,
        2.4,
        delta
      );
    }

    // Turntable spin: the yarn ball AND the knitting needles turn together
    if (turntable.current) {
      turntable.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={0.18} floatIntensity={0.7}>
        <group ref={turntable}>
          {/* Three knitting needles through the ball */}
          <KnittingNeedle rotation={[0, 0, Math.PI / 2]} />
          <KnittingNeedle rotation={[0.55, 0.35, Math.PI / 2 + 0.3]} />
          <KnittingNeedle rotation={[-0.55, -0.35, Math.PI / 2 - 0.3]} />

          {/* The ball of wool */}
          <mesh>
            <sphereGeometry args={[YARN_RADIUS, 96, 96]} />
            <meshStandardMaterial
              map={yarnTexture}
              bumpMap={yarnTexture}
              bumpScale={0.55}
              roughness={0.92}
              metalness={0}
            />
          </mesh>
        </group>
      </Float>

      <ContactShadows
        position={[0, -1.85, 0]}
        opacity={0.32}
        scale={5.2}
        blur={2.8}
        far={3.2}
        color="#22223B"
      />

      {/* Ambient + studio lighting (no external HDR dependencies) */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} color="#FFF3E8" />
      <pointLight position={[-4, -2, -3]} intensity={0.7} color="#9A8C98" />
      <spotLight
        position={[0, 2.4, 4.4]}
        angle={0.42}
        penumbra={1}
        intensity={1.5}
        color="#FFFFFF"
      />
    </group>
  );
}

export const ProductStage = ({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-[2rem]",
      "bg-ink-grain",
      className
    )}
    role="img"
    aria-label={label ?? "Periwinkle ball of wool yarn with knitting needles"}
  >
    {/* Spotlight glow */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(circle at 50% 42%, rgb(230 182 182 / 0.22), transparent 58%)",
      }}
    />
    <Canvas
      camera={{ position: [0, 0, 5.4], fov: 42 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <StageContent />
    </Canvas>
  </div>
);

export default ProductStage;
