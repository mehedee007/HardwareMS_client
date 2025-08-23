"use client"
import React, { useState, useRef } from 'react';

// Define TypeScript interface for sound options
interface SoundOption {
  id: string;
  name: string;
  url: string;
}

const AudioButtonDemo = () => {
  // State for tracking which sound is playing
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

// Available sound options
const soundOptions: SoundOption[] = [
    { id: 'click', name: 'Mouse Click', url: '/assets/mouse-click-290204.mp3' },
    { id: 'bell', name: 'Bell', url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9c7e4e.mp3' },
    { id: 'pop', name: 'Pop', url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9c7e4e.mp3' },
    { id: 'success', name: 'Success', url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9c7e4e.mp3' },
];

  // Function to play a sound
  const playSound = (soundUrl: string, soundId: string) => {
    if (audioRef.current) {
      // Stop any currently playing sound
      audioRef.current.pause();
      
      // Set the new sound source
      audioRef.current.src = soundUrl;
      audioRef.current.currentTime = 0;
      
      // Play the sound
      audioRef.current.play()
        .then(() => {
          setPlayingSound(soundId);
        })
        .catch(error => {
          console.error("Error playing sound:", error);
        });
    }
  };

  // Handle when audio ends
  const handleAudioEnd = () => {
    setPlayingSound(null);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #6e8efb 0%, #a777e3 100%)',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
        textAlign: 'center',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h1 style={{ color: '#333', marginBottom: '10px', fontSize: '2.5rem' }}>
          React Audio Buttons
        </h1>
        <p style={{ color: '#666', marginBottom: '40px', fontSize: '1.1rem' }}>
          Click any button to play a sound effect
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {soundOptions.map(sound => (
            <button
              key={sound.id}
              onClick={() => playSound(sound.url, sound.id)}
              disabled={playingSound === sound.id}
              style={{
                padding: '18px 24px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#fff',
                background: playingSound === sound.id ? '#4CAF50' : '#2196F3',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 5px 15px rgba(33, 150, 243, 0.4)',
                transform: playingSound === sound.id ? 'scale(0.95)' : 'scale(1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {playingSound === sound.id ? (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 18L18 12L6 6V18Z" fill="currentColor"/>
                  </svg>
                  <span>Playing...</span>
                </>
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                  </svg>
                  <span>{sound.name}</span>
                </>
              )}
            </button>
          ))}
        </div>
        
        <div style={{
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '12px',
          textAlign: 'left'
        }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>Implementation Details:</h3>
          <ul style={{ color: '#666', lineHeight: '1.6', paddingLeft: '20px' }}>
            <li>Uses HTML5 Audio API with React refs</li>
            <li>TypeScript interfaces for type safety</li>
            <li>Visual feedback during playback</li>
            <li>Prevents overlapping sounds</li>
            <li>Responsive grid layout for buttons</li>
          </ul>
        </div>
      </div>
      
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnd}
        preload="auto"
      />
    </div>
  );
};

export default AudioButtonDemo;