import React, { useState } from 'react';
import { ChevronLeft, MessageSquare } from 'lucide-react';
import type { CaseData, Character } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface ContactsAppProps {
  caseData: CaseData;
  onOpenAppWithParticipant: (participantId: string) => void;
  onBackToHome: () => void;
}

export const ContactsApp: React.FC<ContactsAppProps> = ({
  caseData,
  onOpenAppWithParticipant,
  onBackToHome,
}) => {
  const [selectedContact, setSelectedContact] = useState<Character | null>(caseData.characters[1]); // Alex

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
      {/* Header */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              if (selectedContact) {
                setSelectedContact(null);
                soundEngine.playTap();
              } else {
                onBackToHome();
              }
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#38bdf8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
          >
            <ChevronLeft size={22} />
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Contacts & Dossiers</h2>
        </div>

        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{caseData.characters.length} Records</span>
      </div>

      {/* Main Content: Contact List OR Dossier Detail */}
      {!selectedContact ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {caseData.characters.map((contact) => (
            <div
              key={contact.id}
              onClick={() => {
                setSelectedContact(contact);
                soundEngine.playTap();
                hapticEngine.light();
              }}
              style={{
                background: 'rgba(18, 24, 38, 0.75)',
                borderRadius: '16px',
                padding: '12px 14px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <img
                src={contact.avatar}
                alt={contact.name}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(255, 255, 255, 0.15)',
                }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>{contact.name}</h4>
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: contact.statusTag === 'SUSPECT' ? '#ff1744' : 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                    }}
                  >
                    {contact.statusTag || 'CONTACT'}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  {contact.relationship} • {contact.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Dossier Detail View
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <img
            src={selectedContact.avatar}
            alt={selectedContact.name}
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #ff5722',
              boxShadow: '0 0 25px rgba(255, 87, 34, 0.4)',
              marginBottom: '12px',
            }}
          />

          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>{selectedContact.name}</h1>
          <p style={{ fontSize: '12px', color: '#ff7043', fontWeight: 600, marginTop: '2px' }}>
            {selectedContact.role}
          </p>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', margin: '16px 0' }}>
            <button
              onClick={() => {
                onOpenAppWithParticipant(selectedContact.id);
                soundEngine.playTap();
              }}
              style={{
                background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 16px',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <MessageSquare size={14} />
              <span>VIEW MESSAGES</span>
            </button>
          </div>

          {/* Dossier Information Card */}
          <div
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '12px',
            }}
          >
            <div>
              <span style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 700 }}>PHONE NUMBER</span>
              <p style={{ color: '#f8fafc', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {selectedContact.phone}
              </p>
            </div>

            <div>
              <span style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 700 }}>RELATIONSHIP TO SARAH</span>
              <p style={{ color: '#38bdf8', fontWeight: 600 }}>{selectedContact.relationship}</p>
            </div>

            <div>
              <span style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 700 }}>INVESTIGATIVE DOSSIER</span>
              <p style={{ color: '#cbd5e1', lineHeight: '1.5', marginTop: '3px' }}>{selectedContact.bio}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
