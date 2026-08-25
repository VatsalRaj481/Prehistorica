import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCcw, Box, Eye } from 'lucide-react';

interface ThreeDScaleViewerProps {
  speciesName: string;
  lengthM?: number | null;
  heightM?: number | null;
  weightKg?: number | null;
  clade?: string | null;
}

// Low-poly procedural creature model built with Three.js primitives (1 Three.js unit = 1 meter)
function LowPolyCreature({
  lengthM = 10,
  heightM = 3.5,
  clade = 'Theropod',
  wireframe = false
}: {
  lengthM?: number;
  heightM?: number;
  clade?: string;
  wireframe?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Animate gentle idling breathing motion
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.04;
    }
  });

  const material = new THREE.MeshStandardMaterial({
    color: '#D97706', // Warm amber museum specimen tone
    roughness: 0.4,
    metalness: 0.25,
    wireframe: wireframe,
    flatShading: true
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: '#B45309', // Terracotta/Rust accent
    roughness: 0.45,
    metalness: 0.3,
    wireframe: wireframe,
    flatShading: true
  });

  const normClade = (clade || '').toLowerCase();
  const isSauropod = normClade.includes('sauropod');
  const isPterosaur = normClade.includes('pterosaur');
  const isMarine = normClade.includes('marine') || normClade.includes('piscivore') || normClade.includes('ichthyosaur');

  // Scale parameters (1 unit = 1 meter, with realistic proportions)
  const len = Math.max(1.2, lengthM * 0.35);
  const ht = Math.max(0.7, heightM * 0.45);

  if (isSauropod) {
    return (
      <group ref={groupRef} position={[-len * 0.2, ht * 0.45, 0]}>
        {/* Main Barrel Torso */}
        <mesh material={material} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[ht * 0.45, ht * 0.5, len * 0.45, 8]} />
        </mesh>

        {/* Sweeping Long Neck */}
        <mesh material={material} position={[0, ht * 0.6, len * 0.3]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[ht * 0.15, ht * 0.3, ht * 1.2, 7]} />
        </mesh>

        {/* Head */}
        <mesh material={accentMaterial} position={[0, ht * 1.1, len * 0.48]}>
          <boxGeometry args={[ht * 0.22, ht * 0.18, ht * 0.32]} />
        </mesh>

        {/* Whip Tail */}
        <mesh material={material} position={[0, ht * 0.05, -len * 0.4]} rotation={[-0.2, 0, 0]}>
          <coneGeometry args={[ht * 0.25, len * 0.6, 7]} />
        </mesh>

        {/* 4 Pillar Legs */}
        {[-ht * 0.35, ht * 0.35].map((x, i) => (
          <React.Fragment key={i}>
            {/* Front Leg */}
            <mesh material={accentMaterial} position={[x, -ht * 0.45, len * 0.15]}>
              <cylinderGeometry args={[ht * 0.12, ht * 0.14, ht * 0.9, 6]} />
            </mesh>
            {/* Rear Leg */}
            <mesh material={accentMaterial} position={[x, -ht * 0.45, -len * 0.18]}>
              <cylinderGeometry args={[ht * 0.14, ht * 0.15, ht * 0.9, 6]} />
            </mesh>
          </React.Fragment>
        ))}
      </group>
    );
  }

  if (isPterosaur) {
    return (
      <group ref={groupRef} position={[0, heightM * 0.5 + 1.2, 0]}>
        {/* Torso */}
        <mesh material={material} position={[0, 0, 0]} rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 0.9, 6]} />
        </mesh>
        {/* Head & Long Crest */}
        <mesh material={accentMaterial} position={[0, 0.3, 0.35]} rotation={[0.4, 0, 0]}>
          <coneGeometry args={[0.12, 0.8, 5]} />
        </mesh>
        {/* Expanded Wings */}
        <mesh material={material} position={[-len * 0.45, 0, 0]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[len * 0.9, 0.03, 0.6]} />
        </mesh>
        <mesh material={material} position={[len * 0.45, 0, 0]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[len * 0.9, 0.03, 0.6]} />
        </mesh>
      </group>
    );
  }

  if (isMarine) {
    return (
      <group ref={groupRef} position={[0, ht * 0.5 + 0.5, 0]}>
        {/* Streamlined Torpedo Body */}
        <mesh material={material} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[ht * 0.1, ht * 0.45, len * 0.8, 8]} />
        </mesh>
        {/* Snout */}
        <mesh material={accentMaterial} position={[0, 0, len * 0.45]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[ht * 0.15, len * 0.25, 7]} />
        </mesh>
        {/* Flippers */}
        <mesh material={accentMaterial} position={[-ht * 0.4, 0, len * 0.1]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[ht * 0.6, 0.04, 0.3]} />
        </mesh>
        <mesh material={accentMaterial} position={[ht * 0.4, 0, len * 0.1]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[ht * 0.6, 0.04, 0.3]} />
        </mesh>
      </group>
    );
  }

  // Default Theropod / Bipedal Dinosaur (T-rex, Spinosaurus, Rajasaurus, etc.)
  return (
    <group ref={groupRef} position={[-len * 0.1, ht * 0.5, 0]}>
      {/* Torso */}
      <mesh material={material} position={[0, 0, 0]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[ht * 0.35, ht * 0.4, len * 0.4, 8]} />
      </mesh>

      {/* Neck */}
      <mesh material={material} position={[0, ht * 0.35, len * 0.2]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[ht * 0.2, ht * 0.28, ht * 0.5, 7]} />
      </mesh>

      {/* Head & Jaws */}
      <mesh material={material} position={[0, ht * 0.55, len * 0.35]}>
        <boxGeometry args={[ht * 0.22, ht * 0.22, len * 0.22]} />
      </mesh>

      {/* Tapered Snout */}
      <mesh material={accentMaterial} position={[0, ht * 0.5, len * 0.48]}>
        <boxGeometry args={[ht * 0.18, ht * 0.15, len * 0.16]} />
      </mesh>

      {/* Long Tail */}
      <mesh material={material} position={[0, ht * 0.05, -len * 0.35]} rotation={[-0.15, 0, 0]}>
        <coneGeometry args={[ht * 0.28, len * 0.55, 7]} />
      </mesh>

      {/* Bipedal Hind Legs */}
      {[-ht * 0.22, ht * 0.22].map((x, i) => (
        <group key={i} position={[x, -ht * 0.5, -len * 0.05]}>
          {/* Upper Thigh */}
          <mesh material={accentMaterial} position={[0, ht * 0.2, 0]} rotation={[-0.2, 0, 0]}>
            <cylinderGeometry args={[ht * 0.14, ht * 0.1, ht * 0.45, 6]} />
          </mesh>
          {/* Lower Shin */}
          <mesh material={accentMaterial} position={[0, -ht * 0.15, len * 0.03]} rotation={[0.2, 0, 0]}>
            <cylinderGeometry args={[ht * 0.08, ht * 0.06, ht * 0.45, 6]} />
          </mesh>
          {/* Foot */}
          <mesh material={material} position={[0, -ht * 0.38, len * 0.08]}>
            <boxGeometry args={[ht * 0.12, 0.06, len * 0.12]} />
          </mesh>
        </group>
      ))}

      {/* Small Forelimb Arms */}
      <mesh material={accentMaterial} position={[-ht * 0.18, 0.05, len * 0.16]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.06, ht * 0.2, 0.06]} />
      </mesh>
      <mesh material={accentMaterial} position={[ht * 0.18, 0.05, len * 0.16]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.06, ht * 0.2, 0.06]} />
      </mesh>
    </group>
  );
}

