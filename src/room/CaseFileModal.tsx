import type { CaseData } from '../cases/types';
import { environmentAssets, caseContentAssets } from '../scene/assetRegistry';
import { ProductionArt } from '../scene/ProductionArt';
interface Props {caseData:CaseData;onClose:()=>void;onOpenPhone:()=>void;onOpenReport?:()=>void}
export function CaseFileModal({caseData,onClose,onOpenPhone,onOpenReport}:Props){
 return <div className="physical-closeup dossier-closeup" style={{backgroundImage:`url(${environmentAssets.desk.surface.real})`}}>
  <button className="scene-back" onClick={onClose} aria-label="Close case file">‹ Desk</button>
  <article className="dossier-sheet paper-sheet" style={{backgroundImage:`url(${environmentAssets.clutter.paperSingle.real})`}}>
   <header><small>CONFIDENTIAL · CASE {caseData.caseNumber}</small><h1>Missing person</h1><div className="paper-rule"/></header>
   <div className="dossier-subject"><div className="dossier-photo"><ProductionArt asset={environmentAssets.board_pin_frames.polaroid}/><img src={caseContentAssets.sarahProfile} alt="Sarah Mehta"/></div><div><h2>{caseData.victimName}</h2><p>{caseData.victimAge} years old</p><p className="ink-stamp">MISSING</p><small>PERSONAL DEVICE RECOVERED</small></div></div>
   <section><h3>Incident summary</h3><p>{caseData.briefing.synopsis}</p></section>
   <section><h3>Current status</h3><p>{caseData.briefing.initialStatus}</p></section>
   <section><h3>Investigator’s instructions</h3><ol>{caseData.briefing.directives.map((d,i)=><li key={i}>{d}</li>)}</ol></section>
   <footer><button className="paper-action" onClick={onOpenPhone}>Examine recovered device ↗</button>{onOpenReport && <button className="report-stamp" onClick={onOpenReport}>FILE FINAL REPORT</button>}</footer>
  </article>
 </div>
}
