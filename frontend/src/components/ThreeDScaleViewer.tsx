import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCcw, Box, Eye, User, Car, Bus, Layers } from 'lucide-react';
import { formatMass } from '../utils/formatMass.js';

interface ThreeDScaleViewerProps {
  speciesName: string;
  lengthM?: number | null;
  heightM?: number | null;
  weightKg?: number | null;
  clade?: string | null;
  imageUrl?: string | null;
}

type ReferenceType = 'human' | 'car' | 'bus' | 'elephant';

// Specimen Silhouette Mesh with alpha transparency and subtle floating breathing physics
function CutoutSpecimen({
  imageUrl,
  lengthM = 8,
  heightM = 3,
  showWireframe = false
}: {
  imageUrl?: string | null;
  lengthM: number;
  heightM: number;
  showWireframe: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setLoadFailed(true);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      imageUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        setTexture(tex);
        setLoadFailed(false);
      },
      undefined,
      () => {
        setLoadFailed(true);
      }
    );
  }, [imageUrl]);

  // Gentle museum exhibit idling float
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = heightM / 2 + Math.sin(state.clock.elapsedTime * 1.2) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[0, heightM / 2, 0]}>
      {/* Front Transparent Reconstruction Artwork Plane */}
      {texture && !loadFailed ? (
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[lengthM, heightM]} />
          <meshStandardMaterial
            map={texture}
            transparent={true}
            alphaTest={0.05}
            side={THREE.DoubleSide}
            roughness={0.4}
            metalness={0.05}
            wireframe={showWireframe}
          />
        </mesh>
      ) : (
        /* Curatorial Monochromatic Specimen Silhouette Plane */
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[lengthM, heightM]} />
          <meshStandardMaterial
            color="#D97706"
            roughness={0.3}
            metalness={0.2}
            side={THREE.DoubleSide}
            wireframe={showWireframe}
          />
        </mesh>
      )}

      {/* Subtle Laser-Cut Acrylic Dimension Box Wireframe */}
      {showWireframe && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[lengthM, heightM, 0.2]} />
          <meshBasicMaterial color="#FBBF24" wireframe />
        </mesh>
      )}

      {/* Architectural Dimension Caliper: Length along top */}
      <Html position={[0, heightM / 2 + 0.3, 0]} center>
        <div className="bg-slate-950/90 text-slate-200 border border-white/10 font-mono text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 whitespace-nowrap shadow-lg flex items-center gap-1">
          <span className="text-amber-400">&bull;</span> Length: {lengthM}m
        </div>
      </Html>

      {/* Architectural Dimension Caliper: Height along left */}
      <Html position={[-lengthM / 2 - 0.4, 0, 0]} center>
        <div className="bg-slate-950/90 text-slate-200 border border-white/10 font-mono text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 whitespace-nowrap shadow-lg flex items-center gap-1">
          <span className="text-amber-400">&bull;</span> Height: {heightM}m
        </div>
      </Html>
    </group>
  );
}