// Architectural 1.8m Human Silhouette Scale Reference Figure
function HumanScaleFigure({ positionX = 2.5 }: { positionX?: number }) {
  const humanMat = new THREE.MeshStandardMaterial({
    color: '#F8FAFC', // Raw Alabaster
    roughness: 0.25,
    metalness: 0.1,
    flatShading: true
  });

  return (
    <group position={[positionX, 0, 0]}>
      {/* Head */}
      <mesh material={humanMat} position={[0, 1.68, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
      </mesh>
      {/* Torso */}
      <mesh material={humanMat} position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.18, 0.14, 0.75, 6]} />
      </mesh>
      {/* Legs */}
      <mesh material={humanMat} position={[-0.1, 0.4, 0]}>
        <cylinderGeometry args={[0.07, 0.05, 0.8, 6]} />
      </mesh>
      <mesh material={humanMat} position={[0.1, 0.4, 0]}>
        <cylinderGeometry args={[0.07, 0.05, 0.8, 6]} />
      </mesh>
      {/* Label Tag */}
      <Html position={[0, 2.05, 0]} center>
        <div className="bg-slate-950 text-amber-400 font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 border border-amber-500/40 whitespace-nowrap shadow-xl">
          Human Ref (1.8m)
        </div>
      </Html>
    </group>
  );
}

