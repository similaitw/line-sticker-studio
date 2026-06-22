import { getSubjectCatalog, SUBJECT_CATALOG_VERSION } from './subjectCatalog';

describe('靜態角色題材庫',()=>{
  const catalog=getSubjectCatalog();
  it('提供版本化的 6 類與至少 100 個子項目',()=>{expect(catalog.version).toBe(SUBJECT_CATALOG_VERSION);expect(catalog.categories.length).toBeGreaterThanOrEqual(6);expect(catalog.items.length).toBeGreaterThanOrEqual(100);});
  it('類別與子項目 ID 唯一',()=>{expect(new Set(catalog.categories.map((item)=>item.id)).size).toBe(catalog.categories.length);expect(new Set(catalog.items.map((item)=>item.id)).size).toBe(catalog.items.length);});
  it('每類熱門題材優先排序且不含已知品牌角色名',()=>{for(const category of catalog.categories){const items=catalog.items.filter((item)=>item.categoryId===category.id).sort((a,b)=>Number(b.trend)-Number(a.trend)||a.sortOrder-b.sortOrder);const firstNonTrend=items.findIndex((item)=>!item.trend);expect(items.slice(Math.max(0,firstNonTrend)).some((item)=>item.trend)).toBe(false);}const content=JSON.stringify(catalog);for(const banned of ['Hello Kitty','Snoopy','海綿寶寶','小熊維尼','迪士尼','三麗鷗'])expect(content).not.toContain(banned);});
});
