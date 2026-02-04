/* ====================
   전투 시스템
   ==================== */

let currentEnemy = null;
let isPlayerTurn = true;
let combatEnded = false;
let isDefending = false;
let dragonCooldown = 0;

// 전투 시작
function startCombat(enemyId) {
    const enemyData = ENEMIES[enemyId];
    if (!enemyData) return;

    // 적 데이터 복사
    currentEnemy = {
        ...enemyData,
        hp: enemyData.maxHp
    };

    // 전투 상태 초기화
    isPlayerTurn = true;
    combatEnded = false;
    isDefending = false;
    dragonCooldown = gameState.dragon.skillCooldown;

    // UI 초기화
    updateCombatUI();
    clearCombatLog();
    addCombatLog(`${currentEnemy.name}이(가) 나타났다!`, 'info');

    // 전투 화면 표시
    showScreen('combat');
    updateCombatButtons();
}

// 전투 UI 업데이트
function updateCombatUI() {
    // 적 정보
    document.getElementById('enemy-name').textContent = currentEnemy.name;
    document.getElementById('enemy-hp-text').textContent = `${currentEnemy.hp}/${currentEnemy.maxHp}`;
    document.getElementById('enemy-hp-fill').style.width = `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%`;
    document.getElementById('enemy-sprite').textContent = currentEnemy.icon;

    // 플레이어 정보
    document.getElementById('combat-hp').textContent = `${gameState.player.hp}/${gameState.player.maxHp}`;
    document.getElementById('player-combat-sprite').textContent = getPlayerSprite();

    // 드래곤
    document.getElementById('dragon-combat').textContent = '🐉';

    // 주사위 초기화
    document.getElementById('dice-result').textContent = '';
}

// 전투 버튼 업데이트
function updateCombatButtons() {
    const attackBtn = document.getElementById('attack-btn');
    const defendBtn = document.getElementById('defend-btn');
    const dragonBtn = document.getElementById('dragon-skill-btn');
    const fleeBtn = document.getElementById('flee-btn');

    const canAct = isPlayerTurn && !combatEnded;

    attackBtn.disabled = !canAct;
    defendBtn.disabled = !canAct;
    fleeBtn.disabled = !canAct;

    // 드래곤 스킬 쿨다운
    if (dragonCooldown > 0) {
        dragonBtn.disabled = true;
        dragonBtn.textContent = `🔥 (${dragonCooldown})`;
        dragonBtn.classList.add('cooldown');
    } else {
        dragonBtn.disabled = !canAct;
        dragonBtn.textContent = '🔥 드래곤';
        dragonBtn.classList.remove('cooldown');
    }
}

// 주사위 굴리기
async function rollDice() {
    return new Promise(resolve => {
        const dice = document.getElementById('dice');
        const result = document.getElementById('dice-result');

        dice.classList.add('rolling');
        result.textContent = '';

        // 애니메이션 효과
        let rolls = 0;
        const maxRolls = 10;
        const rollInterval = setInterval(() => {
            const tempRoll = Math.floor(Math.random() * 6) + 1;
            dice.textContent = getDiceEmoji(tempRoll);
            rolls++;

            if (rolls >= maxRolls) {
                clearInterval(rollInterval);
                const finalRoll = Math.floor(Math.random() * 6) + 1;
                dice.textContent = getDiceEmoji(finalRoll);
                dice.classList.remove('rolling');
                result.textContent = finalRoll;
                resolve(finalRoll);
            }
        }, 50);
    });
}

// 주사위 이모지
function getDiceEmoji(num) {
    const diceEmoji = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return diceEmoji[num - 1] || '🎲';
}

// 플레이어 공격
async function playerAttack() {
    if (!isPlayerTurn || combatEnded) return;

    isPlayerTurn = false;
    isDefending = false;
    updateCombatButtons();

    const roll = await rollDice();
    const weaponBonus = getWeaponBonus();
    const totalAttack = gameState.player.attack + weaponBonus + roll;

    addCombatLog(`주사위: ${roll} + 공격력: ${gameState.player.attack + weaponBonus} = ${totalAttack}`, 'info');

    // 적 방어력 계산
    const damage = Math.max(1, totalAttack - currentEnemy.defense);
    currentEnemy.hp = Math.max(0, currentEnemy.hp - damage);

    addCombatLog(`${currentEnemy.name}에게 ${damage} 데미지!`, 'damage');

    updateCombatUI();
    shakeElement(document.getElementById('enemy-sprite'));

    // 적 처치 확인
    if (currentEnemy.hp <= 0) {
        await endCombatVictory();
        return;
    }

    // 적 턴
    setTimeout(() => enemyTurn(), 1000);
}

