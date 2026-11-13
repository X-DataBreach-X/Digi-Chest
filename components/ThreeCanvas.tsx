// Web (computer browser) version of the 3D drawing tools.
// Phones use ThreeCanvas.native.tsx instead; Expo picks the right file automatically.

// Re-exports the browser Canvas (the 3D drawing area) plus the hooks the viewer needs:
// useFrame runs code every frame, useLoader loads a file such as the .glb model.
export { Canvas, useFrame, useLoader } from '@react-three/fiber';
