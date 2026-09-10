import {useState} from 'react';
import {environmentAssets} from '../scene/assetRegistry';
import {ProductionArt} from '../scene/ProductionArt';
interface Props {onClose:()=>void; discoveredEvidenceIds:string[]}
export function AudioPlayerModal({onClose,discoveredEvidenceIds}:Props){
 const [activeId,setActiveId]=useState('');
  const audioTracks = [
    {
      id: 'EVD_VOICE_MEMO_SAR_VM_001',
      title: 'Voice Memo: Note to Self (SAR-VM-001)',
      timestamp: '11:15 PM',
      duration: '0:15',
      speaker: 'Sarah Mehta',
      transcript:
        '"Okay... note to self. Talk to Ryan tomorrow about those numbers. Something still doesn\'t add up. And don\'t message him about it. Just talk at work. Also... Maya\'s going to kill me if I forget Saturday again. That\'s it. I\'m going to sleep."',
    },
    {
      id: 'EVD_VOICE_MEMO_SAR_VM_002',
      title: "Voice Memo: Numbers Don't Match (SAR-VM-002)",
      timestamp: '06:15 PM',
      duration: '0:16',
      speaker: 'Sarah Mehta',
      transcript:
        '"Okay... this is weird. I checked the numbers again. Twice. They don\'t match what Ryan showed me yesterday. Maybe I\'m missing something, but... there are entries here that shouldn\'t exist. I\'m not sending screenshots. Not yet. I\'ll make a copy and keep it somewhere else. Just in case."',
    },
    {
      id: 'EVD_VOICE_MEMO_SAR_VM_003',
      title: "Voice Memo: Someone Changed It (SAR-VM-003)",
      timestamp: '08:30 PM',
      duration: '0:20',
      speaker: 'Sarah Mehta',
      transcript:
        '"Wait... no. I know what I saw. The entries I flagged yesterday... they\'re gone. Not corrected. Gone. And the access log says I opened the file again at 1:12 this morning. I didn\'t. Someone used my account. ...Okay. I\'m making a copy now. And I\'m not keeping it here."',
    },
    {
      id: 'EVD_VOICE_MEMO_SAR_VM_004',
      title: "Voice Memo: Moved the Copy (SAR-VM-004)",
      timestamp: '10:45 PM',
      duration: '0:20',
      speaker: 'Sarah Mehta',
      transcript:
        '"Okay... I moved the copy. It\'s not at home, and it\'s not at work. I don\'t want it anywhere connected to me. Maya doesn\'t know. Ryan doesn\'t know. Nobody does. I wrote down what I need so I don\'t forget it. If I\'m overreacting... fine. But until I know who used my account, it stays where it is."',
    },
    {
      id: 'EVD_VOICE_MEMO_SAR_VM_005',
      title: "Voice Memo: I Was Followed (SAR-VM-005)",
      timestamp: '02:45 AM',
      duration: '0:24',
      speaker: 'Sarah Mehta',
      transcript:
        '"I think someone followed me tonight. I noticed the same car twice. Once outside the café... and again near the station. Maybe it\'s nothing. ...No. I\'m done telling myself that. Someone accessed my account. Someone erased those entries. And now this. I\'m going to get the copy. Then I\'m calling Maya."',
    },
    {
      id: 'EVD_VOICE_MEMO_317',
      title: 'Emergency Voice Memo 03:20 AM',
      timestamp: '03:20 AM',
      duration: '0:34',
      speaker: 'Sarah Mehta',
      transcript:
        '"(Heavy breathing, vehicle engine acceleration in background) Someone was waiting by the locker exit... a black sedan has been tailing me since 42nd Street. If you find this phone, the master drive is in Locker 28. Code 8-3-1-7. Don\'t let Ardent take it..."',
    },
    {
      id: 'EVD_CALL_MAYA_230',
      title: "Maya's Unanswered Voicemail (MAYA-VM-001)",
      timestamp: '02:35 AM',
      duration: '0:17',
      speaker: 'Maya',
      transcript:
        '"Sarah, hey... call me when you get this, okay? You said you\'d call me back and now you\'re not answering. I know you\'re probably busy, but... you\'re making me nervous. Just text me. Anything. I don\'t care what time it is. Call me."',
    },
    {
      id: 'EVD_CALL_ALEX_VOICEMAIL',
      title: 'Voicemail from Alex (03:22 AM)',
      timestamp: '03:22 AM',
      duration: '0:22',
      speaker: 'Alex',
      transcript:
        '"Sarah I am at Central Station right now! Where are you?! We need to talk before it\'s too late!"',
    },
    {
      id: 'EVD_CALL_317',
      title: '3:17 AM Recorded Call Connection (CALL-0317-001)',
      timestamp: '03:17 AM',
      duration: '0:41',
      speaker: 'Sarah Mehta & Unknown Caller',
      transcript:
        'Unknown: "You have it? You know why I\'m calling."\nSarah: "No. I really don\'t."\nUnknown: "Locker twenty-eight. You opened it."\nSarah: "How do you know that?"\nUnknown: "Sarah... listen to me. Leave what\'s inside and walk away."\nSarah: "You\'ve been following me."\nUnknown: "Go home."\nSarah: "Who are you?"\nUnknown: "You\'re asking the wrong question."\nSarah: "Then what\'s the right one?"\nUnknown: "Who else knew you were coming?"\n[silence]\nSarah: "...Alex?"\nUnknown: "Don\'t trust what you see."',
    },
    {
      id: 'EVID-REC-STATION-001',
      title: 'Recovered Station Recording (REC-STATION-001)',
      timestamp: '02:59 AM',
      duration: '0:17',
      speaker: 'Sarah Mehta & Environmental Audio',
      transcript:
        'SARAH: "Twenty-eight..."\n[metallic sound]\n[footsteps]\nSARAH: "Hello?"\n[distant announcement — unintelligible]\n[recording ends]',
    },
    {
      id: 'EVID-RYAN-VM-001',
      title: "Ryan's Warning Voicemail (RYAN-VM-001)",
      timestamp: '11:24 PM',
      duration: '0:17',
      speaker: 'Ryan',
      transcript:
        'Ryan: "Sarah, hey. I saw your message about the numbers. Don\'t send me anything on Teams or email, okay? Just... leave it for now. I\'ll explain tomorrow when we\'re in the office. And Sarah... don\'t open the audit folder again. Seriously. Just leave it."',
    },
    {
      id: 'EVID-DANIEL-INT-001',
      title: 'Recovered Intercom Recording (DANIEL-INT-001)',
      timestamp: '11:12 PM',
      duration: '0:15',
      speaker: 'Daniel (Floor 14 Intercom)',
      transcript:
        'DANIEL: "Sarah? What are you still doing on this floor? You shouldn\'t be here this late. Listen... don\'t use your access card again. The system\'s logging everything tonight. Take the service stairs. And Sarah... if anyone asks, we didn\'t speak."',
    },
  ];


 const recovered=audioTracks.filter(t=>discoveredEvidenceIds.includes(t.id));
 const currentTrack=recovered.find(t=>t.id===activeId)||recovered[0];
 return <div className="physical-closeup" style={{backgroundImage:`url(${environmentAssets.desk.surface.real})`}}>
  <button className="scene-back" onClick={onClose} aria-label="Close recorder">‹ Desk</button>
  <article className="paper-sheet recorder-sheet">
   <header><small>RECOVERED RECORDINGS / CASE 001</small><h1>Audio record</h1></header>
   <div className="recorder-art"><ProductionArt asset={environmentAssets.recorder.body}/></div>
   {recovered.length===0?<p className="pencil-note">No recordings transferred yet. Log audio evidence from Sarah’s phone to review it here.</p>:<>
    <nav aria-label="Recovered recordings">{recovered.map(t=><button className="paper-action recorder-track" key={t.id} aria-pressed={currentTrack.id===t.id} onClick={()=>setActiveId(t.id)}>{t.title}</button>)}</nav>
    <section><small>TRANSCRIPT · {currentTrack.speaker} · {currentTrack.duration}</small><p>{currentTrack.transcript}</p></section>
   </>}
  </article>
 </div>
}
