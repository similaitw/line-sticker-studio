import { toggleCandidateSelection } from './candidates';
import type { StickerAsset } from './types';

const asset=(index:number):StickerAsset=>({id:String(index),name:`${index}.png`,dataUrl:'',width:370,height:320,bytes:1,hasTransparency:true,provenanceMark:'none',gridIndex:index,included:index<8,selectedAt:index<8?index+1:undefined});
describe('候選貼圖選取',()=>{
  it('選滿時以新候選替換最近入選者',()=>{const next=toggleCandidateSelection(Array.from({length:9},(_,index)=>asset(index)),'8',8);expect(next.filter((item)=>item.included)).toHaveLength(8);expect(next[7].included).toBe(false);expect(next[8].included).toBe(true);});
  it('取消入選後允許少於目標數量',()=>{const next=toggleCandidateSelection(Array.from({length:9},(_,index)=>asset(index)),'0',8);expect(next.filter((item)=>item.included)).toHaveLength(7);});
});
