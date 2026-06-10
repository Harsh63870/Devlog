import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GraphNode {
  position: THREE.Vector3;
  scale: number;
  branch: number;
}

const BRANCH_COLORS = ["#8b5cf6", "#22d3ee", "#34d399"];

/**
 * Procedural "git commit graph": three branch lanes of nodes,
 * connected by lines, with merge links between lanes.
 * Nodes are instanced (1 draw call) + lines are a single LineSegments.
 */
export function CommitGraph() {
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const { nodes, linePositions, lineColors } = useMemo(() => {
    const nodes: GraphNode[] = [];
    const lanes = [-2.2, 0, 2.2];
    const perLane = 9;

    for (let lane = 0; lane < lanes.length; lane++) {
      for (let i = 0; i < perLane; i++) {
        const x = -8 + i * 2 + (lane === 1 ? 1 : 0);
        const y = lanes[lane] + Math.sin(i * 1.7 + lane * 2) * 0.45;
        const z = -1 + Math.sin(i * 0.9 + lane) * 0.8;
        nodes.push({
          position: new THREE.Vector3(x, y, z),
          scale: 0.06 + Math.random() * 0.05,
          branch: lane,
        });
      }
    }

    const segments: [THREE.Vector3, THREE.Vector3, number][] = [];
    // connect consecutive commits within each lane
    for (let lane = 0; lane < lanes.length; lane++) {
      const laneNodes = nodes.filter((n) => n.branch === lane);
      for (let i = 0; i < laneNodes.length - 1; i++) {
        segments.push([laneNodes[i].position, laneNodes[i + 1].position, lane]);
      }
    }
    // merge/branch links between lanes
    const merges: [number, number][] = [
      [2, 12], [6, 14], [11, 22], [16, 24], [4, 20], [8, 26],
    ];
    for (const [a, b] of merges) {
      if (nodes[a] && nodes[b]) segments.push([nodes[a].position, nodes[b].position, nodes[b].branch]);
    }

    const linePositions = new Float32Array(segments.length * 6);
    const lineColors = new Float32Array(segments.length * 6);
    segments.forEach(([from, to, branch], i) => {
      linePositions.set([from.x, from.y, from.z, to.x, to.y, to.z], i * 6);
      const c = new THREE.Color(BRANCH_COLORS[branch]);
      lineColors.set([c.r, c.g, c.b, c.r, c.g, c.b], i * 6);
    });

    return { nodes, linePositions, lineColors };
  }, []);

  // place instances once after mount
  useEffect(() => {
    const mesh = instancedRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    nodes.forEach((node, i) => {
      dummy.position.copy(node.position);
      dummy.scale.setScalar(node.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.set(BRANCH_COLORS[node.branch]));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [nodes]);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    const t = state.clock.elapsedTime;
    group.rotation.z = Math.sin(t * 0.08) * 0.04;
    group.position.y = Math.sin(t * 0.15) * 0.25;
  });

  return (
    <group ref={groupRef} position={[0, 0, -3]} rotation={[0.15, 0, -0.08]}>
      <instancedMesh ref={instancedRef} args={[undefined, undefined, nodes.length]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial transparent opacity={0.9} toneMapped={false} />
      </instancedMesh>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
