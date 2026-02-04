/* ====================
   카드 기반 인벤토리 시스템
   ==================== */

const MAX_INVENTORY_SIZE = 8;

// 인벤토리 렌더링
function renderInventory() {
    const grid = document.getElementById('inventory-grid');
    const description = document.getElementById('item-description');

    grid.innerHTML = '';

    // 8칸 슬롯 생성
    for (let i = 0; i < MAX_INVENTORY_SIZE; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.dataset.index = i;

        if (gameState.inventory[i]) {
            const itemId = gameState.inventory[i];
            const item = ITEMS[itemId];

            slot.classList.add('has-item');

            // 장비 중인 아이템 표시
            if (itemId === gameState.equippedWeapon || itemId === gameState.equippedArmor) {
                slot.classList.add('equipped');
            }

            const icon = document.createElement('span');
            icon.className = 'item-icon';
            icon.textContent = item.icon;
            slot.appendChild(icon);

            // 클릭 이벤트
            slot.addEventListener('click', () => selectItem(i));

            // 더블클릭으로 사용
            slot.addEventListener('dblclick', () => useItem(i));
        } else {
            // 빈 슬롯
            slot.innerHTML = '<span class="empty-slot">+</span>';
        }

        grid.appendChild(slot);
    }

    // 설명 초기화
    description.innerHTML = '아이템을 클릭하면 설명이 표시됩니다.<br>더블클릭으로 사용/장비합니다.';
}

// 아이템 선택
function selectItem(index) {
    const itemId = gameState.inventory[index];
    if (!itemId) return;

    const item = ITEMS[itemId];
    const description = document.getElementById('item-description');

    let statsText = '';
    if (item.type === 'weapon') {
        statsText = `<span class="item-stats">공격력 +${item.attack}</span>`;
    } else if (item.type === 'armor') {
        statsText = `<span class="item-stats">방어력 +${item.defense}</span>`;
    } else if (item.type === 'consumable') {
        statsText = `<span class="item-stats">HP +${item.healAmount}</span>`;
    }

    let equippedText = '';
    if (itemId === gameState.equippedWeapon || itemId === gameState.equippedArmor) {
        equippedText = '<span style="color: gold;"> [장비 중]</span>';
    }

    description.innerHTML = `
        <div class="item-name">${item.icon} ${item.name}${equippedText}</div>
        <div>${item.description}</div>
        ${statsText}
        <div style="margin-top: 10px; font-size: 0.8rem; color: var(--text-muted);">
            ${getItemActions(item)}
        </div>
    `;

    // 선택 표시
    document.querySelectorAll('.inventory-slot').forEach(slot => {
        slot.style.boxShadow = 'none';
    });
    document.querySelector(`.inventory-slot[data-index="${index}"]`).style.boxShadow = '0 0 10px var(--gold)';
}

// 아이템 액션 텍스트
function getItemActions(item) {
    switch (item.type) {
        case 'weapon':
        case 'armor':
            return '더블클릭: 장비하기';
        case 'consumable':
            return '더블클릭: 사용하기';
        case 'tool':
            return '특수 도구';
        case 'quest':
            return '퀘스트 아이템';
        default:
            return '';
    }
}

// 아이템 버리기
function dropItem(index) {
    if (!gameState.inventory[index]) return;

    const itemId = gameState.inventory[index];
    const item = ITEMS[itemId];

    // 장비 해제
    if (itemId === gameState.equippedWeapon) {
        gameState.equippedWeapon = null;
    }
    if (itemId === gameState.equippedArmor) {
        gameState.equippedArmor = null;
    }

    // 퀘스트 아이템은 버릴 수 없음
    if (item.type === 'quest') {
        alert('퀘스트 아이템은 버릴 수 없습니다!');
        return;
    }

    gameState.inventory.splice(index, 1);
    renderInventory();
    alert(`${item.name}을(를) 버렸습니다.`);
}

// 장비 해제
function unequipItem(type) {
    if (type === 'weapon') {
        if (gameState.equippedWeapon) {
            const item = ITEMS[gameState.equippedWeapon];
            alert(`${item.name} 장비를 해제했습니다.`);
            gameState.equippedWeapon = null;
        }
    } else if (type === 'armor') {
        if (gameState.equippedArmor) {
            const item = ITEMS[gameState.equippedArmor];
            alert(`${item.name} 장비를 해제했습니다.`);
            gameState.equippedArmor = null;
        }
    }
    renderInventory();
}

// 인벤토리 공간 확인
function hasInventorySpace() {
    return gameState.inventory.length < MAX_INVENTORY_SIZE;
}

// 특정 아이템 보유 확인
function hasItem(itemId) {
    return gameState.inventory.includes(itemId);
}

// 아이템 개수 확인
function countItem(itemId) {
    return gameState.inventory.filter(id => id === itemId).length;
}

// 아이템 제거 (사용 후)
function removeItem(itemId) {
    const index = gameState.inventory.indexOf(itemId);
    if (index > -1) {
        gameState.inventory.splice(index, 1);
        return true;
    }
    return false;
}

// 현재 장비 공격력 보너스
function getWeaponBonus() {
    if (gameState.equippedWeapon) {
        return ITEMS[gameState.equippedWeapon].attack || 0;
    }
    return 0;
}

// 현재 장비 방어력 보너스
function getArmorBonus() {
    if (gameState.equippedArmor) {
        return ITEMS[gameState.equippedArmor].defense || 0;
    }
    return 0;
}
