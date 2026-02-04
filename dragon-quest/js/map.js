/* ====================
   Hex 맵 시스템
   ==================== */

// 맵 초기화
function initMap() {
    const chapter = gameState.currentChapter;
    const chapterData = CHAPTER_MAPS[chapter];

    if (!chapterData || !chapterData.map) return;

    // 시작 위치 설정
    if (!gameState.currentPosition || gameState.currentChapter !== chapter) {
        gameState.currentPosition = { ...chapterData.startPosition };
    }

    // 탐험한 타일 초기화 (챕터 변경 시)
    if (!gameState.exploredTiles || gameState.exploredTiles.length === 0) {
        gameState.exploredTiles = [];
        // 시작 위치와 주변 타일 탐험 처리
        exploreAround(gameState.currentPosition.row, gameState.currentPosition.col);
    }

    renderMap();
}

// 주변 타일 탐험 처리
function exploreAround(row, col) {
    const directions = [
        [-1, 0], [-1, 1], // 위
        [0, -1], [0, 1],  // 좌우
        [1, 0], [1, -1]   // 아래
    ];

    // 현재 위치 탐험
    addExploredTile(row, col);

    // 주변 타일 탐험
    directions.forEach(([dr, dc]) => {
        // 홀수 행 오프셋 조정
        let adjustedDc = dc;
        if (row % 2 === 1 && (dr === -1 || dr === 1)) {
            adjustedDc = dc + 1;
        }

        const newRow = row + dr;
        const newCol = col + adjustedDc;
        addExploredTile(newRow, newCol);
    });
}

// 탐험한 타일 추가
function addExploredTile(row, col) {
    const key = `${row}-${col}`;
    if (!gameState.exploredTiles.includes(key)) {
        gameState.exploredTiles.push(key);
    }
}

// 타일이 탐험되었는지 확인
function isExplored(row, col) {
    return gameState.exploredTiles.includes(`${row}-${col}`);
}

// 맵 렌더링
function renderMap() {
    const mapContainer = document.getElementById('hex-map');
    const chapter = gameState.currentChapter;
    const chapterData = CHAPTER_MAPS[chapter];

    if (!chapterData || !chapterData.map) return;

    const mapData = chapterData.map;
    mapContainer.innerHTML = '';

    for (let row = 0; row < mapData.length; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'hex-row' + (row % 2 === 1 ? ' offset' : '');

        for (let col = 0; col < mapData[row].length; col++) {
            const tileType = mapData[row][col];
            const tile = TILE_TYPES[tileType];
            const hex = document.createElement('div');
            hex.className = 'hex';
            hex.dataset.row = row;
            hex.dataset.col = col;

            // 탐험 여부 확인
            if (!isExplored(row, col)) {
                hex.classList.add('fog');
            } else {
                hex.classList.add(tileType);
                hex.textContent = tile.icon;

                // 현재 위치
                if (row === gameState.currentPosition.row && col === gameState.currentPosition.col) {
                    hex.classList.add('current');
                    hex.innerHTML = `<span style="position:relative;z-index:2">${getPlayerSprite()}</span>`;
                }

                // 이동 가능한 타일 표시
                if (isAccessible(row, col) && tile.passable) {
                    hex.classList.add('accessible');
                }

                // 통과 불가 타일
                if (!tile.passable) {
                    hex.classList.add('blocked');
                }

                // 클릭 이벤트
                if (tile.passable && isAccessible(row, col)) {
                    hex.addEventListener('click', () => moveToTile(row, col));
                }
            }

            rowDiv.appendChild(hex);
        }

        mapContainer.appendChild(rowDiv);
    }
}

// 인접한 타일인지 확인
function isAccessible(row, col) {
    const currentRow = gameState.currentPosition.row;
    const currentCol = gameState.currentPosition.col;

    // 현재 위치면 제외
    if (row === currentRow && col === currentCol) return false;

    // Hex 그리드에서 인접 타일 계산
    const directions = row % 2 === 0 ? [
        [-1, -1], [-1, 0],  // 위
        [0, -1], [0, 1],    // 좌우
        [1, -1], [1, 0]     // 아래
    ] : [
        [-1, 0], [-1, 1],   // 위
        [0, -1], [0, 1],    // 좌우
        [1, 0], [1, 1]      // 아래
    ];

    // 현재 위치 기준 인접 타일
    const currentDirections = currentRow % 2 === 0 ? [
        [-1, -1], [-1, 0],
        [0, -1], [0, 1],
        [1, -1], [1, 0]
    ] : [
        [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, 0], [1, 1]
    ];

    for (const [dr, dc] of currentDirections) {
        if (currentRow + dr === row && currentCol + dc === col) {
            return true;
        }
    }

    return false;
}

// 타일로 이동
function moveToTile(row, col) {
    const chapter = gameState.currentChapter;
    const chapterData = CHAPTER_MAPS[chapter];
    const tileType = chapterData.map[row][col];
    const tile = TILE_TYPES[tileType];

    if (!tile.passable) return;

    // 위치 업데이트
    gameState.currentPosition = { row, col };

    // 주변 탐험
    exploreAround(row, col);

    // 맵 다시 렌더링
    renderMap();

    // 이벤트 체크
    checkTileEvent(row, col, tileType);
}

// 타일 이벤트 체크
function checkTileEvent(row, col, tileType) {
    const chapter = gameState.currentChapter;
    const chapterData = CHAPTER_MAPS[chapter];
    const eventKey = `${row}-${col}`;

    // 고정 이벤트 확인
    if (chapterData.events && chapterData.events[eventKey]) {
        const event = chapterData.events[eventKey];

        // 이미 클리어한 이벤트인지 확인
        if (getFlag(`event_${eventKey}_cleared`)) {
            // 이미 완료된 이벤트
            return;
        }

        if (event.type === 'story') {
            triggerMapStory(event.id);
            setFlag(`event_${eventKey}_cleared`, true);
            return;
        }
    }

    // 랜덤 이벤트 (고정 이벤트가 없는 경우)
    const chance = Math.random();

    // 숲이나 동굴에서 70% 확률로 이벤트 발생
    if ((tileType === 'forest' || tileType === 'cave') && chance < 0.7) {
        triggerRandomEvent(tileType);
    }
    // 길에서 30% 확률로 이벤트 발생
    else if (tileType === 'path' && chance < 0.3) {
        triggerRandomEvent(tileType);
    }
}

// 특정 타일로 즉시 이동 (스토리 등에서 사용)
function teleportTo(row, col) {
    gameState.currentPosition = { row, col };
    exploreAround(row, col);
    renderMap();
}

// 맵 초기화 (새 챕터 시작 시)
function resetMap() {
    const chapter = gameState.currentChapter;
    const chapterData = CHAPTER_MAPS[chapter];

    if (!chapterData || !chapterData.map) return;

    gameState.currentPosition = { ...chapterData.startPosition };
    gameState.exploredTiles = [];
    exploreAround(gameState.currentPosition.row, gameState.currentPosition.col);

    renderMap();
}
