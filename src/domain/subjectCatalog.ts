import type { CatalogSnapshot, SubjectCategory, SubjectItem, SubjectOption } from './types';

export const SUBJECT_CATALOG_VERSION = '2026-06-22-tw-top30-v1';

const categories: SubjectCategory[] = [
  ['animals','動物','高辨識度、適合誇張表情與肢體動作',1],['plants','花草植栽','柔和療癒、季節與自然題材',2],
  ['food','食物飲品','圓潤可愛、適合日常與節慶',3],['objects','生活物品','把熟悉用品擬人化成貼圖角色',4],
  ['people','人物原型','原創人物職業與生活角色',5],['fantasy','幻想自然','不依賴既有 IP 的原創幻想角色',6],
].map(([id,label,description,sortOrder])=>({id:String(id),label:String(label),description:String(description),sortOrder:Number(sortOrder)}));

type RawItem=[string,string,string,boolean?];
const raw:Record<string,RawItem[]>={
  animals:[
    ['cat','貓咪','an original round cat with readable ears and tail',true],['corgi','柯基犬','an original short-legged corgi with expressive ears',true],['rabbit','兔子','an original soft rabbit with long expressive ears',true],
    ['duck','小鴨','an original plump yellow duck with a simple beak',true],['chicken','小雞','an original tiny chicken with lively wings',true],['bear','小熊','an original round bear with a friendly silhouette',true],
    ['pig','小豬','an original pink pig with a round snout',true],['monkey','猴子','an original playful monkey with a curled tail',true],['frog','青蛙','an original green frog with large expressive eyes',true],
    ['golden-retriever','黃金獵犬','an original fluffy golden retriever'],['chihuahua','吉娃娃','an original tiny chihuahua with oversized ears'],['dachshund','臘腸狗','an original long-bodied dachshund'],
    ['shiba','柴犬','an original compact shiba dog'],['penguin','企鵝','an original round penguin'],['seal','海豹','an original soft baby seal'],['otter','水獺','an original cheerful otter'],
    ['hamster','倉鼠','an original tiny hamster with full cheeks'],['capybara','水豚','an original calm capybara'],['shark','鯊魚','an original friendly baby shark'],['jellyfish','水母','an original translucent jellyfish'],
    ['owl','貓頭鷹','an original wise round owl'],['fox','狐狸','an original warm-colored fox'],['tiger','老虎','an original friendly striped tiger'],['taiwan-black-bear','台灣黑熊','an original black bear with a white chest mark'],
  ],
  plants:[
    ['sunflower','向日葵','a cheerful anthropomorphic sunflower'],['daisy','小雛菊','a gentle anthropomorphic daisy'],['rose','玫瑰','an elegant original rose character'],['tulip','鬱金香','a rounded tulip character'],
    ['cherry-blossom','櫻花','an original cherry blossom spirit'],['lavender','薰衣草','a calming lavender bundle character'],['cactus','仙人掌','a soft-spined cute cactus'],['succulent','多肉植物','a plump succulent in a tiny pot'],
    ['mushroom','小蘑菇','an original spotted mushroom character'],['clover','幸運草','a four-leaf clover mascot'],['fern','蕨類','a curled young fern spirit'],['bamboo','小竹子','an original bamboo shoot character'],
    ['maple-leaf','楓葉','a warm autumn maple leaf character'],['sprout','小樹芽','a hopeful green sprout'],['bonsai','小盆栽','a miniature bonsai character'],['lotus','蓮花','a serene lotus character'],
    ['hydrangea','繡球花','a clustered hydrangea character'],['monstera','龜背芋','a bold monstera leaf mascot'],
  ],
  food:[
    ['egg','荷包蛋','a sunny fried egg character',true],['bread','吐司','a warm square toast character',true],['pudding','布丁','a jiggly caramel pudding'],['rice-ball','飯糰','a triangular rice ball character'],
    ['bubble-tea','珍珠奶茶','an original bubble tea cup'],['coffee','咖啡杯','a warm coffee cup character'],['cake','小蛋糕','a celebratory cake slice'],['dumpling','水餃','a plump dumpling character'],
    ['bao','小籠包','an original steaming soup dumpling'],['noodles','麵碗','a cozy noodle bowl'],['strawberry','草莓','a bright strawberry character'],['orange','橘子','a round citrus character'],
    ['watermelon','西瓜','a refreshing watermelon slice'],['avocado','酪梨','a soft avocado character'],['cookie','餅乾','a crisp cookie character'],['ice-cream','冰淇淋','a colorful ice cream scoop'],
    ['mochi','麻糬','a stretchy rice cake character'],['pineapple-cake','鳳梨酥','an original square pineapple pastry'],
  ],
  objects:[
    ['phone','手機','an original anthropomorphic smartphone'],['laptop','筆記型電腦','a friendly laptop character'],['mug','馬克杯','a cozy ceramic mug'],['pillow','枕頭','a sleepy soft pillow',true],
    ['alarm-clock','鬧鐘','an energetic alarm clock'],['umbrella','雨傘','a colorful umbrella character'],['backpack','背包','an adventurous backpack'],['shopping-bag','購物袋','a cheerful reusable shopping bag'],
    ['pencil','鉛筆','a hardworking pencil'],['notebook','筆記本','an expressive notebook'],['stamp','印章','an original office stamp character'],['camera','相機','a curious camera character'],
    ['headphones','耳機','a music-loving headphone character'],['game-controller','遊戲手把','an original game controller'],['lamp','小夜燈','a comforting bedside lamp'],['slipper','拖鞋','a lazy house slipper'],
    ['tissue-box','面紙盒','a helpful tissue box'],['delivery-box','紙箱','an original cardboard delivery box'],
  ],
  people:[
    ['office-worker','上班族','an original everyday office worker',true],['student','學生','an original diligent student'],['teacher','老師','an original friendly teacher'],['shopkeeper','店員','an original cheerful shop clerk'],
    ['engineer','工程師','an original focused engineer'],['designer','設計師','an original creative designer'],['cook','料理人','an original home cook'],['nurse','護理師','an original caring medical worker'],
    ['parent','家長','an original warm parent character'],['grandparent','活力長輩','an original energetic older adult'],['couple-avatar','情侶角色','an original affectionate couple character',true],['best-friend','好友角色','an original pair of close friends'],
    ['homebody','宅家族','an original cozy homebody',true],['traveler','旅行者','an original curious traveler'],['athlete','運動愛好者','an original energetic sports fan'],['gardener','園藝愛好者','an original gentle gardener'],
  ],
  fantasy:[
    ['cloud-spirit','雲朵精靈','an original fluffy cloud spirit'],['star-spirit','星星精靈','an original glowing star spirit'],['moon-rabbit','月光小獸','an original moonlit long-eared creature'],['tiny-dragon','迷你龍','an original tiny friendly dragon'],
    ['forest-spirit','森林精靈','an original leafy forest spirit'],['water-spirit','水滴精靈','an original translucent water-drop spirit'],['fire-spirit','火焰精靈','an original warm flame spirit'],['stone-golem','石頭小巨人','an original gentle pebble golem'],
    ['rainbow-creature','彩虹小獸','an original colorful fantasy creature'],['dream-blob','夢境軟泥','an original soft dream blob'],['paper-ghost','紙片幽靈','an original harmless paper ghost'],['sock-monster','襪子怪','an original mismatched sock creature'],
    ['planet-baby','行星寶寶','an original tiny planet character'],['comet-child','彗星小孩','an original comet-tailed childlike spirit'],['tea-fairy','茶香精靈','an original tea-leaf fairy'],['clockwork-pet','發條寵物','an original small clockwork animal'],
  ],
};

