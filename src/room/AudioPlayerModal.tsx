import React, { useState } from 'react';
import { X, Disc, Play, Pause, Radio } from 'lucide-react';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface AudioPlayerModalProps {
  onClose: () => void;
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({
  onClose,
}) => {
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioTracks = [
    {
      id: 'memo-1',
      title: 'Emergency Voice Memo 03:20 AM',
      timestamp: '03:20 AM',
      duration: '0:34',
      speaker: 'Sarah Mehta',
      transcript:
        '"(Heavy breathing, vehicle engine acceleration in background) Someone was waiting by the locker exit... a black sedan has been tailing me since 42nd Street. If you find this phone, the master drive is in Locker 28. Code 8-3-1-7. Don\'t let Ardent take it..."',
    },
    {
      id: 'call-maya',
      title: 'Voicemail from Maya (02:35 AM)',
      timestamp: '02:35 AM',
      duration: '0:18',
      speaker: 'Maya',
      transcript:
        '"Sarah please! Pick up the phone! I saw Alex leaving his place in a hurry. What is happening?!"',
    },
    {
      id: 'call-alex',
      title: 'Voicemail from Alex (03:22 AM)',
      timestamp: '03:22 AM',
      duration: '0:22',
      speaker: 'Alex',
      transcript:
        '"Sarah I am at Central Station right now! Where are you?! We need to talk before it\'s too late!"',
    },
    {
      id: 'call-317',
      title: '3:17 AM Recorded Call Connection',
      timestamp: '03:17 AM',
      duration: '0:42',
      speaker: 'Unknown Number',
      transcript:
        '"(Static, distorted low voice) You have the archive. Place it in the locker and walk away. We know where you\'re going, Sarah."',
    },
  ];

  const currentTrack = audioTracks[activeTrackIndex];

  const togglePlayback = () => {
    soundEngine.playTapeClick();
    hapticEngine.light();
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        background: 'rgba(5, 7, 14, 0.88)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '88vh',
          background: 'linear-gradient(145deg, #181b22 0%, #0c0e14 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 20px',
            background: 'rgba(20, 24, 34, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={18} color="#38bdf8" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Micro-Cassette Audio Deck
            </span>
          </div>

          <button
            onClick={() => {
              soundEngine.playTapeClick();
              hapticEngine.light();
              onClose();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Cassette Tape Deck Visualizer */}
        <div
          style={{
            padding: '24px 20px',
            background: '#11141c',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* Cassette Shell Body */}
          <div
            style={{
              width: '280px',
              height: '140px',
              background: 'linear-gradient(135deg, #2a2e39, #1c1f26)',
              borderRadius: '12px',
              border: '2px solid #3f4452',
              boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.6)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
            }}
          >
            <div
              style={{
                background: '#fef08a',
                borderRadius: '4px',
                padding: '4px 8px',
                border: '1px solid #ca8a04',
                color: '#713f12',
                fontSize: '10px',
                fontWeight: 800,
                textAlign: 'center',
                letterSpacing: '1px',
              }}
            >
              3:17 EVIDENCE RECORD • CASE 001
            </div>

            <div
              style={{
                height: '54px',
                background: '#090b10',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '0 24px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '3px dashed #64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: isPlaying ? 'spin 2s linear infinite' : 'none',
                }}
              >
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffffff' }} />
              </div>

              <div style={{ width: '80px', height: '6px', background: '#451a03', borderRadius: '2px' }} />

              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '3px dashed #64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: isPlaying ? 'spin 2s linear infinite' : 'none',
                }}
              >
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffffff' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', fontWeight: 600 }}>
              <span>SIDE A</span>
              <span>TYPE II • CrO2</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
            <button
              onClick={togglePlayback}
              style={{
                background: isPlaying ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                border: 'none',
                borderRadius: '50%',
                width: '46px',
                height: '46px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: isPlaying ? '0 0 16px rgba(239, 68, 68, 0.6)' : '0 0 16px rgba(34, 197, 94, 0.5)',
              }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '3px' }} />}
            </button>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                {currentTrack.title}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                Duration: {currentTrack.duration} • Recorded: {currentTrack.timestamp}
              </div>
            </div>
          </div>
        </div>

        {/* Track Selection & Transcript */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Recovered Audio Recordings
            </div>
            {audioTracks.map((track, idx) => {
              const isSelected = activeTrackIndex === idx;
              return (
                <button
                  key={track.id}
                  onClick={() => {
                    soundEngine.playTapeClick();
                    hapticEngine.light();
                    setActiveTrackIndex(idx);
                    setIsPlaying(true);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Disc size={15} color={isSelected ? '#38bdf8' : '#64748b'} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: isSelected ? '#ffffff' : '#cbd5e1' }}>
                      {track.title}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{track.duration}</span>
                </button>
              );
            })}
          </div>

          <div
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
              Audio Transcript • {currentTrack.speaker}
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '12.5px', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
              {currentTrack.transcript}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            background: 'rgba(20, 24, 34, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={() => {
              soundEngine.playTapeClick();
              onClose();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close Deck
          </button>
        </div>
      </div>
    </div>
  );
};
