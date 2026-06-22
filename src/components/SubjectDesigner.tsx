import { buildSubjectDescription } from '../domain/subjectDescription';
import { getSubjectCatalog } from '../domain/subjectCatalog';
import type { SubjectProfile } from '../domain/types';
import { useProject } from '../state/ProjectContext';

export function SubjectDesigner(){
  const {project,dispatch}=useProject(),catalog=getSubjectCatalog(),profile=project.subjectProfile,photoMode=project.referencePhotos.length>0;
  const items=catalog.items.filter((item)=>item.categoryId===profile.categoryId).sort((a,b)=>Number(b.trend)-Number(a.trend)||a.sortOrder-b.sortOrder);
  const update=(patch:Partial<SubjectProfile>)=>dispatch({type:'update',patch:{subjectProfile:{...profile,...patch,catalogVersion:catalog.version}}});
  const toggle=(key:'personalityIds'|'propIds',id:string)=>{const current=profile[key];if(current.includes(id))return update({[key]:current.filter((item)=>item!==id)});if(current.length>=2)return;update({[key]:[...current,id]});};
  const description=buildSubjectDescription(profile,project.referencePhotos);
  return <div className="subject-designer"><div className="subject-heading"><div><strong>角色題材</strong><small>{photoMode?'照片決定外觀，選項補充角色設定':`內建題材 · ${catalog.items.length} 個子項目`}</small></div><span>{photoMode?'照片模式':profile.baseMode==='catalog'?'內建題材':'自訂主體'}</span></div>
    {!photoMode&&<div className="mode-switch"><button className={profile.baseMode==='catalog'?'active':''} onClick={()=>update({baseMode:'catalog'})}>內建題材</button><button className={profile.baseMode==='custom'?'active':''} onClick={()=>update({baseMode:'custom'})}>自訂主體</button></div>}
    {!photoMode&&profile.baseMode==='catalog'&&<div className="field-grid"><label className="field"><span>類別</span><select value={profile.categoryId} onChange={(event)=>{const categoryId=event.target.value;const first=catalog.items.filter((item)=>item.categoryId===categoryId).sort((a,b)=>Number(b.trend)-Number(a.trend)||a.sortOrder-b.sortOrder)[0];update({categoryId,itemId:first.id});}}>{catalog.categories.sort((a,b)=>a.sortOrder-b.sortOrder).map((item)=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <label className="field"><span>子項目</span><select value={profile.itemId} onChange={(event)=>update({itemId:event.target.value})}>{items.map((item)=><option key={item.id} value={item.id}>{item.trend?'🔥 ':''}{item.label}</option>)}</select></label></div>}
    {!photoMode&&profile.baseMode==='custom'&&<label className="field"><span>自訂主體</span><input value={profile.customSubject} placeholder="例如：戴圓眼鏡的原創雲朵郵差" onChange={(event)=>update({customSubject:event.target.value})}/></label>}
    <label className="field"><span>角色設定</span><select value={profile.roleId} onChange={(event)=>update({roleId:event.target.value})}>{catalog.roles.map((item)=><option key={item.id} value={item.id}>{item.trend?'🔥 ':''}{item.label}</option>)}</select></label>
    <fieldset className="choice-group"><legend>個性（最多 2 個）</legend><div>{catalog.personalities.map((item)=><label className={profile.personalityIds.includes(item.id)?'selected':''} key={item.id}><input type="checkbox" checked={profile.personalityIds.includes(item.id)} disabled={!profile.personalityIds.includes(item.id)&&profile.personalityIds.length>=2} onChange={()=>toggle('personalityIds',item.id)}/>{item.trend?'🔥 ':''}{item.label}</label>)}</div></fieldset>
    <fieldset className="choice-group"><legend>道具（最多 2 個）</legend><div>{catalog.props.filter((item)=>item.id!=='none').map((item)=><label className={profile.propIds.includes(item.id)?'selected':''} key={item.id}><input type="checkbox" checked={profile.propIds.includes(item.id)} disabled={!profile.propIds.includes(item.id)&&profile.propIds.length>=2} onChange={()=>toggle('propIds',item.id)}/>{item.label}</label>)}</div></fieldset>
    <label className="field"><span>補充描述</span><textarea rows={3} value={profile.extraDetails} placeholder="例如：穿著淺藍襯衫、動作幅度大" onChange={(event)=>update({extraDetails:event.target.value})}/></label>
    <div className="subject-preview"><div><strong>產圖敘述預覽</strong><button onClick={()=>void navigator.clipboard.writeText(description)}>複製</button></div><p>{description}</p><small>題材資料：{catalog.sourceLabel} · {catalog.version}</small></div>
  </div>;
}
