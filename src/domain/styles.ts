import type { StyleRecipe } from './types';

export interface StyleOption { id: string; label: string; prompt: string }

export const STYLE_OPTIONS: Record<keyof StyleRecipe, StyleOption[]> = {
  primary: [
    ['mascot','吉祥物粗描邊','clean mascot sticker'],['chibi','日系可愛 Q 版','kawaii chibi character'],
    ['manga','漫畫動態','expressive comic illustration'],['vector','扁平向量','clean flat vector illustration'],
    ['lineart','手繪線稿','friendly hand-drawn line art'],['watercolor','透明水彩','soft watercolor illustration'],
    ['crayon','蠟筆童趣','playful crayon illustration'],['pixel','像素藝術','crisp pixel art sticker'],
    ['retro','復古普普','retro pop graphic'],['taiwan-retro','台灣懷舊','Taiwanese nostalgic graphic'],
    ['clay','3D 黏土','3D clay figure'],['plush','毛絨玩偶','soft plush toy'],
    ['vinyl','軟膠公仔','designer vinyl toy'],['papercut','立體剪紙','layered paper cut craft'],
    ['lowpoly','低多邊形','cute low-poly 3D'],['ink','黑白墨線','bold monochrome ink drawing'],
  ].map(([id,label,prompt]) => ({id,label,prompt})),
  palette: [
    ['vivid','鮮豔','vivid balanced colors'],['pastel','粉彩','gentle pastel palette'],['morandi','莫蘭迪','muted Morandi palette'],
    ['warm','暖色','warm color palette'],['cool','冷色','cool color palette'],['mono','單色','cohesive monochrome palette'],
    ['contrast','高對比','high contrast accessible palette'],
  ].map(([id,label,prompt]) => ({id,label,prompt})),
  outline: [
    ['bold','粗描邊','bold clean outline'],['thin','細描邊','thin precise outline'],['white','白色貼紙邊','white sticker border'],
    ['double','雙層描邊','double-layer sticker outline'],['none','無描邊','no visible outline'],
  ].map(([id,label,prompt]) => ({id,label,prompt})),
  rendering: [
    ['soft','柔和陰影','soft minimal shading'],['flat','平塗','flat color rendering'],['cel','賽璐璐','clean cel shading'],
    ['gradient','漸層','subtle gradient shading'],['texture','材質顆粒','subtle tactile texture'],
  ].map(([id,label,prompt]) => ({id,label,prompt})),
  shape: [
    ['rounded','圓潤','rounded friendly proportions'],['mini','迷你比例','tiny compact proportions'],['bighead','大頭短身','large head and short body'],
    ['expressive','誇張表情','highly expressive face and pose'],['simple','簡潔輪廓','simple readable silhouette'],
  ].map(([id,label,prompt]) => ({id,label,prompt})),
};

export function stylePrompt(recipe: StyleRecipe): string {
  return (Object.keys(recipe) as (keyof StyleRecipe)[]).map((key) =>
    STYLE_OPTIONS[key].find((option) => option.id === recipe[key])?.prompt,
  ).filter(Boolean).join(', ');
}
