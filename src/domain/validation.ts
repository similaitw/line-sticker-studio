import { getSpec } from './specs';
import type { StickerProject, ValidationIssue } from './types';
import { validateSubjectProfile } from './subjectDescription';

const ONE_MB=1024*1024;
export function validateProject(project:StickerProject):ValidationIssue[]{const spec=getSpec(project.type);const issues:ValidationIssue[]=[];
  const cellCount=project.settings.rows*project.settings.columns;const selected=project.stickers.filter((asset)=>asset.included).sort((a,b)=>a.gridIndex-b.gridIndex);
  if(!spec.counts.includes(project.settings.count))issues.push({level:'error',code:'COUNT',message:`${spec.label}不支援 ${project.settings.count} 張`});
  if(project.settings.rows<2||project.settings.rows>8||project.settings.columns<2||project.settings.columns>8||cellCount<project.settings.count)issues.push({level:'error',code:'GRID',message:'生成網格須為 2–8 行列，且容量不可小於 LINE 入選張數'});
  if(project.captionSlots.length!==cellCount)issues.push({level:'error',code:'CAPTION_COUNT',message:`文字槽位須剛好 ${cellCount} 個，目前 ${project.captionSlots.length} 個`});
  if(project.stickers.length!==cellCount)issues.push({level:'error',code:'CANDIDATE_COUNT',message:`候選素材須為 ${cellCount} 張，目前 ${project.stickers.length} 張`});
  if(selected.length!==project.settings.count)issues.push({level:'error',code:'ASSET_COUNT',message:`須入選 ${project.settings.count} 張，目前 ${selected.length} 張`});
  if(!project.rightsConfirmed)issues.push({level:'error',code:'RIGHTS',message:'尚未確認著作權、肖像權、商標與非廣告用途'});
  for(const message of validateSubjectProfile(project.subjectProfile,project.referencePhotos.length>0))issues.push({level:'error',code:'SUBJECT_PROFILE',message});
  if(project.referencePhotos.length&&!project.photoRightsConfirmed)issues.push({level:'error',code:'PHOTO_RIGHTS',message:'尚未確認參考照片使用權及肖像同意'});
  for(const asset of selected){
    if(asset.width%2||asset.height%2)issues.push({level:'error',code:'EVEN_SIZE',message:'寬高必須是偶數',assetName:asset.name});
    if(asset.width>spec.width||asset.height>spec.height)issues.push({level:'error',code:'MAX_SIZE',message:`超過 ${spec.width}×${spec.height}`,assetName:asset.name});
    if(asset.bytes>=ONE_MB)issues.push({level:'error',code:'FILE_SIZE',message:'檔案須小於 1 MB',assetName:asset.name});
    if(!asset.hasTransparency)issues.push({level:'error',code:'TRANSPARENCY',message:'圖片沒有透明背景',assetName:asset.name});
    if(asset.provenanceMark==='visible')issues.push({level:'error',code:'PROVENANCE_MARK_DETECTED',message:'偵測到可見平台標記，請換用官方無可見標記下載或重新生成',assetName:asset.name});
    if(asset.provenanceMark==='unknown')issues.push({level:'warning',code:'PROVENANCE_UNKNOWN',message:'請人工確認右下角沒有浮水印、Logo 或簽名',assetName:asset.name});
    if(project.type==='big'&&(asset.width<(spec.minWidth??0)||asset.height<(spec.minHeight??0)))issues.push({level:'error',code:'MIN_SIZE',message:`低於 ${spec.minWidth}×${spec.minHeight}`,assetName:asset.name});
  }
  const hashes=new Map<string,string>();for(const asset of selected){if(!asset.visualHash)continue;const previous=hashes.get(asset.visualHash);if(previous)issues.push({level:'warning',code:'DUPLICATE_VISUAL',message:`與 ${previous} 視覺內容高度相似，請確認表情動作有足夠變化`,assetName:asset.name});else hashes.set(asset.visualHash,asset.name);}
  if(spec.animated&&selected.length){for(const asset of selected){const frames=project.animationSets[asset.id]??[];const duration=frames.reduce((sum,frame)=>sum+frame.delayMs,0);
    if(frames.length<(spec.minFrames??0)||frames.length>(spec.maxFrames??Infinity))issues.push({level:'error',code:'FRAME_COUNT',message:`動畫需有 ${spec.minFrames}–${spec.maxFrames} 幀`,assetName:asset.name});
    if(duration>(spec.maxDurationMs??Infinity))issues.push({level:'error',code:'DURATION',message:`動畫不可超過 ${(spec.maxDurationMs??0)/1000} 秒`,assetName:asset.name});}}
  if(!issues.some((issue)=>issue.level==='error'||issue.level==='warning'))issues.push({level:'success',code:'READY',message:'素材已通過所有可自動驗證的 LINE 規格'});
  return issues;
}
