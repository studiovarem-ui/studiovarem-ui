/* ====================
   메인 게임 로직
   ==================== */

// 현재 게임 상태
let gameState = JSON.parse(JSON.stringify(GameState));

// DOM 요소 캐싱
const screens = {
    title: document.getElementById('title-screen'),
    creation: document.getElementById('character-creation'),
    story: document.getElementById('story-screen'),
    game: document.getElementById('game-screen'),
    combat: document.getElementById('combat-screen')
};

const modals = {
    inventory: document.getElementById('inventory-modal'),
    gameMenu: document.getElementById('game-menu-modal')
};

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    updateAppearancePreviews();
    checkSavedGame();
});

// 이벤트 리스너 초기화
function initEventListeners() {
    // 타이틀 화면
    document.getElementById('new-game-btn').addEventListener('click', startNewGame);
    document.getElementById('load-game-btn').addEventListener('click', loadGame);

    // 캐릭터 생성
    document.querySelectorAll('.gender-btn').forEach(btn => {
        btn.addEventListener('click', (e) => selectGender(e.target.dataset.gender));
    });
    document.querySelectorAll('.appearance-option').forEach(opt => {
        opt.addEventListener('click', (e) => selectAppearance(e.currentTarget.dataset.appearance));
    });
    document.getElementById('start-adventure-btn').addEventListener('click', startAdventure);

    // 스토리 화면
    document.getElementById('continue-btn').addEventListener('click', continueStory);

    // 게임 화면
    document.getElementById('inventory-btn').addEventListener('click', openInventory);
    document.getElementById('status-btn').addEventListener('click', showStatus);
    document.getElementById('save-btn').addEventListener('click', saveGame);
    document.getElementById('game-menu-btn').addEventListener('click', openGameMenu);

    // 인벤토리 모달
    document.getElementById('close-inventory').addEventListener('click', closeInventory);

    // 게임 메뉴 모달
    document.getElementById('resume-btn').addEventListener('click', closeGameMenu);
    document.getElementById('save-game-btn').addEventListener('click', () => {
        saveGame();
        closeGameMenu();
    });
    document.getElementById('to-title-btn').addEventListener('click', goToTitle);

    // 전투 버튼
    document.getElementById('attack-btn').addEventListener('click', playerAttack);
    document.getElementById('defend-btn').addEventListener('click', playerDefend);
    document.getElementById('dragon-skill-btn').addEventListener('click', useDragonSkill);
    document.getElementById('flee-btn').addEventListener('click', attemptFlee);
}

// 화면 전환
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
}

// 저장된 게임 확인
function checkSavedGame() {
    const saved = localStorage.getItem('dragonQuest_save');
    const loadBtn = document.getElementById('load-game-btn');
    loadBtn.style.opacity = saved ? '1' : '0.5';
    loadBtn.disabled = !saved;
}

// 새 게임 시작
function startNewGame() {
    gameState = JSON.parse(JSON.stringify(GameState));
    showScreen('creation');
}

// 성별 선택
function selectGender(gender) {
    gameState.player.gender = gender;
    document.querySelectorAll('.gender-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.gender === gender);
    });
    updateAppearancePreviews();
}

// 외모 선택
function selectAppearance(appearance) {
    gameState.player.appearance = parseInt(appearance);
    document.querySelectorAll('.appearance-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.appearance === appearance);
    });
}

// 외모 미리보기 업데이트
function updateAppearancePreviews() {
    const gender = gameState.player.gender;
    const options = APPEARANCE_OPTIONS[gender];

    for (let i = 1; i <= 3; i++) {
        const preview = document.getElementById(`appearance-${i}`);
        preview.textContent = options[i];
    }
}

// 모험 시작
function startAdventure() {
    const nameInput = document.getElementById('player-name');
    const name = nameInput.value.trim();

    if (!name) {
        alert('이름을 입력해주세요!');
        return;
    }

    gameState.player.name = name;
    gameState.currentChapter = 0;
    gameState.currentScene = 0;

    // 프롤로그 시작
    showScreen('story');
    startStory(STORY_PROLOGUE, 0);
}

// 게임 저장
function saveGame() {
    const saveData = JSON.stringify(gameState);
    localStorage.setItem('dragonQuest_save', saveData);
    alert('게임이 저장되었습니다!');
}

// 게임 로드
function loadGame() {
    const saved = localStorage.getItem('dragonQuest_save');
    if (saved) {
        gameState = JSON.parse(saved);

        // 챕터에 따라 적절한 화면으로 이동
        if (gameState.currentChapter === 0) {
            showScreen('story');
            startStory(STORY_PROLOGUE, gameState.currentScene);
        } else {
            showScreen('game');
            initGameScreen();
        }
    }
}

// 타이틀로 이동
function goToTitle() {
    closeGameMenu();
    showScreen('title');
    checkSavedGame();
}

// 게임 화면 초기화
function initGameScreen() {
    updatePlayerInfo();
    updateDragonInfo();
    initMap();
}

// 플레이어 정보 업데이트
function updatePlayerInfo() {
    document.getElementById('player-name-display').textContent = gameState.player.name;
    document.getElementById('hp-text').textContent = `${gameState.player.hp}/${gameState.player.maxHp}`;
    document.getElementById('hp-fill').style.width = `${(gameState.player.hp / gameState.player.maxHp) * 100}%`;
    document.getElementById('chapter-info').textContent = `챕터 ${gameState.currentChapter}`;
}

