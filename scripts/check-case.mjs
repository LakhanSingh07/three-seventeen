import ts from 'typescript';
import {readFile,writeFile,mkdtemp,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const temp=await mkdtemp(path.join(tmpdir(),'317-check-'));
let checks=0;
const check=(label,fn)=>{fn();checks++;console.log(`PASS ${label}`)};
try {
 await writeFile(path.join(temp,'package.json'),'{"type":"module"}');
 for(const file of ['cases/case-engine','cases/case-001/case-data','system/SaveSystem','scene/coordinates','scene/assetRegistry']){
  const output=ts.transpileModule(await readFile(`src/${file}.ts`,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/from '(\.\.?\/[^']+)'/g,"from '$1.js'");
  await mkdir(path.dirname(path.join(temp,file)),{recursive:true});await writeFile(path.join(temp,`${file}.js`),output);
 }
 const {CaseEngine}=await import(pathToFileURL(path.join(temp,'cases/case-engine.js')));
 const {SaveSystem}=await import(pathToFileURL(path.join(temp,'system/SaveSystem.js')));
 const {getProgressionStage}=await import(pathToFileURL(path.join(temp,'scene/coordinates.js')));
 const {environmentAssets}=await import(pathToFileURL(path.join(temp,'scene/assetRegistry.js')));
 const data=CaseEngine.getCase('case-001');
 check('Case 001 references are internally valid',()=>assert.deepEqual(CaseEngine.validateCase(data),{isValid:true,errors:[]}));
 const state=SaveSystem.createInitialState(data);
 check('New case exposes no discovered evidence or deductions',()=>{assert.equal(state.discoveredEvidenceIds.length,0);assert.equal(state.unlockedDeductionIds.length,0)});
 for(const deduction of data.deductions){
  const [a,b]=deduction.requiredEvidenceIds;
  state.discoveredEvidenceIds.push(a,b);
  const result=CaseEngine.tryConnectEvidence(data,a,b,state.unlockedDeductionIds);
  check(`Evidence pair unlocks ${deduction.id}`,()=>assert.equal(result.deduction?.id,deduction.id));
  state.unlockedDeductionIds.push(deduction.id);
  check(`Duplicate deduction rejected: ${deduction.id}`,()=>assert.equal(CaseEngine.tryConnectEvidence(data,a,b,state.unlockedDeductionIds).success,false));
 }
 check('Unrelated pair does not unlock a deduction',()=>assert.equal(CaseEngine.tryConnectEvidence(data,data.deductions[0].requiredEvidenceIds[0],data.deductions[1].requiredEvidenceIds[0],[]).success,false));
 const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
 SaveSystem.saveState(state);
 check('Evidence/deductions survive a save/load round trip',()=>assert.deepEqual(SaveSystem.loadState(data.id),state));
 check('Correct completed theory reaches canonical true ending',()=>assert.equal(CaseEngine.evaluateAccusation(data,{suspectId:'unknown',locationId:data.solution.correctLocationId,criticalTime:'03:17 AM'},state),data.endings.true_ending));
 check('Wrong suspect reaches canonical wrong ending',()=>assert.equal(CaseEngine.evaluateAccusation(data,{suspectId:'alex'},state),data.endings.wrong_suspect_alex));
 check('Room progression covers all four stages',()=>assert.deepEqual([getProgressionStage(0,0,4),getProgressionStage(1,0,4),getProgressionStage(5,1,4),getProgressionStage(11,3,4)],[0,1,2,3]));
 const assets=Object.values(environmentAssets).flatMap(Object.values);
 check('Exactly 24 unique registry assets',()=>{assert.equal(assets.length,24);assert.equal(new Set(assets.map(a=>a.real)).size,24)});
 for(const asset of assets){const bytes=await readFile(`public${asset.real}`);check(`Valid WebP container: ${asset.id}`,()=>{assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP')});}
 console.log(`\n${checks} checks passed. This is a data/asset regression check, not browser or Android QA.`);
}finally{await rm(temp,{recursive:true,force:true})}
