/* ====================
   스토리 시스템
   ==================== */

let currentStoryData = null;
let currentStoryIndex = 0;
let isTyping = false;
let typewriterTimeout = null;

// 스토리 시작
function startStory(storyData, startIndex = 0) {
    currentStoryData = storyData;
    currentStoryIndex = startIndex;
    displayStoryScene(currentStoryData[currentStoryIndex]);
}

// 스토리 장면 표시
function displayStoryScene(scene) {
    if (!scene) return;

    const narratorText = document.getElementById('narrator-text');
    const choicesContainer = document.getElementById('story-choices');
    const continueBtn = document.getElementById('continue-btn');
    const storyBg = document.getElementById('story-bg');

    // 배경 설정
    setStoryBackground(scene.background);

    // 선택지 초기화
    choicesContainer.innerHTML = '';
    continueBtn.classList.add('hidden');

    // 타이프라이터 효과로 텍스트 표시
    typewriterEffect(narratorText, scene.text, () => {
        // 텍스트 완료 후
        if (scene.choices && scene.choices.length > 0) {
            // 선택지 표시
            scene.choices.forEach(choice => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                btn.textContent = choice.text;
                btn.addEventListener('click', () => handleChoice(choice));
                choicesContainer.appendChild(btn);
            });
        } else if (scene.next || scene.endPrologue || scene.endScene) {
            // 계속 버튼 표시
            continueBtn.classList.remove('hidden');
        }
    });

    // 아이템 지급
    if (scene.giveItem) {
        setTimeout(() => addItem(scene.giveItem), 500);
    }

    // 플래그 설정
    if (scene.setFlag) {
        Object.keys(scene.setFlag).forEach(flag => {
            setFlag(flag, scene.setFlag[flag]);
        });
    }

    // 현재 씬 인덱스 저장
    gameState.currentScene = currentStoryIndex;
}

// 타이프라이터 효과
function typewriterEffect(element, text, callback) {
    isTyping = true;
    element.textContent = '';
    let i = 0;

    // 이전 타이핑 중지
    if (typewriterTimeout) {
        clearTimeout(typewriterTimeout);
    }

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            typewriterTimeout = setTimeout(type, 30);
        } else {
            isTyping = false;
            if (callback) callback();
        }
    }

    type();

    // 클릭 시 즉시 완료
    element.onclick = () => {
        if (isTyping) {
            clearTimeout(typewriterTimeout);
            element.textContent = text;
            isTyping = false;
            if (callback) callback();
        }
    };
}

// 배경 설정
function setStoryBackground(bgType) {
    const storyBg = document.getElementById('story-bg');

    // 배경 색상 (플레이스홀더)
    const backgrounds = {
        forest: 'linear-gradient(180deg, #2d5a27 0%, #1a3d1a 100%)',
        home: 'linear-gradient(180deg, #8b4513 0%, #4a2810 100%)',
        village: 'linear-gradient(180deg, #c2a060 0%, #8b6914 100%)',
        cave: 'linear-gradient(180deg, #4a4a4a 0%, #1a1a1a 100%)'
    };

    storyBg.style.background = backgrounds[bgType] || backgrounds.forest;
}

// 선택지 처리
function handleChoice(choice) {
    // 다음 장면 찾기
    const nextScene = findSceneById(choice.next);
    if (nextScene) {
        currentStoryIndex = currentStoryData.indexOf(nextScene);
        displayStoryScene(nextScene);
    }
}

// ID로 장면 찾기
function findSceneById(id) {
    return currentStoryData.find(scene => scene.id === id);
}

// 계속 버튼 처리
function continueStory() {
    if (isTyping) return;

    const currentScene = currentStoryData[currentStoryIndex];

    // 프롤로그 종료
    if (currentScene.endPrologue) {
        endPrologue();
        return;
    }

    // 씬 종료 (맵으로 돌아가기)
    if (currentScene.endScene) {
        showScreen('game');
        return;
    }

    // 다음 장면으로
    if (currentScene.next) {
        const nextScene = findSceneById(currentScene.next);
        if (nextScene) {
            currentStoryIndex = currentStoryData.indexOf(nextScene);
            displayStoryScene(nextScene);
        }
    }
}

// 프롤로그 종료
function endPrologue() {
    gameState.currentChapter = 1;
    gameState.currentScene = 0;

    // 초기 아이템 지급
    if (gameState.inventory.length === 0) {
        gameState.inventory.push('bread');
    }

    // 게임 화면으로 전환
    showScreen('game');
    initGameScreen();

    // 챕터 1 시작 스토리
    setTimeout(() => {
        triggerMapStory('village_start');
    }, 500);
}

// 맵에서 스토리 트리거
function triggerMapStory(storyId) {
    const storyData = STORY_CHAPTER1[storyId];
    if (storyData) {
        currentStoryData = storyData;
        currentStoryIndex = 0;
        showScreen('story');
        displayStoryScene(currentStoryData[0]);
    }
}

// 랜덤 이벤트 발생
function triggerRandomEvent(tileType) {
    const events = RANDOM_EVENTS[tileType];
    if (!events || events.length === 0) return null;

    const event = events[Math.floor(Math.random() * events.length)];

    switch (event.type) {
        case 'combat':
            const enemyId = event.enemies[Math.floor(Math.random() * event.enemies.length)];
            startCombat(enemyId);
            return 'combat';

        case 'item':
            const itemId = event.items[Math.floor(Math.random() * event.items.length)];
            addItem(itemId);
            return 'item';

        case 'nothing':
            // 아무 일도 없음
            return 'nothing';

        default:
            return null;
    }
}
