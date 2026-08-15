import type {GroupInput} from '../types'
export const total=(g:GroupInput[],p:1|2)=>g.reduce((s,x)=>s+x[`share${p}`]*x[`ctr${p}`],0)
export const common=(g:GroupInput[])=>({t1:total(g,1),t2:total(g,2),delta:total(g,2)-total(g,1)})
export const sumFactors=(f:{value:number}[])=>f.reduce((s,x)=>s+x.value,0)