const items:SubjectItem[]=Object.entries(raw).flatMap(([categoryId,values])=>values.map(([id,label,prompt,trend=false],index)=>({id,categoryId,label,prompt,trend,sortOrder:(trend?0:100)+index})));
const option=(values:[string,string,string,boolean?][]):SubjectOption[]=>values.map(([id,label,prompt,trend])=>({id,label,prompt,trend}));
const roles=option([
  ['none','不指定',''],['office-life','社畜上班族','living through relatable office work and overtime',true],['student-life','校園學生','living through everyday school moments'],['couple-life','甜蜜情侶','sharing affectionate couple interactions',true],
  ['family-life','溫暖家人','sharing supportive family moments'],['home-life','宅家日常','enjoying a relaxed homebody routine',true],['traveler','旅行冒險','exploring places as a cheerful traveler'],['shop-clerk','親切店員','working as a friendly shop clerk'],
  ['creator','創作者','working as an imaginative creator'],['foodie','美食愛好者','enthusiastically enjoying food'],['fitness','運動生活','living an energetic fitness lifestyle'],['healer','療癒陪伴','comforting and encouraging friends'],
]);
const personalities=option([
  ['lazy','慵懶','relaxed, sleepy and adorably unhurried',true],['dramatic','反應誇張','highly expressive with exaggerated reactions',true],['funny','幽默搞笑','playful with harmless visual comedy',true],['sweet','溫柔甜美','warm, gentle and affectionate'],
  ['optimistic','正向有活力','bright, optimistic and energetic'],['shy','害羞內向','shy with subtle reactions'],['grumpy','厭世吐槽','dryly grumpy but still lovable'],['polite','有禮貌','polite and considerate'],
  ['confident','自信','confident and encouraging'],['clumsy','天然呆','innocently clumsy and absent-minded'],['cool','冷靜帥氣','calm and effortlessly cool'],['healing','療癒','soft, reassuring and comforting'],
  ['mischievous','調皮','mischievous without being mean'],['romantic','浪漫','openly affectionate and romantic'],
]);
const props=option([
  ['none','不指定',''],['phone','手機','a generic unbranded smartphone'],['laptop','筆電','a generic unbranded laptop'],['coffee','咖啡','a warm coffee mug'],['bubble-tea','珍奶','a generic bubble tea cup'],
  ['pillow','枕頭','a soft pillow'],['blanket','毛毯','a cozy blanket'],['umbrella','雨傘','a simple umbrella'],['backpack','背包','a compact backpack'],['flower','花束','a small seasonal flower bouquet'],
  ['snack','零食','a generic snack bag without logos'],['book','書本','a plain book'],['headphones','耳機','generic headphones'],['sign','手拿牌','a blank handheld sign'],['heart','愛心','simple floating heart symbols'],['sparkle','閃光','small decorative sparkles'],
]);

const snapshot:CatalogSnapshot={version:SUBJECT_CATALOG_VERSION,generatedAt:'2026-06-22T00:00:00+08:00',sourceLabel:'LINE STORE 台灣熱門前30題材人工摘要（不含品牌與角色名稱）',categories,items,roles,personalities,props};
export function getSubjectCatalog():CatalogSnapshot{return snapshot;}
