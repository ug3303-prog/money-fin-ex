/**
 * 역할: 게임 상태 관리 (gameState.js)
 * 설명: 플레이어 정보, 골드 잔액, 현재 위치, 현재 턴 등 게임의 모든 동적 데이터를 중앙 관리합니다.
 *       다른 파일에서 직접 상태 객체를 수정하는 것을 금지하며, 제공되는 함수 인터페이스를 통해서만 상태를 제어합니다.
 */

// 1. 전역 상수 정의
const GAME_CONFIG = {
    INITIAL_GOLD: 100,       // 시작 골드
    TOTAL_TILES: 16,         // 보드 총 칸 수
    MAX_LAPS: 1,             // 완료해야 할 바퀴 수
    PLAYER_DETAILS: [
        { id: 1, colorName: '빨강', colorClass: 'player-p1', emoji: '🔴', colorHex: '#ff5e57' },
        { id: 2, colorName: '파랑', colorClass: 'player-p2', emoji: '🔵', colorHex: '#3c40c6' },
        { id: 3, colorName: '초록', colorClass: 'player-p3', emoji: '🟢', colorHex: '#0be881' },
        { id: 4, colorName: '노랑', colorClass: 'player-p4', emoji: '🟡', colorHex: '#ffa801' }
    ]
};

// 2. 내부 게임 상태 객체
const _gameState = {
    players: [],             // 플레이어 객체 배열
    playerCount: 2,          // 선택된 플레이어 인원
    currentTurnIndex: 0,     // 현재 턴 플레이어 인덱스
    isGameOver: false,       // 게임 종료 여부
    logs: []                 // 디버깅 및 게임 로그 기록
};

/**
 * 디버깅용 안전 로그 함수
 */
function logGameAction(message) {
    const timestamp = new Date().toLocaleTimeString();
    const formattedLog = `[${timestamp}] ${message}`;
    _gameState.logs.push(formattedLog);
    console.log(formattedLog);
}

/**
 * 게임 상태 초기화 함수
 * @param {number} count - 플레이어 수 (2~4)
 * @param {Array<string>} customNames - 입력받은 플레이어 이름 목록
 */
function initGameState(count, customNames) {
    _gameState.players = [];
    _gameState.playerCount = count;
    _gameState.currentTurnIndex = 0;
    _gameState.isGameOver = false;
    _gameState.logs = [];

    // 뉴스 덱 및 시세 초기화 연동
    initNewsDecks();
    initMarket();

    logGameAction(`게임 초기화 시작 - 인원: ${count}명`);


    for (let i = 0; i < count; i++) {
        const detail = GAME_CONFIG.PLAYER_DETAILS[i];
        const name = customNames[i] && customNames[i].trim() !== "" 
            ? customNames[i].trim() 
            : `어린이 ${i + 1}`;

        _gameState.players.push({
            id: detail.id,
            name: name,
            colorClass: detail.colorClass,
            colorHex: detail.colorHex,
            emoji: detail.emoji,
            gold: GAME_CONFIG.INITIAL_GOLD,
            position: 0,            // 0번 칸 (START)에서 시작
            savings: 0,             // 저축한 돈
            stocks: 0,              // 보유 주식 수 (2단계 추가)
            bonds: 0,               // 보유 채권 수 (2단계 추가)
            lapCount: 0,            // 완료한 바퀴 수
            hasFinished: false      // 완주 완료 플래그
        });

        logGameAction(`플레이어 추가: ${name} (${detail.emoji}) - 시작 자금: ${GAME_CONFIG.INITIAL_GOLD}골드`);
    }
}


/**
 * 모든 플레이어 목록 가져오기 (읽기 전용 복사본 제공)
 */
function getPlayers() {
    return _gameState.players;
}

/**
 * 현재 턴 플레이어 정보 가져오기
 */
function getCurrentPlayer() {
    return _gameState.players[_gameState.currentTurnIndex];
}

/**
 * 특정 플레이어 정보 가져오기
 */
function getPlayerById(id) {
    return _gameState.players.find(p => p.id === id);
}

/**
 * 현재 플레이어 인덱스 가져오기
 */
function getCurrentTurnIndex() {
    return _gameState.currentTurnIndex;
}

/**
 * 게임 종료 상태인지 확인
 */
function checkIsGameOver() {
    return _gameState.isGameOver;
}

/**
 * 플레이어의 위치를 안전하게 업데이트
 * @param {number} playerId - 플레이어 고유 ID
 * @param {number} steps - 이동할 주사위 수
 * @returns {object} { nextPosition, lapCompleted } - 결과 정보
 */
