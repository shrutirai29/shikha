import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

/**
 * ProductStage — an intentional 3D product presentation used in the
 * landing hero. The featured product's image floats on a lit "medallion"
 * with a rose halo ring and soft contact shadow; the whole stage tilts
 * gently toward the pointer. If the image can't be loaded (or WebGL is
 * unavailable) it falls back to a calm cream medallion so the layout
 * never breaks.
 */

const MEDALLION_RADIUS = 1.12;

function StageContent({ imageUrl }: { imageUrl?: string }) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setTexture(null);
      return;
    }

    let disposed = false;

    const loader = new THREE.TextureLoader();

    loader.load(
      imageUrl,
      (loaded) => {
        if (disposed) return;

        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.anisotropy = 8;

        setTexture(loaded);
      },
      undefined,
      () => {
        if (!disposed) setTexture(null);
      }
    );

    return () => {
      disposed = true;
    };
  }, [imageUrl]);

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

    if (ring.current) {
      ring.current.rotation.z = clock.getElapsedTime() * 0.12;
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={0.18} floatIntensity={0.7}>
        {/* Halo ring */}
        <mesh ref={ring} rotation={[Math.PI / 2.05, 0.15, 0]} position={[0, 0.05, -0.35]}>
          <torusGeometry args={[MEDALLION_RADIUS + 0.32, 0.022, 16, 120]} />
          <meshStandardMaterial
            color="#E6B6B6"
            metalness={0.75}
            roughness={0.22}
            emissive="#3B3957"
            emissiveIntensity={0.18}
          />
        </mesh>

        {/* Product medallion */}
        <mesh>
          <circleGeometry args={[MEDALLION_RADIUS, 96]} />
          {texture ? (
            <meshStandardMaterial
              map={texture}
              roughness={0.3}
              metalness={0.06}
            />
          ) : (
            <meshStandardMaterial
              color="#F2E9E4"
              roughness={0.55}
              metalness={0.02}
            />
          )}
        </mesh>

        {/* Soft rim behind the medallion for depth */}
        <mesh position={[0, 0, -0.18]}>
          <circleGeometry args={[MEDALLION_RADIUS + 0.05, 64]} />
          <meshBasicMaterial
            color="#C9ADA7"
            transparent
            opacity={0.14}
            side={THREE.DoubleSide}
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
  imageUrl,
  className,
  label,
}: {
  imageUrl?: string;
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
    aria-label={label ?? "Featured product presentation"}
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
      <StageContent imageUrl={imageUrl} />
    </Canvas>
  </div>
);

export default ProductStage;
