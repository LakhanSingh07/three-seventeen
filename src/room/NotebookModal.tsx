import {useState} from 'react';
import type {CaseData,CaseSaveState} from '../cases/types';
import {environmentAssets} from '../scene/assetRegistry';
interface Props {caseData:CaseData;saveState:CaseSaveState;onClose:()=>void}
export function NotebookModal({caseData,saveState,onClose}:Props){
 const [activeTab,setTab]=useState('questions');
 const deductions=caseData.deductions.filter(d=>saveState.unlockedDeductionIds.includes(d.id));
 const evidence=caseData.evidenceList.filter(e=>saveState.discoveredEvidenceIds.includes(e.id));
 return <div className="physical-closeup notebook-closeup" style={{backgroundImage:`url(${environmentAssets.desk.surface.real})`}}>
  <button className="scene-back" onClick={onClose} aria-label="Close notebook">‹ Desk</button>
  <article className="notebook-sheet paper-sheet" style={{backgroundImage:`url(${environmentAssets.clutter.paperSingle.real})`}}>
   <header><small>CASE 001 / PRIVATE OBSERVATIONS</small><h1>Field notes</h1><div className="paper-rule"/></header>
   <nav className="paper-tabs" aria-label="Notebook sections">{[['questions','Questions'],['confirmed','Facts'],['leads','Leads'],['codes','Notes']].map(([id,title])=><button key={id} aria-pressed={id===activeTab} onClick={()=>setTab(id)}>{title}</button>)}</nav>
   <div className="notebook-writing">
    {activeTab==='questions' && <><h3>What happened at 03:17?</h3><p>Reconstruct Sarah’s last movements. Separate what people said from what the records show.</p>{deductions.map(d=><section key={d.id}><h3>{d.unlockedQuestion||d.title}</h3><p>{d.insight}</p></section>)}{!deductions.length&&<p className="pencil-note">Start with the recovered phone. Each connection must be supported by evidence.</p>}</>}
    {activeTab==='confirmed' && <>{evidence.length===0?<p>No evidence logged yet.</p>:evidence.map(e=><section key={e.id}><small>{e.timestamp} · {e.sourceApp}</small><h3>{e.title}</h3><p>{e.description}</p></section>)}</>}
    {activeTab==='leads' && <><h3>Lines of enquiry</h3><p>Compare statements with location records. Inspect the details of photos, calls and notes on Sarah’s phone.</p>{caseData.hints.filter(h=>saveState.usedHintIds.includes(h.id)).map(h=><section key={h.id}><h3>{h.title}</h3><p>{h.text}</p></section>)}</>}
    {activeTab==='codes' && <>{evidence.filter(e=>['Notes','Files','Phone'].includes(e.sourceApp)).map(e=><section key={e.id}><h3>{e.title}</h3><p>{e.description}</p><small>{e.sourceDetail}</small></section>)}{!evidence.some(e=>['Notes','Files','Phone'].includes(e.sourceApp))&&<p>No notes or numerical records logged yet.</p>}</>}
   </div><footer><small>Investigator’s notebook · 001</small></footer>
  </article>
 </div>
}
