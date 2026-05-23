/**
 * 역할: 게임 카드 데이터 및 로직 관리 (cards.js)
 * 설명: 금융 O/X 퀴즈 카드와 랜덤 이벤트 카드의 데이터셋을 선언하고 관리합니다.
 *       초등학생 대상의 어휘 변환 가이드를 철저히 적용하여 이해하기 쉬운 문장으로 작성되었습니다.
 */

// 1. 초등학생 맞춤 금융 O/X 퀴즈 데이터셋
const QUIZ_DECK = [
    {
        id: 1,
        question: "🐷 은행에 돈을 저축(모으기)하면 보너스 금액인 '이자'를 받을 수 있어요.",
        answer: true, // O
        desc: "맞아요! 은행에 돈을 모아두면 은행이 고맙다는 뜻으로 이자(이자율)를 붙여서 더 많은 돈을 돌려준답니다."
    },
    {
        id: 2,
        question: "📈 주식 투자는 항상 돈을 벌 수만 있고, 절대 잃지 않는 안전한 방법이에요.",
        answer: false, // X
        desc: "틀렸어요! 주식 투자는 기업에 돈을 투자하여 큰 보상을 얻을 수도 있지만, 기업의 가치(가격)가 떨어지면 내 돈을 잃을 위험성도 있어요."
    },
    {
        id: 3,
        question: "📜 돈을 빌려주고 나중에 받기로 약속하는 증표(종이)를 '채권'이라고 불러요.",
        answer: true, // O
        desc: "맞아요! 채권은 돈을 빌리는 곳(회사, 국가 등)에서 투자자에게 나중에 이자를 얹어 갚겠다고 약속하는 신용 종이에요."
    },
    {
        id: 4,
        question: "💰 '이자율'이 높을수록 은행에 저축했을 때 나중에 돌려받는 보너스 돈이 더 적어져요.",
        answer: false, // X
        desc: "틀렸어요! 이자율이 높을수록 내가 모은 저축금에 대한 보너스 이자가 훨씬 더 많아져 돈을 빠르게 불릴 수 있답니다."
    },
    {
        id: 5,
        question: "🔒 돈을 잃을 위험이 얼마나 없는지를 나타내는 성질을 금융 용어로 '안전성'이라고 해요.",
        answer: true, // O
        desc: "맞아요! 예금자보호법이 적용되는 저축은 안전성이 매우 높지만, 주식 투자는 안전성이 상대적으로 낮답니다."
    }
];

// 2. 아동 친화적 이벤트 카드 데이터셋
const EVENT_DECK = [
    {
        id: 1,
        title: "🧧 할머니의 명절 용돈 보너스!",
        desc: "할머니댁에 가서 인사를 드렸더니 착하다며 세뱃돈을 주셨어요. 기분이 날아갈 것 같아요!",
        goldEffect: 10,
        emoji: "🧧"
    },
    {
        id: 2,
        title: "🍡 참새가 방앗간을 지나랴! 맛있는 떡볶이 사 먹기",
        desc: "방과 후에 친구들과 분식집에서 달콤매콤 떡볶이와 튀김 세트를 사 먹고 지출을 했습니다.",
        goldEffect: -5,
        emoji: "🍡"
    },
    {
        id: 3,
        title: "🧹 번쩍번쩍 방 청소 대장!",
        desc: "내 방을 스스로 쓸고 닦아서 부모님을 기쁘게 해드렸어요. 칭찬 상금으로 용돈을 받았습니다!",
        goldEffect: 5,
        emoji: "🧹"
    },
    {
        id: 4,
        title: "📞 앗! 통신 요금 스마트폰 게임 폭탄!",
        desc: "부모님 몰래 유료 스마트폰 게임 아이템을 샀다가 통신 요금 고지서에 청구되었습니다. 지출 발생!",
        goldEffect: -10,
        emoji: "📱"
    },
    {
        id: 5,
        title: "🍀 길가다가 발견한 럭키 행운의 상금!",
        desc: "바닥에 떨어진 쓰레기를 주워 쓰레기통에 넣었더니, 지나가던 이웃 어른이 착하다고 칭찬해 주셨어요!",
        goldEffect: 7,
        emoji: "🍀"
    }
];

/**
 * 랜덤으로 퀴즈 카드 한 장을 무작위로 뽑습니다.
 */
function drawRandomQuiz() {
    const idx = Math.floor(Math.random() * QUIZ_DECK.length);
    return QUIZ_DECK[idx];
}

/**
 * 랜덤으로 이벤트 카드 한 장을 무작위로 뽑습니다.
 */
function drawRandomEvent() {
    const idx = Math.floor(Math.random() * EVENT_DECK.length);
    return EVENT_DECK[idx];
}

// ==========================================
// 3. 2단계 투자 시스템용 뉴스 카드 데이터셋
// ==========================================

