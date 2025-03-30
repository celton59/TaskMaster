export function SimpleDivBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-gradient-to-b from-black to-blue-950">
      {/* Cuadrícula */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 225, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 225, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.2
        }}
      />

      {/* Círculos de luz fijos */}
      <div
        className="absolute left-1/4 top-1/4 rounded-full"
        style={{
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(0, 225, 255, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
          transform: 'translate(-50%, -50%)',
          opacity: 0.8
        }}
      />

      <div
        className="absolute right-1/3 top-1/2 rounded-full"
        style={{
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(187, 0, 255, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
          transform: 'translate(50%, -50%)',
          opacity: 0.8
        }}
      />

      <div
        className="absolute left-1/2 bottom-1/4 rounded-full"
        style={{
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(0, 255, 157, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
          transform: 'translate(-50%, 50%)',
          opacity: 0.8
        }}
      />

      {/* Líneas horizontales neon */}
      <div
        className="absolute top-1/4 w-full h-px bg-cyan-400"
        style={{
          boxShadow: '0 0 10px rgba(0, 225, 255, 0.7)',
          opacity: 0.3
        }}
      />

      <div
        className="absolute top-3/4 w-full h-px bg-purple-400"
        style={{
          boxShadow: '0 0 10px rgba(187, 0, 255, 0.7)',
          opacity: 0.3
        }}
      />

      {/* Partículas fijas */}
      {Array.from({ length: 50 }).map((_, i) => {
        const size = Math.random() * 3 + 1;
        const top = `${Math.random() * 100}%`;
        const left = `${Math.random() * 100}%`;
        const color = [
          'rgba(0, 225, 255, 0.8)',
          'rgba(187, 0, 255, 0.8)',
          'rgba(0, 255, 157, 0.8)',
          'rgba(255, 234, 0, 0.8)',
          'rgba(255, 0, 170, 0.8)'
        ][Math.floor(Math.random() * 5)];

        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}`,
              top: top,
              left: left,
              opacity: Math.random() * 0.5 + 0.3
            }}
          />
        );
      })}
    </div>
  );
}