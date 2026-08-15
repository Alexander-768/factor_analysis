export type GroupInput={id:string;name:string;share1:number;share2:number;ctr1:number;ctr2:number}
export type FactorContribution={groupId:string;groupName:string;type:'ctr'|'share';value:number}
export type SimulationStep={id:string;title:string;description:string;formula?:string;groupId?:string;kind:string}
export type Decomposition={factors:FactorContribution[];steps:SimulationStep[];meta?:Record<string,unknown>}
