import type {Decomposition,GroupInput} from '../types'
export function symmetricDecomposition(groups:GroupInput[]):Decomposition{
 const factors=groups.flatMap(g=>{const dc=g.ctr2-g.ctr1,dd=g.share2-g.share1;return[
  {groupId:g.id,groupName:g.name,type:'ctr' as const,value:dc*(g.share1+g.share2)/2},
  {groupId:g.id,groupName:g.name,type:'share' as const,value:dd*(g.ctr1+g.ctr2)/2}]})
 return {factors,steps:[
  {id:'raw',kind:'raw',title:'Исходные данные',description:'Сравниваем структуру показов и CTR двух периодов.'},
  {id:'contrib',kind:'contrib',title:'Вклад групп в общий CTR',description:'Доля и CTR каждой группы сходятся в её вклад: Cᵢ × Dᵢ.'},
  {id:'delta',kind:'delta',title:'Общее изменение',description:'T₂ − T₁ — величина, которую нужно разложить.'},
  {id:'expand',kind:'expand',title:'Раскрываем произведение',description:'Для каждой группы выделяем чистые и смешанный члены.',formula:'ΔTᵢ = ΔCᵢDᵢ₁ + Cᵢ₁ΔDᵢ + ΔCᵢΔDᵢ'},
  {id:'mixed',kind:'mixed',title:'Делим смешанный член',description:'ΔCᵢΔDᵢ поровну относится к двум одновременным изменениям.',formula:'ΔCᵢΔDᵢ = ½ΔCᵢΔDᵢ + ½ΔCᵢΔDᵢ'},
  {id:'parallel',kind:'factors',title:'Все группы — независимо',description:'Порядок и опорная категория не нужны.',formula:'CTR: ΔCᵢ(Dᵢ₁+Dᵢ₂)/2   ·   Share: ΔDᵢ(Cᵢ₁+Cᵢ₂)/2'},
  {id:'chart',kind:'chart',title:'Собираем изменение',description:'Все компоненты сходятся в фактическое ΔCTR.'}]}
}
