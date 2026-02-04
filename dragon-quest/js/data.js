/* ====================
   게임 데이터
   ==================== */

// 게임 상태
const GameState = {
    player: {
        name: '',
        gender: 'boy',
        appearance: 1,
        hp: 10,
        maxHp: 10,
        attack: 1,
        defense: 0,
        exp: 0,
        level: 1
    },
    dragon: {
        name: '아기 드래곤',
        level: 1,
        exp: 0,
        skillCooldown: 0,
        abilities: ['불꽃 숨결']
    },
    inventory: [],
    equippedWeapon: null,
    equippedArmor: null,
    currentChapter: 0,
    currentScene: 0,
    currentPosition: { row: 2, col: 2 },
    exploredTiles: [],
    flags: {},
    playTime: 0
};

// 아이템 데이터
const ITEMS = {
    wooden_stick: {
        id: 'wooden_stick',
        name: '나무 막대기',
        type: 'weapon',
        icon: '🏏',
        description: '숲에서 주운 단단한 나무 막대기.',
        attack: 1,
        defense: 0
    },
    old_sword: {
        id: 'old_sword',
        name: '낡은 검',
        type: 'weapon',
        icon: '⚔️',
        description: '녹이 슬었지만 아직 쓸만한 검.',
        attack: 2,
        defense: 0
    },
    bread: {
        id: 'bread',
        name: '빵',
        type: 'consumable',
        icon: '🍞',
        description: '맛있는 빵. HP를 3 회복한다.',
        healAmount: 3
    },
    apple: {
        id: 'apple',
        name: '사과',
        type: 'consumable',
        icon: '🍎',
        description: '신선한 사과. HP를 2 회복한다.',
        healAmount: 2
    },
    old_shield: {
        id: 'old_shield',
        name: '낡은 방패',
        type: 'armor',
        icon: '🛡️',
        description: '금이 갔지만 아직 쓸만한 방패.',
        attack: 0,
        defense: 1
    },
    torch: {
        id: 'torch',
        name: '횃불',
        type: 'tool',
        icon: '🔦',
        description: '어두운 곳을 밝혀주는 횃불.',
        effect: 'light'
    },
    herb: {
        id: 'herb',
        name: '약초',
        type: 'consumable',
        icon: '🌿',
        description: '치료 효과가 있는 약초. HP를 5 회복한다.',
        healAmount: 5
    },
    dragon_scale: {
        id: 'dragon_scale',
        name: '드래곤 비늘',
        type: 'quest',
        icon: '🔮',
        description: '엄마 드래곤의 것으로 보이는 비늘. 단서가 될 수 있다.',
        effect: 'quest'
    }
};

// 적 데이터
const ENEMIES = {
    angry_squirrel: {
        id: 'angry_squirrel',
        name: '화난 다람쥐',
        icon: '🐿️',
        hp: 4,
        maxHp: 4,
        attack: 1,
        defense: 0,
        exp: 5,
        drops: ['apple']
    },
    wild_dog: {
        id: 'wild_dog',
        name: '들개',
        icon: '🐕',
        hp: 6,
        maxHp: 6,
        attack: 2,
        defense: 0,
        exp: 10,
        drops: ['bread']
    },
    forest_wolf: {
        id: 'forest_wolf',
        name: '숲 늑대',
        icon: '🐺',
        hp: 8,
        maxHp: 8,
        attack: 3,
        defense: 1,
        exp: 20,
        drops: ['herb']
    },
    goblin: {
        id: 'goblin',
        name: '고블린',
        icon: '👺',
        hp: 7,
        maxHp: 7,
        attack: 2,
        defense: 1,
        exp: 15,
        drops: ['old_sword', 'bread']
    }
};

// 맵 타일 타입
const TILE_TYPES = {
    forest: { icon: '🌲', name: '숲', passable: true, events: ['combat', 'item', 'nothing'] },
    village: { icon: '🏠', name: '마을', passable: true, events: ['story', 'shop', 'rest'] },
    path: { icon: '🛤️', name: '길', passable: true, events: ['nothing', 'item'] },
    cave: { icon: '🕳️', name: '동굴', passable: true, events: ['combat', 'story', 'item'] },
    water: { icon: '🌊', name: '물', passable: false, events: [] },
    mountain: { icon: '⛰️', name: '산', passable: false, events: [] },
    fog: { icon: '❓', name: '미탐험', passable: true, events: [] }
};

