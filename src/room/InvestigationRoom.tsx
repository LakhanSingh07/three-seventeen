import React, { useState } from 'react';
import { ArrowLeft, Lamp } from 'lucide-react';
import type { CaseData, CaseSaveState, Deduction, AccusationTheory } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

import { CaseFileModal } from './CaseFileModal';
import { NotebookModal } from './NotebookModal';
import { CityMapModal } from './CityMapModal';
import { AudioPlayerModal } from './AudioPlayerModal';
import { FinalReportModal } from './FinalReportModal';

interface InvestigationRoomProps {
  caseData: CaseData;
  saveState: CaseSaveState;
  onEnterPhone: () => void;
  onOpenBoard: () => void;
  onUnlockDeduction: (deduction: Deduction) => void;
  onSubmitAccusation: (theory: AccusationTheory) => void;
  onExitToCaseSelect?: () => void;
}

export const InvestigationRoom: React.FC<InvestigationRoomProps> = ({
  caseData,
  saveState,
  onEnterPhone,
  onOpenBoard,
  onUnlockDeduction: _onUnlockDeduction,
  onSubmitAccusation,
  onExitToCaseSelect,
}) => {
  const [activeModal, setActiveModal] = useState<'casefile' | 'notebook' | 'map' | 'audio' | 'report' | null>(null);
  const [isLampOn, setIsLampOn] = useState(true);
  const [hoveredProp, setHoveredProp] = useState<string | null>(null);

  const toggleLamp = () => {
    soundEngine.playDeskLampToggle();
    hapticEngine.light();
    setIsLampOn(!isLampOn);
  };

  const isDeductionsReady = saveState.unlockedDeductionIds.length >= 2;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: '#070503',
        color: '#f8fafc',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Background Room Atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/assets/case001/case-art/case001_background.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: isLampOn ? 'brightness(0.55) contrast(1.1)' : 'brightness(0.22) contrast(1.2)',
          transition: 'filter 0.4s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Warm Lamp Light Cone Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isLampOn
            ? 'radial-gradient(ellipse 70% 60% at 28% 70%, rgba(254, 240, 138, 0.18) 0%, rgba(245, 158, 11, 0.08) 45%, rgba(0, 0, 0, 0.65) 85%)'
            : 'radial-gradient(ellipse at 50% 50%, rgba(15, 23, 42, 0.4) 0%, rgba(3, 4, 7, 0.95) 100%)',
          pointerEvents: 'none',
          transition: 'all 0.4s ease',
          zIndex: 5,
        }}
      />

      {/* Subtle Room Shadow Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.9), inset 0 -40px 80px rgba(0, 0, 0, 0.95)',
          pointerEvents: 'none',
          zIndex: 6,
        }}
      />

      {/* Top Minimalist Navigation / Exit */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 16,
          right: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 40,
        }}
      >
        {onExitToCaseSelect && (
          <button
            onClick={() => {
              soundEngine.playTap();
              onExitToCaseSelect();
            }}
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
              padding: '6px 14px',
              color: '#cbd5e1',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
          >
            <ArrowLeft size={13} />
            <span>Case Files</span>
          </button>
        )}

        {/* Lamp Switch Hotspot Button */}
        <button
          onClick={toggleLamp}
          title="Toggle Desk Lamp"
          style={{
            background: isLampOn ? 'rgba(245, 158, 11, 0.25)' : 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(10px)',
            border: isLampOn ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: '6px 12px',
            color: isLampOn ? '#fde047' : '#94a3b8',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            marginLeft: 'auto',
          }}
        >
          <Lamp size={14} />
          <span>{isLampOn ? 'Lamp Lit' : 'Lamp Off'}</span>
        </button>
      </div>

      {/* Main 2.5D Room Viewport */}
      <div
        style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* ============================================================ */}
        {/* UPPER WALL: PHYSICAL INVESTIGATION CORKBOARD (Wall Surface) */}
        {/* ============================================================ */}
        <div
          style={{
            height: '42%',
            width: '100%',
            padding: '16px 20px 8px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 12,
          }}
        >
          {/* Wall-mounted Corkboard Object */}
          <div
            onClick={() => {
              soundEngine.playPinCorkboard();
              hapticEngine.medium();
              onOpenBoard();
            }}
            onMouseEnter={() => setHoveredProp('Investigation Wall')}
            onMouseLeave={() => setHoveredProp(null)}
            style={{
              width: '100%',
              maxWidth: '560px',
              height: '100%',
              background: '#85532b',
              backgroundImage: 'radial-gradient(#9e683a 15%, transparent 16%), radial-gradient(#6d411f 15%, transparent 16%)',
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 8px 8px',
              border: '8px solid #2e1a0d',
              borderRadius: '6px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.8), inset 0 0 25px rgba(0,0,0,0.6)',
              position: 'relative',
              cursor: 'pointer',
              overflow: 'hidden',
              transform: hoveredProp === 'Investigation Wall' ? 'translateY(-2px)' : 'none',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            {/* Corkboard Top Title Tape */}
            <div
              style={{
                position: 'absolute',
                top: '6px',
                left: '12px',
                background: '#fef08a',
                color: '#713f12',
                padding: '2px 8px',
                fontSize: '9px',
                fontWeight: 800,
                letterSpacing: '1px',
                transform: 'rotate(-1.5deg)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                border: '1px dashed #ca8a04',
              }}
            >
              CASE 001 // MEHTA, SARAH
            </div>

            {/* Red Connection Strings (SVG) */}
            <svg
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            >
              <line x1="50%" y1="45%" x2="26%" y2="65%" stroke="#dc2626" strokeWidth="2" strokeDasharray="4,2" opacity="0.85" />
              <line x1="50%" y1="45%" x2="74%" y2="60%" stroke="#dc2626" strokeWidth="2" strokeDasharray="4,2" opacity="0.85" />
            </svg>

            {/* Board Content (Sparse State 0 / Discovered Evidence) */}
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3,
              }}
            >
              {/* Pinned Note: 03:17 Signal Lost (Left) */}
              <div
                style={{
                  position: 'absolute',
                  left: '18px',
                  top: '40px',
                  background: '#fef9c3',
                  color: '#854d0e',
                  padding: '8px 10px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                  transform: 'rotate(-4deg)',
                  fontSize: '10px',
                  fontWeight: 700,
                  maxWidth: '110px',
                  lineHeight: 1.25,
                }}
              >
                <div style={{ position: 'absolute', top: '-6px', left: '50%', width: '8px', height: '8px', background: '#dc2626', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.5)' }} />
                <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#b91c1c', fontWeight: 900 }}>03:17</div>
                <div>Last known cell tower ping</div>
              </div>

              {/* Center Hero: Sarah Mehta Canonical Polaroid */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '6px 6px 18px 6px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.6)',
                  transform: 'rotate(1deg)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '12px',
                    height: '12px',
                    background: 'radial-gradient(circle at 35% 35%, #fbbf24, #b45309)',
                    borderRadius: '50%',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                    zIndex: 10,
                  }}
                />

                <img
                  src="/assets/case001/characters/sarah_profile.webp"
                  alt="Sarah Mehta"
                  style={{
                    width: '74px',
                    height: '84px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />

                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: '#0f172a',
                    marginTop: '4px',
                    fontFamily: 'sans-serif',
                  }}
                >
                  SARAH MEHTA
                </span>

                <div
                  style={{
                    position: 'absolute',
                    bottom: '22px',
                    right: '-6px',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '8px',
                    fontWeight: 900,
                    letterSpacing: '1px',
                    padding: '1px 5px',
                    transform: 'rotate(-12deg)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  }}
                >
                  MISSING
                </div>
              </div>

              {/* Pinned Note: Primary Contacts (Right) */}
              <div
                style={{
                  position: 'absolute',
                  right: '18px',
                  top: '38px',
                  background: '#f1f5f9',
                  color: '#334155',
                  padding: '8px 10px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                  transform: 'rotate(3deg)',
                  fontSize: '9.5px',
                  maxWidth: '120px',
                  lineHeight: 1.3,
                }}
              >
                <div style={{ position: 'absolute', top: '-6px', left: '50%', width: '8px', height: '8px', background: '#eab308', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.5)' }} />
                <div style={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>Known Circles</div>
                <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
                  • Alex (Boyfriend)<br/>
                  • Maya (Friend)<br/>
                  • Unknown caller?
                </div>
              </div>
            </div>

            {/* Bottom Floating Affordance on Corkboard */}
            <div
              style={{
                position: 'absolute',
                bottom: '6px',
                right: '10px',
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(6px)',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '9px',
                color: '#fef08a',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                zIndex: 10,
              }}
            >
              <span>Tap to Examine Board & String Links →</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* LOWER DESK PLANE: 2.5D WEATHERED WOODEN INVESTIGATION DESK  */}
        {/* ============================================================ */}
        <div
          style={{
            flex: 1,
            width: '100%',
            position: 'relative',
            background: 'linear-gradient(180deg, #1b120a 0%, #120b06 40%, #0a0603 100%)',
            boxShadow: 'inset 0 12px 30px rgba(0,0,0,0.85), inset 0 2px 4px rgba(255,255,255,0.05)',
            borderTop: '3px solid #2d180a',
            perspective: '1000px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 16px 20px 16px',
            zIndex: 15,
          }}
        >
          {/* Desk Surface Woodgrain & Lighting Plane */}
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              height: '100%',
              position: 'relative',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* -------------------------------------------------------- */}
            {/* PROP 1: SARAH'S PHONE IN EVIDENCE SLEEVE (Center Forefront) */}
            {/* -------------------------------------------------------- */}
            <div
              onClick={() => {
                soundEngine.playUnlockClick();
                hapticEngine.heavy();
                onEnterPhone();
              }}
              onMouseEnter={() => setHoveredProp("Sarah's Recovered Smartphone")}
              onMouseLeave={() => setHoveredProp(null)}
              style={{
                position: 'absolute',
                left: '52%',
                top: '10%',
                width: '118px',
                height: '210px',
                transform: hoveredProp === "Sarah's Recovered Smartphone"
                  ? 'rotate(3deg) translateY(-6px) scale(1.04)'
                  : 'rotate(3deg)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
                zIndex: 25,
              }}
            >
              {/* Evidence Plastic Bag / Sleeve backing */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-10px -12px -16px -12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(2px)',
                  boxShadow: isLampOn
                    ? '10px 15px 30px rgba(0,0,0,0.8), -2px -2px 10px rgba(254, 240, 138, 0.08)'
                    : '5px 10px 25px rgba(0,0,0,0.9)',
                  pointerEvents: 'none',
                }}
              >
                {/* Evidence Bag Label */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '8px',
                    right: '8px',
                    background: '#fef08a',
                    color: '#713f12',
                    padding: '2px 4px',
                    borderRadius: '2px',
                    fontSize: '7.5px',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    letterSpacing: '0.3px',
                    lineHeight: 1.1,
                    textAlign: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }}
                >
                  ITEM 01 • NOVA PHONE
                </div>
              </div>

              {/* Physical Smartphone Device */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: '#090d16',
                  borderRadius: '20px',
                  border: '2.5px solid #334155',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.9), 0 4px 15px rgba(0,0,0,0.7)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 6px',
                  position: 'relative',
                }}
              >
                {/* Phone Speaker Notch */}
                <div
                  style={{
                    width: '32px',
                    height: '4px',
                    background: '#1e293b',
                    borderRadius: '4px',
                    marginTop: '2px',
                  }}
                />

                {/* Glowing Screen with 03:17 */}
                <div
                  style={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      color: '#f8fafc',
                      textShadow: '0 0 12px rgba(56, 189, 248, 0.7)',
                      lineHeight: 1,
                    }}
                  >
                    03:17
                  </div>
                  <div
                    style={{
                      fontSize: '8px',
                      color: '#38bdf8',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                    }}
                  >
                    1 NEW MESSAGE
                  </div>
                </div>

                {/* Home Indicator Bar */}
                <div
                  style={{
                    width: '36px',
                    height: '3px',
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '2px',
                    marginBottom: '2px',
                  }}
                />
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* PROP 2: MANILA CASE DOSSIER FOLDER (Left Upper Desk)    */}
            {/* -------------------------------------------------------- */}
            <div
              onClick={() => {
                soundEngine.playPaperRustle();
                hapticEngine.light();
                setActiveModal('casefile');
              }}
              onMouseEnter={() => setHoveredProp('Case Dossier Folder')}
              onMouseLeave={() => setHoveredProp(null)}
              style={{
                position: 'absolute',
                left: '4%',
                top: '6%',
                width: '155px',
                height: '115px',
                background: 'linear-gradient(135deg, #d4a373 0%, #ba8a59 100%)',
                border: '1px solid #8c6036',
                borderRadius: '4px 12px 4px 4px',
                boxShadow: isLampOn
                  ? '6px 12px 24px rgba(0,0,0,0.7), inset 0 1px 3px rgba(255,255,255,0.4)'
                  : '4px 8px 18px rgba(0,0,0,0.8)',
                transform: hoveredProp === 'Case Dossier Folder'
                  ? 'rotate(-3deg) translateY(-5px) scale(1.03)'
                  : 'rotate(-3deg)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                zIndex: 20,
              }}
            >
              {/* Manila Tab */}
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '12px',
                  background: '#d4a373',
                  border: '1px solid #8c6036',
                  borderBottom: 'none',
                  borderRadius: '4px 4px 0 0',
                  padding: '1px 8px',
                  fontSize: '8px',
                  fontWeight: 900,
                  color: '#432818',
                  letterSpacing: '0.5px',
                }}
              >
                CASE FILE #001
              </div>

              {/* Metallic Paperclip */}
              <div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '16px',
                  width: '8px',
                  height: '20px',
                  border: '2px solid #94a3b8',
                  borderRadius: '4px',
                  borderBottom: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                }}
              />

              {/* Red CONFIDENTIAL Rubber Stamp */}
              <div
                style={{
                  border: '2px solid #b91c1c',
                  color: '#b91c1c',
                  padding: '2px 6px',
                  fontSize: '9px',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  transform: 'rotate(-6deg)',
                  alignSelf: 'flex-start',
                  borderRadius: '2px',
                  opacity: 0.9,
                }}
              >
                CONFIDENTIAL
              </div>

              {/* Case Subject Details */}
              <div style={{ color: '#27170e' }}>
                <div style={{ fontSize: '11px', fontWeight: 900 }}>SARAH MEHTA</div>
                <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#583110' }}>MISSING PERSONS REPORT</div>
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* PROP 3: FOLDED CITY TRANSIT MAP (Under Notebook)         */}
            {/* -------------------------------------------------------- */}
            <div
              onClick={() => {
                soundEngine.playPaperRustle();
                hapticEngine.light();
                setActiveModal('map');
              }}
              onMouseEnter={() => setHoveredProp('Transit & Surveillance Map')}
              onMouseLeave={() => setHoveredProp(null)}
              style={{
                position: 'absolute',
                left: '2%',
                bottom: '8%',
                width: '135px',
                height: '95px',
                background: '#e2e8f0',
                backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px), linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
                backgroundSize: '12px 12px, 20px 20px, 20px 20px',
                border: '1px solid #94a3b8',
                borderRadius: '2px',
                boxShadow: '4px 8px 20px rgba(0,0,0,0.6)',
                transform: hoveredProp === 'Transit & Surveillance Map'
                  ? 'rotate(8deg) translateY(-4px) scale(1.03)'
                  : 'rotate(8deg)',
                transition: 'transform 0.2s ease',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                zIndex: 18,
              }}
            >
              <div style={{ fontSize: '8px', fontWeight: 900, color: '#0f172a', letterSpacing: '0.5px' }}>
                CITY TRANSIT GRID
              </div>

              <svg style={{ width: '100%', height: '35px' }}>
                <polyline points="10,25 45,15 80,28 115,8" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,2" />
                <circle cx="10" cy="25" r="3" fill="#0284c7" />
                <circle cx="45" cy="15" r="3" fill="#0284c7" />
                <circle cx="80" cy="28" r="3" fill="#0284c7" />
                <circle cx="115" cy="8" r="4" fill="#ef4444" />
              </svg>

              <div style={{ fontSize: '7.5px', color: '#64748b', fontWeight: 700 }}>
                4 Key Locations Marked
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* PROP 4: INVESTIGATOR'S SPIRAL NOTEBOOK (Left Foreground) */}
            {/* -------------------------------------------------------- */}
            <div
              onClick={() => {
                soundEngine.playNotebookPage();
                hapticEngine.light();
                setActiveModal('notebook');
              }}
              onMouseEnter={() => setHoveredProp("Investigator's Field Notebook")}
              onMouseLeave={() => setHoveredProp(null)}
              style={{
                position: 'absolute',
                left: '18%',
                bottom: '6%',
                width: '135px',
                height: '110px',
                background: '#fdfbf7',
                border: '1px solid #dcd6cd',
                borderRadius: '4px',
                boxShadow: isLampOn
                  ? '8px 14px 28px rgba(0,0,0,0.7), inset 0 0 10px rgba(0,0,0,0.03)'
                  : '5px 10px 20px rgba(0,0,0,0.8)',
                transform: hoveredProp === "Investigator's Field Notebook"
                  ? 'rotate(-5deg) translateY(-5px) scale(1.03)'
                  : 'rotate(-5deg)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
                padding: '8px 8px 8px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                zIndex: 22,
              }}
            >
              {/* Spiral Wire Spine on Left */}
              <div
                style={{
                  position: 'absolute',
                  left: '2px',
                  top: '6px',
                  bottom: '6px',
                  width: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '10px',
                      height: '6px',
                      border: '2px solid #64748b',
                      borderRadius: '50%',
                      background: '#1e293b',
                    }}
                  />
                ))}
              </div>

              <div>
                <div style={{ fontSize: '8.5px', fontWeight: 900, color: '#713f12', textTransform: 'uppercase' }}>
                  FIELD NOTES
                </div>
                <div style={{ fontSize: '8px', color: '#1e293b', fontStyle: 'italic', marginTop: '4px', lineHeight: 1.3 }}>
                  • Alex lied about time<br/>
                  • Locker 28 combination?<br/>
                  • Who was at 3:17?
                </div>
              </div>

              <div style={{ fontSize: '7.5px', fontWeight: 800, color: '#854d0e' }}>
                Open Questions & Facts →
              </div>

              {/* Ballpoint Pen resting across notebook */}
              <div
                style={{
                  position: 'absolute',
                  right: '-14px',
                  top: '15px',
                  width: '8px',
                  height: '90px',
                  background: 'linear-gradient(to right, #1e293b, #0f172a, #334155)',
                  borderRadius: '4px',
                  transform: 'rotate(15deg)',
                  boxShadow: '2px 4px 8px rgba(0,0,0,0.5)',
                  pointerEvents: 'none',
                }}
              >
                <div style={{ position: 'absolute', top: '8px', left: '2px', width: '3px', height: '18px', background: '#e2e8f0', borderRadius: '1px' }} />
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* PROP 5: MICRO-CASSETTE RECORDER & HEADPHONES (Right Low) */}
            {/* -------------------------------------------------------- */}
            <div
              onClick={() => {
                soundEngine.playTapeClick();
                hapticEngine.light();
                setActiveModal('audio');
              }}
              onMouseEnter={() => setHoveredProp('Micro-Cassette Audio Recorder')}
              onMouseLeave={() => setHoveredProp(null)}
              style={{
                position: 'absolute',
                right: '4%',
                bottom: '10%',
                width: '105px',
                height: '80px',
                background: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)',
                border: '1.5px solid #52525b',
                borderRadius: '6px',
                boxShadow: '6px 10px 22px rgba(0,0,0,0.8)',
                transform: hoveredProp === 'Micro-Cassette Audio Recorder'
                  ? 'rotate(-8deg) translateY(-4px) scale(1.03)'
                  : 'rotate(-8deg)',
                transition: 'transform 0.2s ease',
                cursor: 'pointer',
                padding: '6px 8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                zIndex: 20,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '7.5px', fontWeight: 900, color: '#f43f5e', letterSpacing: '0.5px' }}>
                  RECORDER
                </span>
                <div style={{ width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 6px #ef4444' }} />
              </div>

              {/* Tape Spools Window */}
              <div
                style={{
                  background: '#09090b',
                  borderRadius: '3px',
                  border: '1px solid #3f3f46',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  padding: '2px',
                }}
              >
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px dashed #a1a1aa', background: '#27272a' }} />
                <div style={{ width: '20px', height: '4px', background: '#713f12' }} />
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px dashed #a1a1aa', background: '#27272a' }} />
              </div>

              <div style={{ fontSize: '7.5px', color: '#a1a1aa', textAlign: 'center' }}>
                Voicemails & Memos
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* PROP 6: ACCUSATION DOSSIER / FINAL REPORT (Right Mid)    */}
            {/* -------------------------------------------------------- */}
            <div
              onClick={() => {
                soundEngine.playPaperRustle();
                hapticEngine.heavy();
                setActiveModal('report');
              }}
              onMouseEnter={() => setHoveredProp('Official Theory & Final Report')}
              onMouseLeave={() => setHoveredProp(null)}
              style={{
                position: 'absolute',
                right: '2%',
                top: '10%',
                width: '115px',
                height: '85px',
                background: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
                border: '1.5px solid #dc2626',
                borderRadius: '4px',
                boxShadow: isDeductionsReady
                  ? '0 0 15px rgba(239, 68, 68, 0.4), 6px 10px 22px rgba(0,0,0,0.8)'
                  : '4px 8px 18px rgba(0,0,0,0.8)',
                transform: hoveredProp === 'Official Theory & Final Report'
                  ? 'rotate(4deg) translateY(-5px) scale(1.04)'
                  : 'rotate(4deg)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                zIndex: 21,
              }}
            >
              <div style={{ fontSize: '8px', fontWeight: 900, color: '#fca5a5', letterSpacing: '0.5px' }}>
                OFFICIAL REPORT
              </div>

              {/* Red Wax Seal Graphic */}
              <div
                style={{
                  alignSelf: 'center',
                  width: '24px',
                  height: '24px',
                  background: 'radial-gradient(circle at 35% 35%, #ef4444, #7f1d1d)',
                  borderRadius: '50%',
                  border: '1px solid #f87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                }}
              >
                <span style={{ fontSize: '9px', fontWeight: 900, color: '#ffffff' }}>§</span>
              </div>

              <div style={{ fontSize: '7.5px', color: '#fecaca', fontWeight: 700, textAlign: 'center' }}>
                {isDeductionsReady ? 'File Accusation →' : 'Theory Builder'}
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* PROP 7: DETECTIVE COFFEE MUG & WATER RING (Far Left)     */}
            {/* -------------------------------------------------------- */}
            <div
              style={{
                position: 'absolute',
                left: '2px',
                top: '38%',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 40% 40%, #1e293b, #090d16)',
                border: '2px solid #475569',
                boxShadow: isLampOn ? '6px 8px 16px rgba(0,0,0,0.7)' : '3px 5px 10px rgba(0,0,0,0.8)',
                pointerEvents: 'none',
                zIndex: 19,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: '5px',
                  borderRadius: '50%',
                  background: '#271202',
                  border: '1px solid #3d1c04',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'casefile' && (
        <CaseFileModal
          caseData={caseData}
          onClose={() => setActiveModal(null)}
          onOpenPhone={onEnterPhone}
        />
      )}

      {activeModal === 'notebook' && (
        <NotebookModal
          caseData={caseData}
          saveState={saveState}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'map' && (
        <CityMapModal
          caseData={caseData}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'audio' && (
        <AudioPlayerModal
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'report' && (
        <FinalReportModal
          caseData={caseData}
          saveState={saveState}
          onSubmitAccusation={(theory) => {
            setActiveModal(null);
            onSubmitAccusation(theory);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};
