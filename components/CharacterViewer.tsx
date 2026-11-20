// useEffect runs setup/cleanup code, useMemo caches calculations, useRef stores values without re-rendering,
// and Suspense shows a fallback while the model file is still loading.
import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from 'react';
// PanResponder tracks finger/mouse drags, Platform tells web from phones, and the rest build the layout.
import { PanResponder, Platform, StyleSheet, View } from 'react-native';
// Asset turns a bundled file into a web address the browser can download.
import { Asset } from 'expo-asset';
// The three.js engine: math helpers, bounding boxes, and the animation player.
import * as THREE from 'three';
// The official three.js loader that reads .glb/.gltf model files.
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// The 3D drawing area and hooks; Expo loads the web or phone version of this file automatically.
import { Canvas, useFrame, useLoader } from './ThreeCanvas';

// The bundled fish model; require() asks Metro (thanks to metro.config.js) to include the file in the app.
const FISH_MODEL = require('../assets/models/hamburger.glb');
// Web needs a real address to download from; phones can take the bundled file directly.
// (The cast tells TypeScript to treat the phone version as a string; R3F's phone setup handles it.)
const MODEL_SOURCE: string = Platform.OS === 'web' ? Asset.fromModule(FISH_MODEL).uri : FISH_MODEL;
// Name of the animation to loop while the fish sits in the viewer.
const IDLE_ANIMATION = 'Swimming_Normal';
// How big the model is made, in 3D units, along its longest side.
const MODEL_SIZE = 2;
// How far the model turns per pixel dragged (radians); higher spins faster.
const ROTATE_SPEED = 0.01;
// The furthest the model can tip forward or back (radians, about 30 degrees), so it never flips upside down.
const MAX_TILT = 0.5;

// The current rotation shared between the drag handler and the 3D scene.
type Rotation = { x: number; y: number };

// The full viewer: a 3D drawing area with an invisible drag layer on top.
export default function CharacterViewer() {
  // Holds the model's current rotation; a ref so dragging doesn't re-render React every frame.
  const rotation = useRef<Rotation>({ x: 0, y: 0 });
  // Remembers the rotation at the moment a drag starts, so each drag continues from where the last one ended.
  const dragStart = useRef<Rotation>({ x: 0, y: 0 });

  // Builds the drag handler once (useMemo) instead of on every render.
  const panResponder = useMemo(
    // Creates the handler that listens to touches (phones) and mouse drags (web).
    () =>
      PanResponder.create({
        // Claims the touch as soon as it starts, so the viewer responds right away.
        onStartShouldSetPanResponder: () => true,
        // Also claims a touch that starts moving over the viewer.
        onMoveShouldSetPanResponder: () => true,
        // Refuses to hand the drag to the phone's scroll view, so spinning the fish doesn't scroll the page.
        onPanResponderTerminationRequest: () => false,
        // When a drag begins, saves the current rotation as the starting point.
        onPanResponderGrant: () => {
          // Copies the values (not the object), so later changes don't affect the saved start.
          dragStart.current = { ...rotation.current };
        },
        // While dragging, turns the model based on how far the finger/mouse has moved.
        onPanResponderMove: (_event, gesture) => {
          // Left/right drag spins the model around its vertical axis.
          rotation.current.y = dragStart.current.y + gesture.dx * ROTATE_SPEED;
          // Up/down drag tips the model, clamped between -MAX_TILT and MAX_TILT.
          rotation.current.x = THREE.MathUtils.clamp(
            // The tilt the drag asks for.
            dragStart.current.x + gesture.dy * ROTATE_SPEED,
            // The lowest tilt allowed.
            -MAX_TILT,
            // The highest tilt allowed.
            MAX_TILT,
          );
        },
      }),
    // Empty list: build the handler only once.
    [],
  );

  // Returns the viewer.
  return (
    // Fills the avatar area; the drag layer is placed on top of the canvas inside it.
    <View style={styles.container}>
      {/* The 3D drawing area; the camera sits 4 units in front of the model with a 40-degree view. */}
      <Canvas camera={{ position: [0, 0, 4], fov: 40 }}>
        {/* Soft light from every direction, so no side is fully black. */}
        <ambientLight intensity={1.2} />
        {/* A brighter light from the upper front right, for shading and depth. */}
        <directionalLight position={[3, 4, 5]} intensity={2} />
        {/* Shows nothing while the model downloads, then shows the model. */}
        <Suspense fallback={null}>
          {/* The fish itself, which reads the shared rotation every frame. */}
          <CharacterModel rotation={rotation} />
        </Suspense>
      </Canvas>
      {/* An invisible layer over the canvas that catches drags, so the canvas's own touch handling can't steal them. */}
      <View style={styles.dragLayer} {...panResponder.panHandlers} />
    </View>
  );
}

// Describes the values CharacterModel needs.
type CharacterModelProps = {
  // The shared rotation that the drag layer updates.
  rotation: MutableRefObject<Rotation>;
};