// 챕터 1 맵 레이아웃 (5x5 Hex 맵)
const CHAPTER_MAPS = {
    0: { // 프롤로그 - 맵 없음, 스토리만
        name: '프롤로그',
        map: null
    },
    1: { // 챕터 1
        name: '첫 발걸음',
        map: [
            ['mountain', 'forest', 'forest', 'cave', 'mountain'],
            ['forest', 'forest', 'path', 'forest', 'forest'],
            ['forest', 'path', 'village', 'path', 'forest'],
            ['water', 'forest', 'path', 'forest', 'forest'],
            ['water', 'water', 'forest', 'forest', 'mountain']
        ],
        startPosition: { row: 2, col: 2 },
        events: {
            '0-3': { type: 'story', id: 'cave_hint' },
            '2-2': { type: 'story', id: 'village_start' }
        }
    }
};

// 스토리 데이터 - 프롤로그
const STORY_PROLOGUE = [
    {
        id: 'prologue_1',
        background: 'forest',
        text: '어느 화창한 봄날, 너는 마을 근처 숲에서 놀고 있었어.',
        choices: null,
        next: 'prologue_2'
    },
    {
        id: 'prologue_2',
        background: 'forest',
        text: '나무 사이로 쏟아지는 햇살이 따뜻했지. 새들도 노래하고 있었어.',
        choices: null,
        next: 'prologue_3'
    },
    {
        id: 'prologue_3',
        background: 'forest',
        text: '그때, 덤불 속에서 뭔가 반짝이는 게 보였어!',
        choices: [
            { text: '다가가서 살펴본다', next: 'prologue_4' },
            { text: '무서워서 멀리서 지켜본다', next: 'prologue_4b' }
        ],
        next: null
    },
    {
        id: 'prologue_4',
        background: 'forest',
        text: '용기를 내어 다가가 보니... 커다랗고 신비로운 알이 있었어! 무지갯빛으로 반짝이고 있었지.',
        choices: null,
        next: 'prologue_5'
    },
    {
        id: 'prologue_4b',
        background: 'forest',
        text: '멀리서 지켜보니... 뭔가 둥글고 큰 것이 반짝이고 있었어. 호기심을 참을 수 없어서 결국 다가갔지.',
        choices: null,
        next: 'prologue_5'
    },
    {
        id: 'prologue_5',
        background: 'forest',
        text: '"이게 뭘까...?" 너는 조심스럽게 알을 들어올렸어.',
        choices: [
            { text: '집으로 가져간다', next: 'prologue_6' },
            { text: '잠시 더 살펴본다', next: 'prologue_5b' }
        ],
        next: null
    },
    {
        id: 'prologue_5b',
        background: 'forest',
        text: '알에서 희미한 온기가 느껴졌어. 살아있는 것 같았지! 뭔가 특별한 알인 게 분명해.',
        choices: null,
        next: 'prologue_6'
    },
    {
        id: 'prologue_6',
        background: 'home',
        text: '집에 돌아와 알을 따뜻한 이불로 감싸주었어. 그날 밤, 이상한 꿈을 꿨지...',
        choices: null,
        next: 'prologue_7'
    },
    {
        id: 'prologue_7',
        background: 'home',
        text: '다음날 아침, 갑자기 "삐악!" 하는 소리가 들렸어!',
        choices: null,
        next: 'prologue_8'
    },
    {
        id: 'prologue_8',
        background: 'home',
        text: '알이 깨지면서... 작고 귀여운 아기 드래곤이 나왔어! 🐉',
        choices: null,
        next: 'prologue_9'
    },
    {
        id: 'prologue_9',
        background: 'home',
        text: '아기 드래곤이 너를 보며 반갑게 울었어. "삐약삐약~" 너를 엄마라고 생각하는 것 같았지!',
        choices: null,
        next: 'prologue_10'
    },
    {
        id: 'prologue_10',
        background: 'home',
        text: '하지만... 진짜 엄마 드래곤은 어디에 있을까? 아기 드래곤을 엄마에게 돌려보내야 할 것 같았어.',
        choices: [
            { text: '"걱정 마, 엄마를 찾아줄게!"', next: 'prologue_end' },
            { text: '"우리 같이 모험을 떠나자!"', next: 'prologue_end' }
        ],
        next: null
    },
    {
        id: 'prologue_end',
        background: 'home',
        text: '이렇게 너와 아기 드래곤의 모험이 시작되었어! 엄마 드래곤을 찾아 떠나자!',
        choices: null,
        next: null,
        endPrologue: true
    }
];

