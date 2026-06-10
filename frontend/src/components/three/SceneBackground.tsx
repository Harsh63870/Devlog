import { Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Particles } from "./Particles";
import { CommitGraph } from "./CommitGraph";
import { useAppStore } from "@/store/useAppStore";

/** Smoothly moves the camera toward the pointer — parallax. */
function ParallaxRig() {
  const { camera, pointer } = useThree();

  useFrame((_, delta) => {
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.6, 2, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.y * 0.35, 2, delta);
    camera.lookAt(0, 0, -2);
  });

  return null;
}

/**
 * Fixed, GPU-efficient 3D backdrop:
 * capped DPR, no shadows, additive blending, ~3 draw calls total.
 */
export function SceneBackground() {
  const show3D = useAppStore((s) => s.show3D);

  if (!show3D) {
    return (
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-60" aria-hidden />
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      {/* Gradient wash under the canvas */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,oklch(0.35_0.12_295/30%),transparent_70%),radial-gradient(ellipse_50%_40%_at_85%_110%,oklch(0.3_0.08_220/25%),transparent_70%)]" />
      <div className="absolute inset-0 bg-grid opacity-40" />
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Suspense fallback={null}>
          <ParallaxRig />
          <Particles />
          <CommitGraph />
          <fog attach="fog" args={["#0b0c12", 8, 20]} />
        </Suspense>
      </Canvas>
      {/* Vignette to keep content readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,oklch(0.13_0.012_260/80%)_100%)]" />
    </div>
  );
}
