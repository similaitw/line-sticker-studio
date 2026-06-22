import { assertReferencePhotoCapacity, isDuplicateReferencePhoto, validateReferencePhotoFile } from './referencePhotos';
import type { ReferencePhoto } from '../domain/types';

describe('參考照片限制',()=>{
  it('允許第 1 到第 5 張並拒絕第 6 張',()=>{expect(()=>assertReferencePhotoCapacity(0,5)).not.toThrow();expect(()=>assertReferencePhotoCapacity(5,1)).toThrow('最多 5 張');});
  it('拒絕錯誤格式與超過 20 MB',()=>{expect(()=>validateReferencePhotoFile({name:'a.gif',type:'image/gif',size:1})).toThrow('只支援');expect(()=>validateReferencePhotoFile({name:'a.png',type:'image/png',size:20*1024*1024+1})).toThrow('20 MB');});
  it('以雜湊判斷重複照片',()=>{const photo={id:'1',name:'a.png',type:'image/png',width:1,height:1,bytes:1,hash:'same',order:0,primary:true} satisfies ReferencePhoto;expect(isDuplicateReferencePhoto('same',[photo])).toBe(true);});
});
