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

// Low-poly procedural creature model built with Three.js primitives
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
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  const material = new THREE.MeshStandardMaterial({
    color: '#D97706', // Warm amber museum specimen tone
    roughness: 0.45,
    metalness: 0.2,
    wireframe: wireframe,
    flatShading: true
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: '#B45309', // Terracotta/Rust accent
    roughness: 0.5,
    flatShading: true
  });

  const normClade = (clade || '').toLowerCase();
  const isSauropod = normClade.includes('sauropod');
  const isPterosaur = normClade.includes('pterosaur');

  // Scale parameters (base human scale = 1.8m height)
  const bodyLen = Math.max(1.5, lengthM * 0.5);
  const bodyHt = Math.max(0.8, heightM * 0.6);

  if (isSauropod) {
    return (
      <group ref={groupRef} position={[0, bodyHt * 0.5, 0]}>
        {/* Main Barrel Body */}
        <mesh material={material} position={[0, 0, 0]}>
          <cylinderGeometry args={[bodyHt * 0.5, bodyHt * 0.6, bodyLen * 0.4, 8]} />
        </mesh>
        {/* Long Neck & Head */}
        <mesh material={material} position={[0, bodyHt * 0.8, bodyLen * 0.35]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[bodyHt * 0.2, bodyHt * 0.35, bodyHt * 1.4, 7]} />
        </mesh>
        <mesh material={accentMaterial} position={[0, bodyHt * 1.4, bodyLen * 0.5]}>
          <boxGeometry args={[bodyHt * 0.3, bodyHt * 0.25, bodyHt * 0.4]} />
        </mesh>
        {/* Whip Tail */}
        <mesh material={material} position={[0, bodyHt * 0.1, -bodyLen * 0.4]} rotation={[-0.2, 0, 0]}>
          <coneGeometry args={[bodyHt * 0.3, bodyLen * 0.6, 7]} />
        </mesh>
        {/* 4 Pillars Legs */}
        {[-0.4, 0.4].map((x, i) => (
          <React.Fragment key={i}>
            <mesh material={accentMaterial} position={[x * bodyHt, -bodyHt * 0.5, bodyLen * 0.15]}>
              <cylinderGeometry args={[bodyHt * 0.15, bodyHt * 0.18, bodyHt, 6]} />
            </mesh>
            <mesh material={accentMaterial} position={[x * bodyHt, -bodyHt * 0.5, -bodyLen * 0.15]}>
              <cylinderGeometry args={[bodyHt * 0.15, bodyHt * 0.18, bodyHt, 6]} />
            </mesh>
          </React.Fragment>
        ))}
      </group>
    );
  }

  if (isPterosaur) {
    return (
      <group ref={groupRef} position={[0, heightM * 0.8, 0]}>
        {/* Torso & Head */}
        <mesh material={material} position={[0, 0, 0]}>
          <coneGeometry args={[0.3, 1.2, 6]} />
        </mesh>
        <mesh material={accentMaterial} position={[0, 0.4, 0.4]} rotation={[0.5, 0, 0]}>
          <coneGeometry args={[0.15, 0.9, 5]} />
        </mesh>
        {/* Expanded Wings */}
        <mesh material={material} position={[-bodyLen * 0.4, 0, 0]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[bodyLen * 0.8, 0.04, 0.8]} />
        </mesh>
        <mesh material={material} position={[bodyLen * 0.4, 0, 0]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[bodyLen * 0.8, 0.04, 0.8]} />
        </mesh>
      </group>
    );
  }

  // Default Theropod (T-rex, Spinosaurus, etc.)
  return (
    <group ref={groupRef} position={[0, bodyHt * 0.7, 0]}>
      {/* Torso */}
      <mesh material={material} position={[0, 0, 0]} rotation={[0, 0, 0.1]}>
        <coneGeometry args={[bodyHt * 0.45, bodyLen * 0.45, 8]} />
      </mesh>
      {/* Head & Jaws */}
      <mesh material={material} position={[0, bodyHt * 0.45, bodyLen * 0.28]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[bodyHt * 0.35, bodyHt * 0.35, bodyLen * 0.3]} />
      </mesh>
      {/* Snout */}
      <mesh material={accentMaterial} position={[0, bodyHt * 0.4, bodyLen * 0.45]}>
        <boxGeometry args={[bodyHt * 0.25, bodyHt * 0.2, bodyLen * 0.2]} />
      </mesh>
      {/* Tail */}
      <mesh material={material} position={[0, bodyHt * 0.1, -bodyLen * 0.38]} rotation={[-0.15, 0, 0]}>
        <coneGeometry args={[bodyHt * 0.35, bodyLen * 0.55, 7]} />
      </mesh>
      {/* Bipedal Hind Legs */}
      <mesh material={accentMaterial} position={[-bodyHt * 0.25, -bodyHt * 0.5, 0]}>
        <cylinderGeometry args={[bodyHt * 0.12, bodyHt * 0.08, bodyHt * 0.9, 6]} />
      </mesh>
      <mesh material={accentMaterial} position={[bodyHt * 0.25, -bodyHt * 0.5, 0]}>
        <cylinderGeometry args={[bodyHt * 0.12, bodyHt * 0.08, bodyHt * 0.9, 6]} />
      </mesh>
      {/* Small Arms */}
      <mesh material={material} position={[-bodyHt * 0.22, 0.1, bodyLen * 0.18]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
      </mesh>
      <mesh material={material} position={[bodyHt * 0.22, 0.1, bodyLen * 0.18]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
      </mesh>
    </group>
  );
}

// Architectural 1.8m Human Silhouette Scale Reference Figure
function HumanScaleFigure() {
  const humanMat = new THREE.MeshStandardMaterial({
    color: '#F8FAFC', // Raw Alabaster
    roughness: 0.2,
    metalness: 0.1,
    flatShading: true
  });

  return (
    <group position={[2.5, 0, 0]}>
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
      <Html position={[0, 2.0, 0]} center>
        <div className="bg-slate-900/90 text-amber-400 font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-none border border-amber-500/30 whitespace-nowrap shadow-lg">
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

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] bg-slate-950 border border-slate-800 rounded-none overflow-hidden group shadow-2xl">
      {/* Museum Exhibit Stage Header */}
      <div className="absolute top-4 left-4 z-10 space-y-1 bg-slate-900/80 backdrop-blur-md p-3 border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-none bg-amber-500 animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-400">
            3D Specimen Pavilion Exhibit
          </span>
        </div>
        <h4 className="text-sm font-extrabold text-slate-100 uppercase tracking-tight">
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
          className={`p-2 text-xs font-mono font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
            wireframe
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Toggle Mesh Shading"
        >
          <Box className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{wireframe ? 'Shaded' : 'Low-Poly Mesh'}</span>
        </button>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 text-xs font-mono font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
            autoRotate
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Toggle Orbit Rotation"
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{autoRotate ? 'Orbit On' : 'Paused'}</span>
        </button>

        <button
          onClick={handleResetView}
          className="p-2 bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          title="Reset Viewpoint"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 3D Canvas Stage */}
      <Canvas
        camera={{ position: [6, 4, 8], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={['#090D16']} />

        {/* Museum Spotlight & Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#D97706" />

        {/* 3D Procedural Specimen Creature */}
        <LowPolyCreature
          lengthM={safeLength}
          heightM={safeHeight}
          clade={clade || undefined}
          wireframe={wireframe}
        />

        {/* 1.8m Architectural Human Figure */}
        <HumanScaleFigure />

        {/* Ground Floor Grid */}
        <Grid
          args={[30, 30]}
          cellSize={1}
          cellThickness={1}
          cellColor="#334155"
          sectionSize={5}
          sectionThickness={1.5}
          sectionColor="#D97706"
          fadeDistance={25}
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
          maxDistance={25}
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
