// src/components/InteractiveNotebook.jsx
import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, useAnimations } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const AnimatedBookModel = () => {
  const group = useRef();
  // We assume the file is named magic_book.glb in the /public folder
  const { scene, animations } = useGLTF('/magic_book.glb');
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    const animationName = Object.keys(actions)[0];
    if (animationName) {
      const clipAction = actions[animationName];
      clipAction.reset().play();
    }

    // --- FINAL FIX 1: Using a much smaller scale for this large model ---
    scene.scale.set(0.02, 0.02, 0.02);

    // --- FINAL FIX 2: Centering the model vertically ---
    scene.position.set(0, -0.8, 0);

  }, [actions, scene]);

  return <primitive object={scene} ref={group} />;
};

const InteractiveNotebook = () => {
  return (
    <Canvas
      // Camera is already pulled back, which is good.
      camera={{ position: [0, 0, 8], fov: 45 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight color="cyan" position={[2, 2, 2]} intensity={0.8} />
      <pointLight color="white" position={[-3, -2, 2]} intensity={0.5} />

      <Suspense fallback={null}>
        <AnimatedBookModel />
        <Environment preset="night" />
        <EffectComposer>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            height={400}
          />
        </EffectComposer>
      </Suspense>

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.5}
        enableZoom={false}
        maxPolarAngle={Math.PI / 1.9}
        minPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
};

export default InteractiveNotebook;