// 스토리 데이터 - 챕터 1
const STORY_CHAPTER1 = {
    village_start: [
        {
            id: 'village_1',
            background: 'village',
            text: '마을 광장에 도착했어. 사람들이 분주하게 움직이고 있었지.',
            choices: null,
            next: 'village_2'
        },
        {
            id: 'village_2',
            background: 'village',
            text: '마을 어르신이 너와 아기 드래곤을 신기하게 바라봤어.',
            choices: null,
            next: 'village_3'
        },
        {
            id: 'village_3',
            background: 'village',
            text: '"오호, 드래곤이라니! 북쪽 동굴에서 큰 드래곤을 봤다는 소문이 있단다."',
            choices: [
                { text: '"정말요? 더 자세히 알려주세요!"', next: 'village_4' },
                { text: '"감사합니다, 찾아볼게요!"', next: 'village_end' }
            ],
            next: null
        },
        {
            id: 'village_4',
            background: 'village',
            text: '"북쪽 숲을 지나면 동굴이 있지. 하지만 조심해라, 숲에는 위험한 짐승들이 있단다."',
            choices: null,
            next: 'village_5'
        },
        {
            id: 'village_5',
            background: 'village',
            text: '어르신이 낡은 막대기를 건네주었어. "이거라도 가져가거라. 도움이 될 거야."',
            choices: null,
            next: 'village_end',
            giveItem: 'wooden_stick'
        },
        {
            id: 'village_end',
            background: 'village',
            text: '이제 북쪽 동굴을 향해 모험을 시작할 시간이야!',
            choices: null,
            next: null,
            endScene: true
        }
    ],
    cave_hint: [
        {
            id: 'cave_1',
            background: 'cave',
            text: '동굴 입구에 도착했어. 안에서 희미한 빛이 새어나오고 있었지.',
            choices: null,
            next: 'cave_2'
        },
        {
            id: 'cave_2',
            background: 'cave',
            text: '아기 드래곤이 갑자기 흥분하기 시작했어! "삐약삐약!" 뭔가 느끼는 것 같았어.',
            choices: [
                { text: '동굴 안으로 들어간다', next: 'cave_3' },
                { text: '잠시 주변을 살펴본다', next: 'cave_3b' }
            ],
            next: null
        },
        {
            id: 'cave_3',
            background: 'cave',
            text: '동굴 안으로 들어가자... 벽에 커다란 발자국이 있었어! 분명 드래곤의 것이야!',
            choices: null,
            next: 'cave_4'
        },
        {
            id: 'cave_3b',
            background: 'cave',
            text: '동굴 입구 근처에서 반짝이는 비늘 하나를 발견했어! 드래곤의 비늘인 것 같아.',
            choices: null,
            next: 'cave_4',
            giveItem: 'dragon_scale'
        },
        {
            id: 'cave_4',
            background: 'cave',
            text: '갑자기 동굴 깊은 곳에서 으르렁거리는 소리가 들렸어...',
            choices: null,
            next: 'cave_5'
        },
        {
            id: 'cave_5',
            background: 'cave',
            text: '하지만 아직 여기를 탐험하기엔 준비가 부족한 것 같아. 나중에 다시 와야겠어.',
            choices: null,
            next: null,
            endScene: true,
            setFlag: { cave_discovered: true }
        }
    ]
};

// 랜덤 이벤트
const RANDOM_EVENTS = {
    forest: [
        {
            type: 'combat',
            enemies: ['angry_squirrel', 'wild_dog'],
            text: '숲 속에서 적이 나타났어!'
        },
        {
            type: 'item',
            items: ['apple', 'herb'],
            text: '숲 속에서 무언가를 발견했어!'
        },
        {
            type: 'nothing',
            text: '숲 속을 걸었지만 특별한 일은 없었어.'
        }
    ],
    path: [
        {
            type: 'item',
            items: ['bread', 'apple'],
            text: '길가에 떨어진 것을 발견했어!'
        },
        {
            type: 'nothing',
            text: '평화로운 길을 걸었어.'
        }
    ],
    cave: [
        {
            type: 'combat',
            enemies: ['goblin', 'forest_wolf'],
            text: '동굴에서 적이 나타났어!'
        },
        {
            type: 'item',
            items: ['old_sword', 'torch', 'herb'],
            text: '동굴에서 무언가를 발견했어!'
        }
    ]
};

// 외모 옵션 (플레이스홀더)
const APPEARANCE_OPTIONS = {
    boy: {
        1: '👦',
        2: '👦🏻',
        3: '👦🏽'
    },
    girl: {
        1: '👧',
        2: '👧🏻',
        3: '👧🏽'
    }
};

// 레벨업 테이블
const LEVEL_TABLE = {
    1: { exp: 0, maxHp: 10, attack: 1 },
    2: { exp: 20, maxHp: 12, attack: 2 },
    3: { exp: 50, maxHp: 15, attack: 2 },
    4: { exp: 100, maxHp: 18, attack: 3 },
    5: { exp: 180, maxHp: 22, attack: 3 }
};

// 드래곤 레벨업 테이블
const DRAGON_LEVEL_TABLE = {
    1: { exp: 0, abilities: ['불꽃 숨결'] },
    2: { exp: 30, abilities: ['불꽃 숨결', '보호의 날개'] },
    3: { exp: 80, abilities: ['불꽃 숨결', '보호의 날개', '용의 포효'] }
};
