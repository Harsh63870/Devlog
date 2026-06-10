import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 350;

/** Single-draw-call floating particle field. */
export function Particles() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
      speeds[i] = 0.2 + Math.random() * 0.6;
    }
    return { positions, speeds };
  }, []);

  useFrame((state) => {
    const points = pointsRef.current;
    if (!points) return;
    const t = state.clock.elapsedTime;
    const arr = points.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      // gentle vertical drift, wraps around
      arr[i * 3 + 1] += speeds[i] * 0.003;
      if (arr[i * 3 + 1] > 7) arr[i * 3 + 1] = -7;
      arr[i * 3] += Math.sin(t * 0.3 + i) * 0.0008;
    }
    points.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#a78bfa"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
