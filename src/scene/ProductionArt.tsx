import { useId } from 'react';
import { assetClips, assetPaths, type EnvironmentAsset } from './assetRegistry';
export function ProductionArt({asset, className = ''}: {asset: EnvironmentAsset; className?: string}) {
  const id = useId().replace(/:/g, '');
  const path = assetPaths[asset.id];
  return <span className={`production-art ${className}`} style={{display:'block', width:'100%',height:'100%',filter:'drop-shadow(2px 5px 4px #0008)'}}>
    {path ? <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" style={{width:'100%',height:'100%',display:'block'}} aria-hidden="true"><defs><clipPath id={id}><path d={path} clipRule="evenodd"/></clipPath></defs><image href={asset.real} width="1000" height="1000" preserveAspectRatio="none" clipPath={`url(#${id})`}/></svg> : <img src={asset.real} alt="" draggable={false} style={{width:'100%',height:'100%',objectFit:'fill',display:'block',clipPath:assetClips[asset.id]}}/>}
  </span>;
}
