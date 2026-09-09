import React from 'react';
import { Clock, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import type { CaseData } from '../cases/types';

interface TimelineViewProps {
  caseData: CaseData;
  discoveredEvidenceIds: string[];
  unlockedTimelineEventIds: string[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  caseData,
  discoveredEvidenceIds,
  unlockedTimelineEventIds,
}) => {
  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#090b10',
        color: '#f8fafc',
        overflow: 'hidden',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          padding: '12px 16px',
          background: 'rgba(15, 20, 30, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 800 }}>Forensic Timeline</h2>
          <p style={{ fontSize: '10px', color: '#94a3b8' }}>September 9th • 11:30 PM — 03:24 AM</p>
        </div>

        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: '#ff7043',
            background: 'rgba(255, 87, 34, 0.15)',
            padding: '4px 8px',
            borderRadius: '6px',
          }}
        >
          KEY EVENT: 03:17 AM
        </span>
      </div>

      {/* Timeline Stream */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Continuous Vertical Line */}
        <div
          style={{
            position: 'absolute',
            left: '32px',
            top: '20px',
            bottom: '20px',
            width: '2px',
            background: 'linear-gradient(to bottom, #00f2fe 0%, #ff5722 75%, #ff1744 100%)',
            opacity: 0.4,
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', zIndex: 10 }}>
          {caseData.timeline.map((event) => {
            const isUnlocked =
              !event.isLockedByDefault ||
              unlockedTimelineEventIds.includes(event.id) ||
              (event.unlockedByEvidenceId && discoveredEvidenceIds.includes(event.unlockedByEvidenceId));

            const isKey317 = event.isKey317Event;

            return (
              <div
                key={event.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  opacity: isUnlocked ? 1 : 0.55,
                }}
              >
                {/* Node Pill Icon */}
                <div
                  style={{
                    width: isKey317 ? '34px' : '26px',
                    height: isKey317 ? '34px' : '26px',
                    borderRadius: '50%',
                    background: isKey317
                      ? 'linear-gradient(135deg, #ff5722, #ff1744)'
                      : isUnlocked
                      ? 'linear-gradient(135deg, #00c6ff, #0072ff)'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: isKey317 ? '2px solid #ffffff' : '2px solid rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isKey317
                      ? '0 0 20px rgba(255, 87, 34, 0.8)'
                      : isUnlocked
                      ? '0 0 10px rgba(0, 198, 255, 0.4)'
                      : 'none',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {isKey317 ? (
                    <AlertTriangle size={16} color="#ffffff" />
                  ) : isUnlocked ? (
                    <CheckCircle size={14} color="#ffffff" />
                  ) : (
                    <Lock size={12} color="#94a3b8" />
                  )}
                </div>

                {/* Event Details Card */}
                <div
                  style={{
                    flex: 1,
                    background: isKey317
                      ? 'linear-gradient(135deg, rgba(255, 87, 34, 0.25), rgba(255, 23, 68, 0.2))'
                      : 'rgba(18, 24, 38, 0.75)',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    border: isKey317
                      ? '1px solid #ff5722'
                      : isUnlocked
                      ? '1px solid rgba(255, 255, 255, 0.08)'
                      : '1px dashed rgba(255, 255, 255, 0.15)',
                    boxShadow: isKey317 ? '0 4px 20px rgba(255, 87, 34, 0.3)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={12} color={isKey317 ? '#ff7043' : '#38bdf8'} />
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          color: isKey317 ? '#ffab91' : '#38bdf8',
                        }}
                      >
                        {event.time}
                      </span>
                    </div>

                    <span style={{ fontSize: '9px', color: '#64748b' }}>
                      {isUnlocked ? event.source : 'UNKNOWN SOURCE'}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                    {isUnlocked ? event.title : 'Locked Timeline Milestone'}
                  </h4>

                  <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '3px', lineHeight: '1.4' }}>
                    {isUnlocked
                      ? event.description
                      : 'Discover related digital evidence in Messages, Photos, Calls, or Maps to unlock this milestone.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
