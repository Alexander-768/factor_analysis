import type {Decomposition,GroupInput} from '../types'
export function referenceDecomposition(groups:GroupInput[],referenceId:string):Decomposition{
 const ref=groups.find(g=>g.id===referenceId)??groups[groups.length-1]; const rc=(ref.ctr1+ref.ctr2)/2
 const factors=groups.flatMap(g=>{const dc=g.ctr2-g.ctr1,dd=g.share2-g.share1,avg=(g.ctr1+g.ctr2)/2;return[
  {groupId:g.id,groupName:g.name,type:'ctr' as const,value:dc*(g.share1+g.share2)/2},
  {groupId:g.id,groupName:g.name,type:'share' as const,value:g.id===ref.id?0:dd*(avg-rc)}]})
 return {factors,meta:{referenceId:ref.id},steps:[
  {id:'raw',kind:'raw',title:'Исходные данные',description:'Сравниваем структуру показов и CTR двух периодов.'},
  {id:'contrib',kind:'contrib',title:'Вклад групп в общий CTR',description:'Cᵢ × Dᵢ превращается во вклад каждой группы.'},
  {id:'delta',kind:'delta',title:'Общее изменение',description:'Фиксируем фактическое T₂ − T₁.'},
  {id:'averages',kind:'averages',title:'Средние значения',description:'Строим средние CTR и доли между периодами.',formula:'C̄ᵢ=(Cᵢ₁+Cᵢ₂)/2; D̄ᵢ=(Dᵢ₁+Dᵢ₂)/2'},
  {id:'ctr',kind:'ctr',title:'Влияние изменения CTR',description:'CTR-компоненты считаются для всех групп параллельно.',formula:'ΔTᵢ,ctr=ΔCᵢ·D̄ᵢ'},
  {id:'reference',kind:'reference',title:`Опорная группа: ${ref.name}`,description:'Её средний CTR становится линией отсчёта.',formula:'ΔTᵢ,share=ΔDᵢ(C̄ᵢ−C̄ref)'},
  {id:'meaning',kind:'meaning',title:'Как читать результат',description:'Это эффект относительно базы, а не буквальный поток показов к ней.'},
  {id:'chart',kind:'chart',title:'Собираем изменение',description:'Сумма компонентов точно возвращает ΔCTR.'}]}
}
