import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

/**
 * YarnStage — the brand centerpiece of the landing hero: a soft, hand-wound
 * ball of wool yarn with a loose strand draped around it. The ball is built
 * from a procedural canvas texture (warm cream/rose strands + woolly fuzz),
 * so it needs no external assets. The whole stage tilts gently toward the
 * pointer and floats with a soft contact shadow.
 */

const YARN_RADIUS = 1.12;

/**
 * Builds a warm, tangle-free "wrapped yarn" texture: layered arcs in cream,
 * beige, rose and muted mauve over a wool base, plus fine flecks that read
 * as fibre. Used both as the color map and the bump map for strand ridges.
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

  // Warm wool base
  const base = ctx.createLinearGradient(0, 0, size, size);
  base.addColorStop(0, "#EADFD2");
  base.addColorStop(1, "#D9C9B6");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // Wrapped strands — soft arcs in every direction
  const yarnColors = [
    "#C9ADA7",
    "#E6B6B6",
    "#B7A290",
    "#D8C4AE",
    "#EFE4D8",
    "#9A8C98",
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
    ctx.fillStyle = Math.random() > 0.5 ? "#FFFDF9" : "#7E6E5F";
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

function StageContent() {
  const group = useRef<THREE.Group>(null);
  const ball = useRef<THREE.Mesh>(null);
  const strand = useRef<THREE.Mesh>(null);

  const yarnTexture = useMemo(() => createYarnTexture(), []);

  useFrame((state, delta) => {
    const { pointer, clock } = state;

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

    // Slow unwind of the ball + lazy drift of the loose strand
    if (ball.current) {
      ball.current.rotation.y += delta * 0.22;
    }

    if (strand.current) {
      strand.current.rotation.z = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={0.18} floatIntensity={0.7}>
        {/* Loose strand of yarn draped around the ball (open arc, not a ring) */}
        <mesh
          ref={strand}
          rotation={[Math.PI / 2.15, 0.12, 0]}
          position={[0, 0.08, -0.25]}
        >
          <torusGeometry
            args={[YARN_RADIUS + 0.3, 0.05, 16, 120, Math.PI * 1.5]}
          />
          <meshStandardMaterial color="#E6B6B6" roughness={0.85} metalness={0} />
        </mesh>

        {/* The ball of wool */}
        <mesh ref={ball}>
          <sphereGeometry args={[YARN_RADIUS, 96, 96]} />
          <meshStandardMaterial
            map={yarnTexture}
            bumpMap={yarnTexture}
            bumpScale={0.55}
            roughness={0.92}
            metalness={0}
          />
        </mesh>
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
    aria-label={label ?? "Hand-wound ball of wool yarn"}
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
