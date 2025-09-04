
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { GaussianSplattingData } from '@/types';

interface GaussianSplattingViewerProps {
  data?: GaussianSplattingData;
  className?: string;
}

// Simple point cloud representation when no actual Gaussian data is available
const MockPointCloud = ({ data }: { data?: GaussianSplattingData }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const pointsCount = data?.pointCloud?.points || 1000;
  const [positions] = useState(() => {
    const positions = new Float32Array(pointsCount * 3);
    const spread = 0.5;
    
    // Create a rough shape of a pothole (concave surface)
    for (let i = 0; i < pointsCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = Math.random() * spread;
      const depth = Math.random() * 0.2;
      
      // Circular pattern with depression in center
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      const y = -depth * (1 - radius/spread);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    
    return positions;
  });

  const [colors] = useState(() => {
    const colors = new Float32Array(pointsCount * 3);
    const baseColor = new THREE.Color(0x555555);
    
    for (let i = 0; i < pointsCount; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      
      // Distance from center affects color
      const distance = Math.sqrt(x*x + z*z);
      const depth = -y;
      
      // Deeper areas are darker
      const shade = 0.5 + 0.5 * (1 - depth * 5);
      const color = baseColor.clone().multiplyScalar(shade);
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    return colors;
  });

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.01} 
        vertexColors 
        sizeAttenuation 
      />
    </points>
  );
};

// Measurement helpers
const MeasurementHelpers = ({ data }: { data?: GaussianSplattingData }) => {
  const width = data?.surface?.width ? data.surface.width / 100 : 0.8;
  const depth = data?.surface?.depth ? data.surface.depth / 100 : 0.2;
  const boxRef = useRef<THREE.Mesh>(null);
  
  // Create position arrays for the lines
  const widthLinePositions = new Float32Array([-width/2, 0, 0, width/2, 0, 0]);
  const depthLinePositions = new Float32Array([0, 0, 0, 0, -depth, 0]);
  
  return (
    <>
      <mesh 
        ref={boxRef} 
        scale={[width, depth, width]} 
        position={[0, -depth/2, 0]}
        visible={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial wireframe />
      </mesh>
      
      {/* Width measurement line (red) */}
      <group>
        <mesh position={[0, 0, 0]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={widthLinePositions}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="red" />
        </mesh>
      </group>
      
      {/* Depth measurement line (green) */}
      <group>
        <mesh position={[0, 0, 0]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={depthLinePositions}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="green" />
        </mesh>
      </group>
    </>
  );
};

// Main scene setup
const Scene = ({ data }: { data?: GaussianSplattingData }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <gridHelper args={[2, 10]} position={[0, 0, 0]} />
      <MockPointCloud data={data} />
      <MeasurementHelpers data={data} />
      <OrbitControls 
        enableDamping 
        dampingFactor={0.25} 
        rotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
};

export const GaussianSplattingViewer: React.FC<GaussianSplattingViewerProps> = ({ 
  data,
  className = "h-60 w-full rounded-md overflow-hidden border border-gray-200"
}) => {
  return (
    <div className={className}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0.5, 1.5]} />
        <Scene data={data} />
      </Canvas>
      
      {/* Measurement Legend */}
      <div className="absolute bottom-2 left-2 bg-white/80 p-2 rounded text-xs space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500"></div>
          <span>Width: {data?.surface?.width || '-'} cm</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500"></div>
          <span>Depth: {data?.surface?.depth || '-'} cm</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500"></div>
          <span>Area: {data?.surface?.area || '-'} m²</span>
        </div>
      </div>
    </div>
  );
};

export default GaussianSplattingViewer;
