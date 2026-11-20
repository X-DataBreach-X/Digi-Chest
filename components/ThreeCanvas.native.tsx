// Phone (Android/iOS) version of the 3D drawing tools.
// The phone version of Canvas draws with expo-gl and teaches three.js to load bundled files like fish.glb.

// Re-exports the phone Canvas plus the same hooks as the web file, so the viewer code is identical on both.
export { Canvas, useFrame, useLoader } from '@react-three/fiber/native';