// 플레이어 방어
async function playerDefend() {
    if (!isPlayerTurn || combatEnded) return;

    isPlayerTurn = false;
    isDefending = true;
    updateCombatButtons();

    addCombatLog('방어 자세를 취했다! (받는 데미지 절반)', 'info');

    // 적 턴
    setTimeout(() => enemyTurn(), 1000);
}

// 드래곤 스킬 사용
async function useDragonSkill() {
    if (!isPlayerTurn || combatEnded || dragonCooldown > 0) return;

    isPlayerTurn = false;
    isDefending = false;
    updateCombatButtons();

    const dragonLevel = gameState.dragon.level;
    let skillName = '불꽃 숨결';
    let damage = 3 + dragonLevel;

    addCombatLog(`🐉 ${gameState.dragon.name}의 ${skillName}!`, 'info');

    currentEnemy.hp = Math.max(0, currentEnemy.hp - damage);
    addCombatLog(`${currentEnemy.name}에게 ${damage} 데미지!`, 'damage');

    // 쿨다운 설정
    dragonCooldown = 3;
    gameState.dragon.skillCooldown = dragonCooldown;

    updateCombatUI();
    shakeElement(document.getElementById('enemy-sprite'));

    // 적 처치 확인
    if (currentEnemy.hp <= 0) {
        await endCombatVictory();
        return;
    }

    // 적 턴
    setTimeout(() => enemyTurn(), 1000);
}

// 도망 시도
async function attemptFlee() {
    if (!isPlayerTurn || combatEnded) return;

    isPlayerTurn = false;
    updateCombatButtons();

    const roll = await rollDice();

    if (roll >= 4) {
        addCombatLog('도망에 성공했다!', 'info');
        setTimeout(() => {
            combatEnded = true;
            showScreen('game');
        }, 1000);
    } else {
        addCombatLog('도망에 실패했다!', 'damage');
        setTimeout(() => enemyTurn(), 1000);
    }
}

// 적 턴
async function enemyTurn() {
    if (combatEnded) return;

    addCombatLog(`${currentEnemy.name}의 공격!`, 'info');

    await delay(500);

    let damage = currentEnemy.attack;

    // 방어 중이면 데미지 절반
    if (isDefending) {
        damage = Math.max(1, Math.floor(damage / 2));
        addCombatLog('방어로 데미지를 줄였다!', 'info');
    }

    // 방어력 적용
    const armorBonus = getArmorBonus();
    const actualDamage = Math.max(1, damage - gameState.player.defense - armorBonus);

    gameState.player.hp = Math.max(0, gameState.player.hp - actualDamage);
    addCombatLog(`${actualDamage} 데미지를 받았다!`, 'damage');

    updateCombatUI();
    updatePlayerInfo();
    shakeElement(document.getElementById('player-combat-sprite'));

    // 플레이어 사망 확인
    if (gameState.player.hp <= 0) {
        await endCombatDefeat();
        return;
    }

    // 쿨다운 감소
    if (dragonCooldown > 0) {
        dragonCooldown--;
        gameState.dragon.skillCooldown = dragonCooldown;
    }

    // 플레이어 턴
    isPlayerTurn = true;
    isDefending = false;
    updateCombatButtons();
    addCombatLog('당신의 턴!', 'info');
}

// 전투 승리
async function endCombatVictory() {
    combatEnded = true;
    updateCombatButtons();

    addCombatLog(`${currentEnemy.name}을(를) 쓰러뜨렸다!`, 'heal');

    await delay(1000);

    // 경험치 획득
    const expGained = currentEnemy.exp;
    addCombatLog(`경험치 +${expGained}`, 'heal');
    gainExp(expGained);

    // 아이템 드롭
    if (currentEnemy.drops && currentEnemy.drops.length > 0) {
        const dropChance = Math.random();
        if (dropChance < 0.5) {
            const dropId = currentEnemy.drops[Math.floor(Math.random() * currentEnemy.drops.length)];
            if (hasInventorySpace()) {
                addItem(dropId);
            }
        }
    }

    await delay(1500);

    // 게임 화면으로 복귀
    showScreen('game');
    renderMap();
}

// 전투 패배
async function endCombatDefeat() {
    combatEnded = true;
    updateCombatButtons();

    addCombatLog('쓰러졌다...', 'damage');

    await delay(2000);

    gameOver();
}

// 전투 로그 추가
function addCombatLog(message, type = 'info') {
    const log = document.getElementById('combat-log');
    const p = document.createElement('p');
    p.className = type;
    p.textContent = message;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}

// 전투 로그 초기화
function clearCombatLog() {
    const log = document.getElementById('combat-log');
    log.innerHTML = '';
}

// 흔들림 효과
function shakeElement(element) {
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 500);
}

// 딜레이 헬퍼
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
