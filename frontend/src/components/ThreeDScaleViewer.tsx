import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCcw, Box, Eye } from 'lucide-react';
import { formatMass } from '../utils/formatMass.js';

interface ThreeDScaleViewerProps {
  speciesName: string;
  lengthM?: number | null;
  heightM?: number | null;
  weightKg?: number | null;
  clade?: string | null;
  imageUrl?: string | null;
}

// Extruded 3D Silhouette Specimen Mesh using species' 2D life reconstruction artwork
function CutoutSpecimen({
  imageUrl,
  lengthM = 8,
  heightM = 3,
  wireframe = false
}: {
  imageUrl?: string | null;
  lengthM: number;
  heightM: number;
  wireframe: boolean;
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
        setTexture(tex);
        setLoadFailed(false);
      },
      undefined,
      () => {
        setLoadFailed(true);
      }
    );
  }, [imageUrl]);

  // Gentle idling breathing motion
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = heightM / 2 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
    }
  });

  // Calculate slight 3D depth (thickness proportional to size)
  const depth = Math.max(0.08, Math.min(0.25, lengthM * 0.02));

  return (
    <group ref={groupRef} position={[0, heightM / 2, 0]}>
      {/* 3D Extruded Backing Panel & Specimen Frame */}
      <mesh position={[0, 0, -depth / 2]}>
        <boxGeometry args={[lengthM + 0.06, heightM + 0.06, depth]} />
        <meshStandardMaterial
          color="#B45309"
          roughness={0.45}
          metalness={0.3}
          wireframe={wireframe}
          flatShading
        />
      </mesh>

      {/* Front Life Reconstruction Artwork Plane */}
      {texture && !loadFailed ? (
        <mesh position={[0, 0, depth / 2 + 0.005]}>
          <planeGeometry args={[lengthM, heightM]} />
          <meshStandardMaterial
            map={texture}
            transparent={true}
            alphaTest={0.05}
            side={THREE.DoubleSide}
            roughness={0.35}
            metalness={0.1}
            wireframe={wireframe}
          />
        </mesh>
      ) : (
        /* Fallback Amber Specimen Silhouette Plane */
        <mesh position={[0, 0, depth / 2 + 0.005]}>
          <planeGeometry args={[lengthM, heightM]} />
          <meshStandardMaterial
            color="#D97706"
            roughness={0.3}
            metalness={0.2}
            side={THREE.DoubleSide}
            wireframe={wireframe}
          />
        </mesh>
      )}
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
  imageUrl
}: ThreeDScaleViewerProps) {
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef<any>(null);

  const safeLength = lengthM && lengthM > 0 ? lengthM : 8;
  const safeHeight = heightM && heightM > 0 ? heightM : 3;

  const cameraDistance = Math.max(5.5, safeLength * 0.75);

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-[360px] sm:h-[480px] bg-slate-950 border border-slate-800 rounded-none overflow-hidden group shadow-2xl touch-none">
      {/* Museum Exhibit Stage Header */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto z-10 flex flex-wrap items-start justify-between sm:justify-start gap-2 max-w-full pointer-events-none">
        <div className="space-y-0.5 bg-slate-950/90 backdrop-blur-md p-2.5 sm:p-3 border border-slate-800 pointer-events-auto max-w-[65%] sm:max-w-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-none bg-amber-500 animate-pulse shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest uppercase text-amber-400 truncate">
              3D Specimen Pavilion
            </span>
          </div>
          <h4 className="text-xs sm:text-sm font-black text-slate-100 uppercase tracking-tight font-mono truncate">
            {speciesName}
          </h4>
          <p className="text-[10px] sm:text-[11px] font-mono text-slate-400">
            L: <span className="text-amber-400 font-bold">{safeLength}m</span> &bull; H:{' '}
            <span className="text-amber-400 font-bold">{safeHeight}m</span>
            {weightKg ? ` • ${formatMass(weightKg)}` : ''}
          </p>
        </div>

        {/* Exhibit Viewport Control Actions */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`p-1.5 sm:p-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
              wireframe
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Toggle Bounding Frame Shading"
          >
            <Box className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{wireframe ? 'Solid' : 'Bounding Frame'}</span>
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 sm:p-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
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
            className="p-1.5 sm:p-2 bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reset Viewpoint"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Stage */}
      <Canvas
        camera={{ position: [cameraDistance * 0.75, safeHeight * 0.8 + 1.8, cameraDistance * 0.85], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      >
        <color attach="background" args={['#090D16']} />

        {/* Museum Spotlight & Ambient Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 15, 10]} intensity={1.3} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#D97706" />

        {/* 3D Extruded Silhouette Specimen */}
        <CutoutSpecimen
          imageUrl={imageUrl}
          lengthM={safeLength}
          heightM={safeHeight}
          wireframe={wireframe}
        />

        {/* 1.8m Architectural Human Figure */}
        <HumanScaleFigure positionX={Math.max(2.2, safeLength * 0.55 + 1.2)} />

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
