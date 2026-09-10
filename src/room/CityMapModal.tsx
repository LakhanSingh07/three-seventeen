import {useMemo,useState} from 'react';
import type {CaseData,CaseSaveState} from '../cases/types';
import {environmentAssets} from '../scene/assetRegistry';
import {ProductionArt} from '../scene/ProductionArt';
export function CityMapModal({caseData,saveState,onClose}:{caseData:CaseData;saveState:CaseSaveState;onClose:()=>void}){
 const visibleLocations=useMemo(()=>{
  const discovered=caseData.evidenceList.filter(e=>saveState.discoveredEvidenceIds.includes(e.id));
  const corpus=discovered.map(e=>`${e.title} ${e.description} ${e.sourceDetail}`).join(' ').toLowerCase();
  return caseData.locations.filter((location,index)=>index===0 || corpus.includes(location.name.replace(/\s*\(.+\)$/,'').toLowerCase()));
 },[caseData,saveState.discoveredEvidenceIds]);
 const [selected,setSelected]=useState(visibleLocations[0].id);
 const loc=visibleLocations.find(l=>l.id===selected) || visibleLocations[0];
 return <div className="physical-closeup map-closeup" style={{backgroundImage:`url(${environmentAssets.desk.surface.real})`}}>
  <button className="scene-back" onClick={onClose} aria-label="Close map">‹ Desk</button>
  <div className="physical-map"><ProductionArt asset={environmentAssets.map.unfolded}/>{visibleLocations.map((l,i)=><button key={l.id} className="map-mark" aria-pressed={selected===l.id} onClick={()=>setSelected(l.id)} style={{left:`${18+i%2*45}%`,top:`${24+Math.floor(i/2)*24}%`}}><i/>{l.name}</button>)}</div>
  <section className="map-annotation"><small>CITY REFERENCE</small><h2>{loc.name}</h2><p>{loc.address}</p><p>{loc.description}</p></section>
 </div>
}