const STOCK_NEWS = [
    { id: 1, text: "사람들이 일자리를 많이 얻었어요! 회사들이 잘 되고 있어요.", effect: 1, icon: "📈", type: "stock" },
    { id: 2, text: "사람들이 쓸 수 있는 돈이 많아졌어요!", effect: 2, icon: "📈", type: "stock" },
    { id: 3, text: "우리나라가 다른 나라들에게 더 믿음을 얻었어요!", effect: 2, icon: "📈", type: "stock" },
    { id: 4, text: "회사들이 올해 최고로 돈을 많이 벌었어요!", effect: 2, icon: "📈", type: "stock" },
    { id: 5, text: "나라에서 세금을 줄여줬어요! 회사들이 더 잘 돼요.", effect: 1, icon: "📈", type: "stock" },
    { id: 6, text: "사람들이 일자리를 잃었어요. 회사가 어려워요.", effect: -1, icon: "📉", type: "stock" },
    { id: 7, text: "나라에서 세금을 더 걷기로 했어요. 회사들이 힘들어요.", effect: -1, icon: "📉", type: "stock" },
    { id: 8, text: "사람들이 쓸 돈이 부족해졌어요.", effect: -2, icon: "📉", type: "stock" },
    { id: 9, text: "외국인들이 우리나라 주식을 많이 팔고 있어요.", effect: -2, icon: "📉", type: "stock" },
    { id: 10, text: "외국인들이 우리나라 주식을 많이 사고 있어요!", effect: 2, icon: "📈", type: "stock" },
    { id: 11, text: "우리나라가 다른 나라들에게 믿음을 잃었어요.", effect: -1, icon: "📉", type: "stock" },
    { id: 12, text: "우리나라 회사가 새로운 발명을 했어요! 세계가 깜짝!", effect: 1, icon: "📈", type: "stock" }
];

const BOND_NEWS = [
    { id: 1, text: "돈을 빌리는 곳이 줄어들었어요. 빌려주면 더 귀해져요!", effect: 2, icon: "📈", type: "bond" },
    { id: 2, text: "외국인들이 우리나라 회사에 돈을 빌려주고 있어요.", effect: 2, icon: "📈", type: "bond" },
    { id: 3, text: "은행 이자가 내려갔어요. 돈 빌려주는 게 더 좋아져요.", effect: 1, icon: "📈", type: "bond" },
    { id: 4, text: "이자에 붙는 세금이 줄었어요!", effect: 1, icon: "📈", type: "bond" },
    { id: 5, text: "돈을 빌리는 곳이 너무 많아졌어요.", effect: -1, icon: "📉", type: "bond" },
    { id: 6, text: "은행 이자가 올라갔어요. 빌려주는 게 덜 좋아져요.", effect: -1, icon: "📉", type: "bond" },
    { id: 7, text: "회사들이 망하고 있어요. 빌려준 돈을 못 받을까봐 걱정돼요.", effect: -2, icon: "📉", type: "bond" },
    { id: 8, text: "사람들이 쓸 수 있는 돈이 많아졌어요!", effect: 2, icon: "📈", type: "bond" },
    { id: 9, text: "돈 빌리는 곳의 믿음이 떨어졌어요.", effect: -1, icon: "📉", type: "bond" },
    { id: 10, text: "돈 빌리는 곳의 믿음이 올라갔어요!", effect: 1, icon: "📈", type: "bond" },
    { id: 11, text: "돈을 빌려주는 상품을 사람들이 많이 사고 있어요!", effect: 1, icon: "📈", type: "bond" },
    { id: 12, text: "돈을 빌려주는 상품의 인기가 떨어졌어요.", effect: -1, icon: "📉", type: "bond" }
];

// 실시간 순환 큐 처리를 위한 덱 복제본
let _stockNewsDeck = [];
let _bondNewsDeck = [];

/**
 * 뉴스 카드 덱 셔플 및 초기화 함수
 */
function initNewsDecks() {
    // 1) 배열 복사 후 피셔-예이츠 셔플 알고리즘 적용
    _stockNewsDeck = [...STOCK_NEWS];
    _bondNewsDeck = [...BOND_NEWS];

    for (let i = _stockNewsDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [_stockNewsDeck[i], _stockNewsDeck[j]] = [_stockNewsDeck[j], _stockNewsDeck[i]];
    }

    for (let i = _bondNewsDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [_bondNewsDeck[i], _bondNewsDeck[j]] = [_bondNewsDeck[j], _bondNewsDeck[i]];
    }

    console.log('[Cards] 뉴스 카드 덱이 셔플되어 초기 셋업이 완비되었습니다.');
}

/**
 * 주식 뉴스 카드를 뽑고 순환 큐 처리 (맨 뒤로 보내기)
 */
function drawStockNewsCard() {
    if (_stockNewsDeck.length === 0) {
        initNewsDecks();
    }
    const card = _stockNewsDeck.shift(); // 맨 앞 장 꺼내기
    _stockNewsDeck.push(card);          // 맨 뒤로 다시 보관 (순환 구조)
    return card;
}

/**
 * 채권 뉴스 카드를 뽑고 순환 큐 처리 (맨 뒤로 보내기)
 */
function drawBondNewsCard() {
    if (_bondNewsDeck.length === 0) {
        initNewsDecks();
    }
    const card = _bondNewsDeck.shift();
    _bondNewsDeck.push(card);
    return card;
}

console.log('[Cards] O/X 퀴즈 및 이벤트 덱이 로드되었습니다.', { quizCount: QUIZ_DECK.length, eventCount: EVENT_DECK.length });

