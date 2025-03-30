import { ParticleBackground } from './ParticleBackground';
import { MatrixBackground } from './MatrixBackground';

export function DynamicBackground() {
  return (
    <>
      <MatrixBackground />
      <ParticleBackground />
    </>
  );
}