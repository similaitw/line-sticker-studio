import { getSubjectCatalog } from './subjectCatalog';
import type { ReferencePhoto, SubjectProfile } from './types';

export const LEGACY_DEFAULT_CHARACTER = '一隻圓滾滾的台灣黑熊，上班族襯衫，表情誇張可愛';

export function cleanLegacyDefaultCharacter(value: string): string {
  return value.trim() === LEGACY_DEFAULT_CHARACTER ? '' : value;
}

export function buildSubjectDescription(profile: SubjectProfile, photos: ReferencePhoto[]): string {
  const catalog = getSubjectCatalog(); const parts: string[] = [];
  if (photos.length) {
    const ordered = [...photos].sort((a,b)=>a.order-b.order); const primary = ordered.find((photo)=>photo.primary) ?? ordered[0];
    parts.push(`Use the uploaded reference photos as the only appearance source, with ${primary.name} as the primary reference.`);
    parts.push('Do not use a default character, catalog subject or prior conversation character. If a photo cannot be read, stop and ask for it to be re-uploaded instead of generating a substitute. Analyze only visible, non-sensitive appearance: facial structure, hairstyle or fur pattern, colors, clothing and body proportions. Preserve recognizable visual traits consistently while converting the subject into an original LINE sticker character. Never turn a person into an animal unless explicitly requested. Ignore photo backgrounds. Do not infer identity, ethnicity, health, religion or other sensitive attributes.');
  } else if (profile.baseMode === 'custom') {
    const subject = profile.customSubject.trim(); parts.push(`Create an original LINE sticker subject based on this description: ${subject || 'a friendly original character'}.`);
  } else {
    const item = catalog.items.find((entry)=>entry.id===profile.itemId && entry.categoryId===profile.categoryId) ?? catalog.items[0];
    parts.push(`Create ${item.prompt}. Keep the design original, readable at sticker size and distinct from existing commercial characters.`);
  }
  const role = catalog.roles.find((entry)=>entry.id===profile.roleId); if(role?.prompt)parts.push(`Role and daily context: ${role.prompt}.`);
  const personalities = profile.personalityIds.slice(0,2).map((id)=>catalog.personalities.find((entry)=>entry.id===id)?.prompt).filter(Boolean); if(personalities.length)parts.push(`Personality: ${personalities.join('; ')}.`);
  const props = profile.propIds.slice(0,2).map((id)=>catalog.props.find((entry)=>entry.id===id)?.prompt).filter(Boolean); if(props.length)parts.push(`Optional recurring props: ${props.join('; ')}.`);
  const extraDetails = photos.length ? cleanLegacyDefaultCharacter(profile.extraDetails) : profile.extraDetails;
  if(extraDetails.trim())parts.push(`Additional creator direction: ${extraDetails.trim()}.`);
  parts.push('Do not imitate named artists, brands, logos, trademarks or protected characters.');
  return parts.join(' ');
}

export function validateSubjectProfile(profile: SubjectProfile, hasPhotos: boolean): string[] {
  const catalog=getSubjectCatalog(),issues:string[]=[];
  if(profile.personalityIds.length>2)issues.push('個性最多選擇 2 個');
  if(profile.propIds.length>2)issues.push('道具最多選擇 2 個');
  if(!catalog.roles.some((item)=>item.id===profile.roleId))issues.push('角色設定不存在');
  if(profile.personalityIds.some((id)=>!catalog.personalities.some((item)=>item.id===id)))issues.push('包含不存在的個性設定');
  if(profile.propIds.some((id)=>!catalog.props.some((item)=>item.id===id)))issues.push('包含不存在的道具設定');
  if(!hasPhotos){
    if(profile.baseMode==='custom'&&!profile.customSubject.trim())issues.push('請輸入自訂主體');
    if(profile.baseMode==='catalog'&&!catalog.items.some((item)=>item.categoryId===profile.categoryId&&item.id===profile.itemId))issues.push('請選擇有效的題材子項目');
  }
  return issues;
}
