import React from 'react';

interface BackgroundVideoProps {
  src: string;
  brightness?: string;
  blur?: boolean;
}

const BackgroundVideo = ({ src, brightness = "brightness-[0.6]", blur = false }: BackgroundVideoProps) => (
  <div className={`fixed inset-0 z-[0] w-screen h-screen ${blur ? "blur-md scale-105" : ""}`}>
    <video
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      className={`absolute top-0 left-0 w-screen h-screen min-w-full min-h-full object-cover ${brightness}`}
      style={{
        width: '100vw',
        height: '100vh',
        transform: 'translate3d(0, 0, 0)'
      }}
    >
      <source src={src} type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-black/20" />
  </div>
);

export default BackgroundVideo;