// 드래곤 정보 업데이트
function updateDragonInfo() {
    const dragonInfo = document.querySelector('.dragon-info');
    dragonInfo.querySelector('.dragon-name').textContent = gameState.dragon.name;
    dragonInfo.querySelector('.dragon-level').textContent = `Lv.${gameState.dragon.level}`;
}

// 인벤토리 열기
function openInventory() {
    modals.inventory.classList.add('active');
    renderInventory();
}

// 인벤토리 닫기
function closeInventory() {
    modals.inventory.classList.remove('active');
}

// 게임 메뉴 열기
function openGameMenu() {
    modals.gameMenu.classList.add('active');
}

// 게임 메뉴 닫기
function closeGameMenu() {
    modals.gameMenu.classList.remove('active');
}

// 상태 표시
function showStatus() {
    const player = gameState.player;
    const dragon = gameState.dragon;

    const weaponBonus = gameState.equippedWeapon ? ITEMS[gameState.equippedWeapon].attack : 0;
    const armorBonus = gameState.equippedArmor ? ITEMS[gameState.equippedArmor].defense : 0;

    alert(`
=== ${player.name} ===
레벨: ${player.level}
HP: ${player.hp}/${player.maxHp}
공격력: ${player.attack} (+${weaponBonus})
방어력: ${player.defense} (+${armorBonus})
경험치: ${player.exp}

=== ${dragon.name} ===
레벨: ${dragon.level}
능력: ${dragon.abilities.join(', ')}
    `);
}

// HP 회복
function healPlayer(amount) {
    gameState.player.hp = Math.min(gameState.player.hp + amount, gameState.player.maxHp);
    updatePlayerInfo();
}

// HP 감소
function damagePlayer(amount) {
    const defense = gameState.player.defense + (gameState.equippedArmor ? ITEMS[gameState.equippedArmor].defense : 0);
    const actualDamage = Math.max(1, amount - defense);
    gameState.player.hp = Math.max(0, gameState.player.hp - actualDamage);
    updatePlayerInfo();
    return actualDamage;
}

// 경험치 획득
function gainExp(amount) {
    gameState.player.exp += amount;
    gameState.dragon.exp += Math.floor(amount / 2);

    checkLevelUp();
    checkDragonLevelUp();
}

// 레벨업 체크
function checkLevelUp() {
    const nextLevel = gameState.player.level + 1;
    if (LEVEL_TABLE[nextLevel] && gameState.player.exp >= LEVEL_TABLE[nextLevel].exp) {
        gameState.player.level = nextLevel;
        gameState.player.maxHp = LEVEL_TABLE[nextLevel].maxHp;
        gameState.player.hp = gameState.player.maxHp;
        gameState.player.attack = LEVEL_TABLE[nextLevel].attack;
        alert(`레벨 업! ${gameState.player.name}이(가) 레벨 ${nextLevel}이 되었습니다!`);
    }
}

// 드래곤 레벨업 체크
function checkDragonLevelUp() {
    const nextLevel = gameState.dragon.level + 1;
    if (DRAGON_LEVEL_TABLE[nextLevel] && gameState.dragon.exp >= DRAGON_LEVEL_TABLE[nextLevel].exp) {
        gameState.dragon.level = nextLevel;
        gameState.dragon.abilities = DRAGON_LEVEL_TABLE[nextLevel].abilities;
        alert(`${gameState.dragon.name}이(가) 레벨 ${nextLevel}이 되었습니다! 새 능력: ${gameState.dragon.abilities[gameState.dragon.abilities.length - 1]}`);
    }
}

// 아이템 획득
function addItem(itemId) {
    if (gameState.inventory.length >= 8) {
        alert('가방이 가득 찼습니다!');
        return false;
    }
    gameState.inventory.push(itemId);
    const item = ITEMS[itemId];
    alert(`${item.icon} ${item.name}을(를) 획득했습니다!`);
    return true;
}

// 아이템 사용
function useItem(index) {
    const itemId = gameState.inventory[index];
    const item = ITEMS[itemId];

    if (item.type === 'consumable') {
        healPlayer(item.healAmount);
        gameState.inventory.splice(index, 1);
        alert(`${item.name}을(를) 사용했습니다! HP가 ${item.healAmount} 회복되었습니다.`);
        renderInventory();
    } else if (item.type === 'weapon') {
        gameState.equippedWeapon = itemId;
        alert(`${item.name}을(를) 장비했습니다!`);
        renderInventory();
    } else if (item.type === 'armor') {
        gameState.equippedArmor = itemId;
        alert(`${item.name}을(를) 장비했습니다!`);
        renderInventory();
    }
}

// 플래그 설정
function setFlag(flag, value = true) {
    gameState.flags[flag] = value;
}

// 플래그 확인
function getFlag(flag) {
    return gameState.flags[flag] || false;
}

// 플레이어 스프라이트 가져오기
function getPlayerSprite() {
    return APPEARANCE_OPTIONS[gameState.player.gender][gameState.player.appearance];
}

// 챕터 완료
function completeChapter() {
    gameState.currentChapter++;

    if (CHAPTER_MAPS[gameState.currentChapter]) {
        alert(`챕터 ${gameState.currentChapter - 1} 완료! 다음 챕터로 이동합니다.`);
        initGameScreen();
    } else {
        alert('축하합니다! 게임을 클리어했습니다! (데모 버전 종료)');
        goToTitle();
    }
}

// 게임 오버
function gameOver() {
    alert('게임 오버... 다시 도전해보세요!');
    goToTitle();
}
