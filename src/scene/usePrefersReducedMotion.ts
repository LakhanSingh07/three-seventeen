import {useEffect,useState} from 'react';
function readPreference(){return typeof window!=='undefined'&&!!window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches}
export function usePrefersReducedMotion(){
 const [reduced,setReduced]=useState(readPreference);
 useEffect(()=>{const query=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(query.matches);query.addEventListener('change',update);return()=>query.removeEventListener('change',update)},[]);
 return reduced;
}