// Architectural Scale Comparison Models
function ScaleReferenceModel({
  type,
  positionX = 2.5
}: {
  type: ReferenceType;
  positionX: number;
}) {
  const modelMat = new THREE.MeshStandardMaterial({
    color: '#CBD5E1', // Architectural Matte Chalk
    roughness: 0.3,
    metalness: 0.15,
    flatShading: true
  });

  if (type === 'car') {
    // 4.5m Length x 1.6m Height Modern Vehicle
    return (
      <group position={[positionX, 0, 0]}>
        {/* Main Body */}
        <mesh material={modelMat} position={[0, 0.5, 0]}>
          <boxGeometry args={[4.2, 0.7, 1.8]} />
        </mesh>
        {/* Cabin */}
        <mesh material={modelMat} position={[-0.2, 1.05, 0]}>
          <boxGeometry args={[2.2, 0.6, 1.6]} />
        </mesh>
        {/* Wheels */}
        <mesh position={[-1.3, 0.3, 0.95]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 12]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[1.3, 0.3, 0.95]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 12]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[-1.3, 0.3, -0.95]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 12]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[1.3, 0.3, -0.95]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 12]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <Html position={[0, 1.7, 0]} center>
          <div className="bg-slate-950 text-slate-300 font-mono text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 border border-white/10 whitespace-nowrap shadow-xl">
            Vehicle (4.5m)
          </div>
        </Html>
      </group>
    );
  }

  if (type === 'bus') {
    // 11.5m Length x 3.0m Height School Bus
    return (
      <group position={[positionX, 0, 0]}>
        <mesh material={modelMat} position={[0, 1.6, 0]}>
          <boxGeometry args={[11.5, 2.8, 2.5]} />
        </mesh>
        <Html position={[0, 3.4, 0]} center>
          <div className="bg-slate-950 text-slate-300 font-mono text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 border border-white/10 whitespace-nowrap shadow-xl">
            Transit Bus (11.5m)
          </div>
        </Html>
      </group>
    );
  }

  if (type === 'elephant') {
    // 6.0m Length x 3.3m Height African Elephant
    return (
      <group position={[positionX, 0, 0]}>
        {/* Torso */}
        <mesh material={modelMat} position={[0, 2.0, 0]}>
          <boxGeometry args={[3.6, 2.2, 2.0]} />
        </mesh>
        {/* Head */}
        <mesh material={modelMat} position={[-2.2, 2.4, 0]}>
          <sphereGeometry args={[1.0, 8, 8]} />
        </mesh>
        {/* Trunk */}
        <mesh material={modelMat} position={[-2.9, 1.2, 0]}>
          <cylinderGeometry args={[0.2, 0.15, 1.6, 6]} />
        </mesh>
        <Html position={[0, 3.5, 0]} center>
          <div className="bg-slate-950 text-slate-300 font-mono text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 border border-white/10 whitespace-nowrap shadow-xl">
            African Elephant (3.3m)
          </div>
        </Html>
      </group>
    );
  }

  // Default: Architectural Human Figure (1.8m)
  return (
    <group position={[positionX, 0, 0]}>
      {/* Head */}
      <mesh material={modelMat} position={[0, 1.68, 0]}>
        <sphereGeometry args={[0.11, 10, 10]} />
      </mesh>
      {/* Torso */}
      <mesh material={modelMat} position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.16, 0.13, 0.72, 8]} />
      </mesh>
      {/* Legs */}
      <mesh material={modelMat} position={[-0.09, 0.4, 0]}>
        <cylinderGeometry args={[0.06, 0.05, 0.8, 8]} />
      </mesh>
      <mesh material={modelMat} position={[0.09, 0.4, 0]}>
        <cylinderGeometry args={[0.06, 0.05, 0.8, 8]} />
      </mesh>
      <Html position={[0, 2.05, 0]} center>
        <div className="bg-slate-950 text-slate-300 font-mono text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 border border-white/10 whitespace-nowrap shadow-xl">
          Human (1.8m)
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
  imageUrl
}: ThreeDScaleViewerProps) {
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [refType, setRefType] = useState<ReferenceType>('human');
  const controlsRef = useRef<any>(null);

  const safeLength = lengthM && lengthM > 0 ? lengthM : 8;
  const safeHeight = heightM && heightM > 0 ? heightM : 3;

  // Responsive adaptive camera framing: keeps both small and large specimens balanced
  const maxDim = Math.max(safeLength, safeHeight * 1.8);
  const cameraDistance = Math.max(4.5, maxDim * 0.85);

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  // Position reference model proportional to creature length
  const refPositionX = Math.max(2.0, safeLength * 0.55 + 1.2);

  return (
    <div className="relative w-full h-[380px] sm:h-[480px] bg-[#080C16] border border-white/[0.08] rounded-xl overflow-hidden group shadow-2xl touch-none">
      {/* Museum Exhibit Stage Header Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-start justify-between gap-2 pointer-events-none">
        <div className="space-y-1 bg-slate-950/90 backdrop-blur-md p-3 border border-white/[0.08] rounded-lg pointer-events-auto max-w-full sm:max-w-xs shadow-xl">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-400">
              3D Scale Pavilion
            </span>
          </div>
          <h4 className="text-xs sm:text-sm font-black text-slate-100 uppercase tracking-tight font-mono truncate">
            {speciesName}
          </h4>
          <p className="text-[11px] font-mono text-slate-400">
            L: <span className="text-amber-400 font-bold">{safeLength}m</span> &bull; H:{' '}
            <span className="text-amber-400 font-bold">{safeHeight}m</span>
            {weightKg ? ` • ${formatMass(weightKg)}` : ''}
          </p>
        </div>

        {/* Reference Model Switcher & Control Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
          {/* Reference Selector */}
          <div className="flex items-center bg-slate-950/90 backdrop-blur-md border border-white/[0.08] rounded-lg p-1 gap-1">
            <button
              onClick={() => setRefType('human')}
              className={`p-1.5 text-xs font-mono font-bold rounded flex items-center gap-1 transition-all cursor-pointer ${
                refType === 'human'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Compare with Human (1.8m)"
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden md:inline text-[10px]">1.8m</span>
            </button>
            <button
              onClick={() => setRefType('car')}
              className={`p-1.5 text-xs font-mono font-bold rounded flex items-center gap-1 transition-all cursor-pointer ${
                refType === 'car'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Compare with Vehicle (4.5m)"
            >
              <Car className="h-3.5 w-3.5" />
              <span className="hidden md:inline text-[10px]">Car</span>
            </button>
            <button
              onClick={() => setRefType('bus')}
              className={`p-1.5 text-xs font-mono font-bold rounded flex items-center gap-1 transition-all cursor-pointer ${
                refType === 'bus'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Compare with Bus (11.5m)"
            >
              <Bus className="h-3.5 w-3.5" />
              <span className="hidden md:inline text-[10px]">Bus</span>
            </button>
            <button
              onClick={() => setRefType('elephant')}
              className={`p-1.5 text-xs font-mono font-bold rounded flex items-center gap-1 transition-all cursor-pointer ${
                refType === 'elephant'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Compare with Elephant (3.3m)"
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden md:inline text-[10px]">Elephant</span>
            </button>
          </div>

          {/* Caliper Bounding Box Toggle */}
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`p-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              wireframe
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-950/90 border-white/[0.08] text-slate-300 hover:text-white'
            }`}
            title="Toggle Bounding Dimensions"
          >
            <Box className="h-3.5 w-3.5" />
          </button>

          {/* Orbit Rotation Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              autoRotate
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-950/90 border-white/[0.08] text-slate-300 hover:text-white'
            }`}
            title="Toggle Orbit Rotation"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          {/* Reset View Button */}
          <button
            onClick={handleResetView}
            className="p-2 rounded-lg bg-slate-950/90 border border-white/[0.08] text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reset Viewpoint"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Stage */}
      <Canvas
        camera={{ position: [cameraDistance * 0.7, safeHeight * 0.75 + 1.5, cameraDistance * 0.8], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      >
        <color attach="background" args={['#080C16']} />

        {/* Curatorial Studio Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 16, 12]} intensity={1.5} />
        <directionalLight position={[-10, 10, -10]} intensity={0.5} color="#94A3B8" />
        <pointLight position={[0, -2, 0]} intensity={0.3} color="#D97706" />

        {/* Alpha Cutout Specimen Silhouette */}
        <CutoutSpecimen
          imageUrl={imageUrl}
          lengthM={safeLength}
          heightM={safeHeight}
          showWireframe={wireframe}
        />

        {/* Scale Reference Model */}
        <ScaleReferenceModel
          type={refType}
          positionX={refPositionX}
        />

        {/* Refined Museum Floor Grid */}
        <Grid
          args={[40, 40]}
          cellSize={1}
          cellThickness={0.8}
          cellColor="#1E293B"
          sectionSize={5}
          sectionThickness={1.2}
          sectionColor="#334155"
          fadeDistance={28}
          fadeStrength={1.5}
        />

        {/* Spring Damped Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          autoRotate={autoRotate}
          autoRotateSpeed={1.0}
          maxPolarAngle={Math.PI / 2 + 0.02}
          minDistance={2.5}
          maxDistance={40}
        />
      </Canvas>

      {/* Bottom Architectural Caption Overlay */}
      <div className="absolute bottom-2.5 left-4 right-4 z-10 flex justify-between items-center text-[10px] font-mono text-slate-500 border-t border-white/[0.06] pt-1.5">
        <span>INTERACTIVE 3D SCALE STAGE &bull; DRAG TO ORBIT</span>
        <span className="text-amber-500/90 font-bold uppercase tracking-wider">
          RENDERED AT 1:1 PHYSICAL SCALE
        </span>
      </div>
    </div>
  );
}

