/**
 * 역할: 주식/채권 시세 및 금융 시장 동향 관리 (market.js)
 * 설명: 주식과 채권의 가격(5~20 골드 제한) 상태와 이전 가격(변동폭 계산용)을 전담하여 관리합니다.
 *       다른 파일에서 직접 상태를 수정하지 않고, 제공되는 인터페이스 함수를 통해서만 시세를 변동시킵니다.
 */

// 1. 전역 마켓 구성 상수
const MARKET_CONFIG = {
    INITIAL_PRICE: 10,       // 시작 시세
    MIN_PRICE: 5,            // 최소 시세
    MAX_PRICE: 20            // 최대 시세
};

// 2. 내부 마켓 상태 객체
const _marketState = {
    stockPrice: MARKET_CONFIG.INITIAL_PRICE,
    bondPrice: MARKET_CONFIG.INITIAL_PRICE,
    prevStockPrice: MARKET_CONFIG.INITIAL_PRICE,
    prevBondPrice: MARKET_CONFIG.INITIAL_PRICE
};

/**
 * 마켓 상태 초기화
 */
function initMarket() {
    _marketState.stockPrice = MARKET_CONFIG.INITIAL_PRICE;
    _marketState.bondPrice = MARKET_CONFIG.INITIAL_PRICE;
    _marketState.prevStockPrice = MARKET_CONFIG.INITIAL_PRICE;
    _marketState.prevBondPrice = MARKET_CONFIG.INITIAL_PRICE;
    console.log(`[Market] 금융 시장 초기화 완료 - 주식: ${MARKET_CONFIG.INITIAL_PRICE}G, 채권: ${MARKET_CONFIG.INITIAL_PRICE}G`);
}

/**
 * 주식 현재 시세 조회
 */
function getStockPrice() {
    return _marketState.stockPrice;
}

/**
 * 채권 현재 시세 조회
 */
function getBondPrice() {
    return _marketState.bondPrice;
}

/**
 * 주식 이전 시세 조회 (변동폭 표시용)
 */
function getPrevStockPrice() {
    return _marketState.prevStockPrice;
}

/**
 * 채권 이전 시세 조회 (변동폭 표시용)
 */
function getPrevBondPrice() {
    return _marketState.prevBondPrice;
}

/**
 * 주식 시세 업데이트 함수
 * @param {number} effect - 변동값 (+1, +2, -1, -2 등)
 * @returns {object} { price, change, hitLimit, message }
 */
function updateStockPrice(effect) {
    _marketState.prevStockPrice = _marketState.stockPrice;
    let nextPrice = _marketState.stockPrice + effect;
    let hitLimit = false;
    let message = "";

    if (nextPrice >= MARKET_CONFIG.MAX_PRICE) {
        nextPrice = MARKET_CONFIG.MAX_PRICE;
        hitLimit = _marketState.stockPrice !== MARKET_CONFIG.MAX_PRICE;
        if (hitLimit) message = "📈 주식 가격이 너무 비싸져서 더 이상 올라가지 않아요! (최대 20G)";
    } else if (nextPrice <= MARKET_CONFIG.MIN_PRICE) {
        nextPrice = MARKET_CONFIG.MIN_PRICE;
        hitLimit = _marketState.stockPrice !== MARKET_CONFIG.MIN_PRICE;
        if (hitLimit) message = "📉 주식 가격이 바닥을 쳐서 더 이상 내려가지 않아요! (최소 5G)";
    }

    _marketState.stockPrice = nextPrice;
    const change = nextPrice - _marketState.prevStockPrice;

    console.log(`[Market] 주식 가격 변동: ${change >= 0 ? '+' : ''}${change}G -> 현재가: ${nextPrice}G (이전가: ${_marketState.prevStockPrice}G)`);
    
    // UI 시세 표시판 자동 동화 연동
    if (window.UI && typeof UI.updateMarketBoard === 'function') {
        UI.updateMarketBoard();
    }
    
    return { price: nextPrice, change, hitLimit, message };
}

/**
 * 채권 시세 업데이트 함수
 * @param {number} effect - 변동값 (+1, +2, -1, -2 등)
 * @returns {object} { price, change, hitLimit, message }
 */
function updateBondPrice(effect) {
    _marketState.prevBondPrice = _marketState.bondPrice;
    let nextPrice = _marketState.bondPrice + effect;
    let hitLimit = false;
    let message = "";

    if (nextPrice >= MARKET_CONFIG.MAX_PRICE) {
        nextPrice = MARKET_CONFIG.MAX_PRICE;
        hitLimit = _marketState.bondPrice !== MARKET_CONFIG.MAX_PRICE;
        if (hitLimit) message = "📈 채권 가격이 너무 비싸져서 더 이상 올라가지 않아요! (최대 20G)";
    } else if (nextPrice <= MARKET_CONFIG.MIN_PRICE) {
        nextPrice = MARKET_CONFIG.MIN_PRICE;
        hitLimit = _marketState.bondPrice !== MARKET_CONFIG.MIN_PRICE;
        if (hitLimit) message = "📉 채권 가격이 바닥을 쳐서 더 이상 내려가지 않아요! (최소 5G)";
    }

    _marketState.bondPrice = nextPrice;
    const change = nextPrice - _marketState.prevBondPrice;

    console.log(`[Market] 채권 가격 변동: ${change >= 0 ? '+' : ''}${change}G -> 현재가: ${nextPrice}G (이전가: ${_marketState.prevBondPrice}G)`);
    
    // UI 시세 표시판 자동 동화 연동
    if (window.UI && typeof UI.updateMarketBoard === 'function') {
        UI.updateMarketBoard();
    }
    
    return { price: nextPrice, change, hitLimit, message };
}

// ==========================================
// 4. 콘솔 테스트 시나리오용 전역 헬퍼 함수
// ==========================================

/**
 * 콘솔용 별칭: 주식 뉴스 뽑기
 */
function drawStockNews() {
    if (typeof drawStockNewsCard === 'function') {
        return drawStockNewsCard();
    }
    return null;
}

/**
 * 콘솔용 별칭: 채권 뉴스 뽑기
 */
function drawBondNews() {
    if (typeof drawBondNewsCard === 'function') {
        return drawBondNewsCard();
    }
    return null;
}

/**
 * 콘솔용: 뉴스 카드를 주식/채권 시세판에 강제로 적용하고 UI를 자동 갱신하는 헬퍼 함수
 * @param {object} card 
 */
function applyNewsCard(card) {
    if (!card) {
        console.error("[Market] 적용할 뉴스 카드가 없습니다!");
        return;
    }
    console.log(`[콘솔 테스트] 📰 뉴스 카드 적용: ${card.icon} [${card.type === 'stock' ? '주식' : '채권'}] ${card.text} (효과: ${card.effect >= 0 ? '+' : ''}${card.effect})`);
    
    if (card.type === 'stock') {
        const result = updateStockPrice(card.effect);
        if (result.message) {
            alert(result.message);
        }
    } else if (card.type === 'bond') {
        const result = updateBondPrice(card.effect);
        if (result.message) {
            alert(result.message);
        }
    }
}

