import type {Decomposition,GroupInput,FactorContribution,SimulationStep} from '../types'
import {common,sumFactors} from './calculateCommon'
const weighted=(gs:GroupInput[],p:1|2)=>{const d=gs.reduce((s,g)=>s+g[`share${p}`],0);return d?gs.reduce((s,g)=>s+g[`share${p}`]*g[`ctr${p}`],0)/d:0}
export function calculateSequentialDecomposition(groups:GroupInput[],order:string[]):Decomposition{
 const sorted=order.map(id=>groups.find(g=>g.id===id)).filter(Boolean) as GroupInput[]; const factors:FactorContribution[]=[]; const steps:SimulationStep[]=[
  {id:'raw',kind:'raw',title:'Исходные данные',description:'Сравниваем структуру показов и CTR двух периодов.'},{id:'contrib',kind:'contrib',title:'Вклад групп в общий CTR',description:'Cᵢ × Dᵢ превращается во вклад каждой группы.'},{id:'delta',kind:'delta',title:'Общее изменение',description:'Фиксируем фактическое T₂ − T₁.'}]
 sorted.forEach((g,i)=>{const current=sorted.slice(i),rest=sorted.slice(i+1),s1=current.reduce((s,x)=>s+x.share1,0),s2=current.reduce((s,x)=>s+x.share2,0),scale=(s1+s2)/2;const d1=g.share1/s1,d2=g.share2/s2,dc=g.ctr2-g.ctr1
  if(!rest.length){const remaining=common(groups).delta-sumFactors(factors);factors.push({groupId:g.id,groupName:g.name,type:'ctr',value:remaining},{groupId:g.id,groupName:g.name,type:'share',value:0});steps.push({id:`last-${g.id}`,kind:'recursive',groupId:g.id,title:`Последняя группа: ${g.name}`,description:'Внутренняя доля равна 1; оставшаяся часть изменения относится к CTR, share-эффект равен нулю.',formula:`ΔT${g.name},ctr = ΔT − сумма уже выделенных компонентов`});return}
  const n1=weighted(rest,1),n2=weighted(rest,2),ctr=dc*(d1+d2)/2*scale,share=(d2-d1)*((g.ctr1+g.ctr2)/2-(n1+n2)/2)*scale
  factors.push({groupId:g.id,groupName:g.name,type:'ctr',value:ctr},{groupId:g.id,groupName:g.name,type:'share',value:share})
  steps.push({id:`split-${g.id}`,kind:'recursive',groupId:g.id,title:`Выделяем ${g.name}`,description:`${g.name} отделяется от остатка ${rest.map(x=>x.name).join(' + ')}.`,formula:`C̄${g.name} сравнивается с C̄ остатка`},{id:`effects-${g.id}`,kind:'factors',groupId:g.id,title:`Компоненты ${g.name}`,description:`Локальный результат масштабируется на среднюю долю текущего остатка ${scale.toFixed(4)}.`,formula:'CTR: ΔC·(D*₁+D*₂)/2·scale; Share: ΔD*·(C̄ᵢ−C̄остатка)·scale'}) })
 steps.push({id:'chart',kind:'chart',title:'Собираем изменение',description:'Все рассчитанные компоненты сходятся в фактическое ΔCTR.'})
 return {factors,steps,meta:{order}}
}

// Backwards-compatible name for existing imports. The calculation itself always
// receives the order explicitly and rebuilds factors and steps from that order.
export const sequentialDecomposition=calculateSequentialDecomposition