function movePlayerState(playerId, steps) {
    const player = getPlayerById(playerId);
    if (!player) return null;

    let nextPosition = player.position + steps;
    let lapCompleted = false;

    // 한 바퀴 완주 검사 (보드 한 바퀴는 16칸)
    if (nextPosition >= GAME_CONFIG.TOTAL_TILES) {
        nextPosition = nextPosition % GAME_CONFIG.TOTAL_TILES;
        player.lapCount += 1;
        
        // 1단계 규칙: 한 바퀴 돌면 바로 해당 플레이어는 완주로 간주
        if (player.lapCount >= GAME_CONFIG.MAX_LAPS) {
            player.hasFinished = true;
            lapCompleted = true;
            logGameAction(`${player.name} 완주 성공! 🎉`);
        }
    }

    player.position = nextPosition;
    logGameAction(`${player.name} 🎲 주사위 ${steps}칸 이동 -> 현재 위치: ${nextPosition}번 칸`);

    return { nextPosition, lapCompleted };
}

/**
 * 특정 플레이어의 골드를 안전하게 변경
 * @param {number} playerId 
 * @param {number} amount - 더하거나 뺄 금액
 */
function updatePlayerGold(playerId, amount) {
    const player = getPlayerById(playerId);
    if (!player) return;

    player.gold += amount;
    // 0골드 미만으로 내려가지 않도록 최솟값 안전장치
    if (player.gold < 0) {
        player.gold = 0;
    }

    logGameAction(`${player.name} 골드 변동: ${amount > 0 ? '+' : ''}${amount}골드 -> 현재: ${player.gold}골드`);
}

/**
 * 특정 플레이어의 저축 금액을 업데이트
 * @param {number} playerId 
 * @param {number} amount 
 */
function updatePlayerSavings(playerId, amount) {
    const player = getPlayerById(playerId);
    if (!player) return;

    player.savings += amount;
    logGameAction(`${player.name} 저축 변동: +${amount}골드 -> 현재 저축액: ${player.savings}골드`);
}

/**
 * 다음 플레이어로 턴 넘기기
 * 완주하지 않은 플레이어를 다음 순서로 잡음
 */
function advanceTurn() {
    if (_gameState.isGameOver) return;

    // 모든 플레이어가 완주했는지 확인
    const allFinished = _gameState.players.every(p => p.hasFinished);
    if (allFinished) {
        _gameState.isGameOver = true;
        logGameAction(`모든 플레이어 완주! 게임 종료.`);
        return;
    }

    // 다음 차례를 찾음 (이미 완주한 사람은 건너뛰기)
    let searchCount = 0;
    do {
        _gameState.currentTurnIndex = (_gameState.currentTurnIndex + 1) % _gameState.playerCount;
        searchCount++;
    } while (getCurrentPlayer().hasFinished && searchCount <= _gameState.playerCount);

    // 다시 한 번 전체 검사 (안전장치)
    if (_gameState.players.every(p => p.hasFinished)) {
        _gameState.isGameOver = true;
        logGameAction(`게임 완료 처리`);
    } else {
        logGameAction(`턴 변경 -> 현재 턴: ${getCurrentPlayer().name}`);
    }
}

/**
 * 역할: 주사위 롤러 유틸리티 (getRandomDice)
 * 설명: 주사위 난수(1~6)를 생성하는 중앙 집중 랜덤 함수입니다.
 */
function getRandomDice() {
    return Math.floor(Math.random() * 6) + 1;
}

/**
 * 주식 구매 함수 (2단계 추가)
 * @param {number} playerId 
 * @param {number} price 
 */
function buyStockState(playerId, price) {
    const player = getPlayerById(playerId);
    if (!player || player.gold < price) return false;
    player.gold -= price;
    player.stocks = (player.stocks || 0) + 1;
    logGameAction(`${player.name}님이 주식을 1주 구매했습니다. (구매가: ${price}G, 보유: ${player.stocks}주, 잔액: ${player.gold}G)`);
    return true;
}

/**
 * 채권 구매 함수 (2단계 추가)
 * @param {number} playerId 
 * @param {number} price 
 */
function buyBondState(playerId, price) {
    const player = getPlayerById(playerId);
    if (!player || player.gold < price) return false;
    player.gold -= price;
    player.bonds = (player.bonds || 0) + 1;
    logGameAction(`${player.name}님이 채권을 1매 구매했습니다. (구매가: ${price}G, 보유: ${player.bonds}매, 잔액: ${player.gold}G)`);
    return true;
}

/**
 * 주식 판매 함수 (2단계 추가)
 * @param {number} playerId 
 * @param {number} price 
 */
function sellStockState(playerId, price) {
    const player = getPlayerById(playerId);
    if (!player || !player.stocks || player.stocks < 1) return false;
    player.stocks -= 1;
    player.gold += price;
    logGameAction(`${player.name}님이 주식을 1주 판매했습니다. (판매가: ${price}G, 보유: ${player.stocks}주, 잔액: ${player.gold}G)`);
    return true;
}

/**
 * 채권 판매 함수 (2단계 추가)
 * @param {number} playerId 
 * @param {number} price 
 */
function sellBondState(playerId, price) {
    const player = getPlayerById(playerId);
    if (!player || !player.bonds || player.bonds < 1) return false;
    player.bonds -= 1;
    player.gold += price;
    logGameAction(`${player.name}님이 채권을 1매 판매했습니다. (판매가: ${price}G, 보유: ${player.bonds}매, 잔액: ${player.gold}G)`);
    return true;
}