export default function ThreeDScaleViewer({
  speciesName,
  lengthM = 12,
  heightM = 4,
  weightKg,
  clade
}: ThreeDScaleViewerProps) {
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef<any>(null);

  const safeLength = lengthM && lengthM > 0 ? lengthM : 8;
  const safeHeight = heightM && heightM > 0 ? heightM : 3;

  const cameraDistance = Math.max(6, safeLength * 0.75);

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] bg-slate-950 border border-slate-800 rounded-none overflow-hidden group shadow-2xl">
      {/* Museum Exhibit Stage Header */}
      <div className="absolute top-4 left-4 z-10 space-y-1 bg-slate-950/90 backdrop-blur-md p-3 border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-none bg-amber-500 animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-400">
            3D Specimen Pavilion Exhibit
          </span>
        </div>
        <h4 className="text-sm font-black text-slate-100 uppercase tracking-tight font-mono">
          {speciesName} Scale Viewport
        </h4>
        <p className="text-[11px] font-mono text-slate-400">
          Length: <span className="text-amber-400 font-bold">{safeLength}m</span> &bull; Height:{' '}
          <span className="text-amber-400 font-bold">{safeHeight}m</span>
          {weightKg ? ` • Mass: ${(weightKg / 1000).toFixed(1)}t` : ''}
        </p>
      </div>

      {/* Exhibit Viewport Control Actions */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setWireframe(!wireframe)}
          className={`p-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
            wireframe
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Toggle Mesh Shading"
        >
          <Box className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{wireframe ? 'Shaded' : 'Low-Poly Mesh'}</span>
        </button>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
            autoRotate
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Toggle Orbit Rotation"
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{autoRotate ? 'Orbit On' : 'Paused'}</span>
        </button>

        <button
          onClick={handleResetView}
          className="p-2 bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          title="Reset Viewpoint"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 3D Canvas Stage */}
      <Canvas
        camera={{ position: [cameraDistance * 0.75, safeHeight * 0.8 + 1.8, cameraDistance * 0.85], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={['#090D16']} />

        {/* Museum Spotlight & Ambient Lighting */}
        <ambientLight intensity={0.65} />
        <directionalLight position={[10, 15, 10]} intensity={1.3} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#D97706" />

        {/* 3D Procedural Specimen Creature */}
        <LowPolyCreature
          lengthM={safeLength}
          heightM={safeHeight}
          clade={clade || undefined}
          wireframe={wireframe}
        />

        {/* 1.8m Architectural Human Figure */}
        <HumanScaleFigure positionX={Math.max(2.2, safeLength * 0.25 + 1.5)} />

        {/* Ground Floor Grid */}
        <Grid
          args={[40, 40]}
          cellSize={1}
          cellThickness={1}
          cellColor="#334155"
          sectionSize={5}
          sectionThickness={1.5}
          sectionColor="#D97706"
          fadeDistance={30}
          fadeStrength={1.5}
        />

        {/* Spring Damped Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          autoRotate={autoRotate}
          autoRotateSpeed={1.2}
          maxPolarAngle={Math.PI / 2 + 0.05}
          minDistance={3}
          maxDistance={35}
        />
      </Canvas>

      {/* Bottom Architectural Caption Overlay */}
      <div className="absolute bottom-3 left-4 right-4 z-10 flex justify-between items-center text-[10px] font-mono text-slate-500 border-t border-slate-800/80 pt-2">
        <span>INTERACTIVE 3D STAGE &bull; DRAG TO ORBIT / ROTATE</span>
        <span className="text-amber-500/80 font-bold uppercase tracking-wider">
          PREHISTORICA EXHIBIT PAVILION
        </span>
      </div>
    </div>
  );
}