// Loads the model, sizes and centers it, plays its idle animation, and applies the drag rotation.
function CharacterModel({ rotation }: CharacterModelProps) {
  // Loads the .glb file; Suspense in the parent waits while this is in progress.
  const gltf = useLoader(GLTFLoader, MODEL_SOURCE);
  // Points at the group that wraps the model, so its rotation can be changed every frame.
  const spinGroup = useRef<THREE.Group>(null);

  // Works out the scale and offset once per loaded model, so any model size fits the view.
  const fit = useMemo(() => {
    // Makes sure every part's world position is up to date before measuring.
    gltf.scene.updateMatrixWorld(true);
    // Measures the box around the model; "true" checks every vertex, which is accurate for rigged models.
    const box = new THREE.Box3().setFromObject(gltf.scene, true);
    // Gets the box's width, height, and depth.
    const size = box.getSize(new THREE.Vector3());
    // Gets the box's middle point.
    const center = box.getCenter(new THREE.Vector3());
    // Scale that makes the longest side MODEL_SIZE units (|| 1 avoids dividing by zero on an empty model).
    const scale = MODEL_SIZE / (Math.max(size.x, size.y, size.z) || 1);
    // Moves the scaled model so its middle lands on the spin point (0, 0, 0).
    const offset = center.multiplyScalar(-scale);
    // Hands back both values for the JSX below.
    return { scale, offset };
    // Recalculates only if a different model is loaded.
  }, [gltf]);

  // Makes every surface draw on both sides, fixing thin parts (like the tail fin) vanishing when seen from behind.
  useEffect(() => {
    // Visits every part of the model (body, fins, eyes, bones, and so on).
    gltf.scene.traverse((part) => {
      // Skips parts that aren't visible meshes, since only meshes have materials.
      if (!(part instanceof THREE.Mesh)) return;
      // A mesh can have one material or a list of them; this turns both cases into a list.
      const materials: THREE.Material[] = Array.isArray(part.material) ? part.material : [part.material];
      // Goes through each material on this mesh.
      materials.forEach((material) => {
        // Draws the back face too, instead of skipping it (three.js skips back faces by default).
        material.side = THREE.DoubleSide;
        // Tells three.js the material changed so it rebuilds its drawing settings.
        material.needsUpdate = true;
      });
    });
    // Re-runs only if a different model is loaded.
  }, [gltf]);

  // Creates the animation player for this model once.
  const mixer = useMemo(() => new THREE.AnimationMixer(gltf.scene), [gltf]);

  // Starts the idle animation when the model appears and stops it when the viewer closes.
  useEffect(() => {
    // Finds the idle clip by name, falling back to the first clip if the name isn't there.
    const clip =
      // Looks for a clip whose name contains "Swimming_Normal" (the file calls it "Fish_Armature|Swimming_Normal").
      gltf.animations.find((animation) => animation.name.includes(IDLE_ANIMATION)) ??
      // Otherwise uses the first animation in the file, if there is one.
      gltf.animations[0];
    // Plays the clip on a loop, if one was found.
    if (clip) mixer.clipAction(clip).play();
    // Cleanup: stops every animation when the viewer is removed from the screen.
    return () => {
      // Halts all playing clips on this model.
      mixer.stopAllAction();
    };
    // Re-runs only if a different model or player is created.
  }, [gltf, mixer]);

  // Runs every frame (about 60 times a second).
  useFrame((_state, delta) => {
    // Moves the animation forward by the time since the last frame, so it plays at real speed.
    mixer.update(delta);
    // Stops here if the group hasn't been drawn yet.
    if (!spinGroup.current) return;
    // Applies the left/right drag spin.
    spinGroup.current.rotation.y = rotation.current.y;
    // Applies the up/down drag tilt.
    spinGroup.current.rotation.x = rotation.current.x;
  });

  // Returns the model's 3D objects.
  return (
    // The group that spins; its center is the spin point, so the model turns in place.
    <group ref={spinGroup}>
      {/* The loaded model, shrunk or grown to fit and shifted so it's centered on the spin point. */}
      <primitive object={gltf.scene} scale={fit.scale} position={fit.offset} />
    </group>
  );
}

// The viewer's styles.
const styles = StyleSheet.create({
  // The outer box.
  container: {
    // Fills all the space the avatar panel gives it.
    flex: 1,
    // Lets the drag layer be positioned on top of the canvas.
    position: 'relative',
  },
  // The invisible drag-catching layer.
  dragLayer: {
    // Takes it out of the normal flow so it can sit on top of the canvas.
    position: 'absolute',
    // Stretches it to the top edge.
    top: 0,
    // Stretches it to the bottom edge.
    bottom: 0,
    // Stretches it to the left edge.
    left: 0,
    // Stretches it to the right edge.
    right: 0,
    // Web only: shows a "grab" hand cursor so computer users know they can drag.
    // (React Native's types only know "auto" and "pointer", so "as {}" hides this web-only value from TypeScript.)
    ...(Platform.OS === 'web' && ({ cursor: 'grab' } as {})),
  },
});
