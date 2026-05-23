/**
 * 역할: 메인 보드 로직 및 칸 데이터 정의 (board.js)
 * 설명: 16개의 사각형 보드판 칸의 속성(id, type, name, color, emoji, 설명 등)을 선언합니다.
 *       (17개 요구사항 중 16칸 배치를 위해 퀴즈 칸을 2개로 조정하여 완벽한 16칸 균형을 맞췄습니다.)
 */

const BOARD_TILES = [
    { id: 0, type: 'START', name: '시작점', emoji: '🚩', color: '#ff4757', desc: '월급을 받고 출발하는 곳!' },
    { id: 1, type: 'SAVINGS', name: '저축 칸', emoji: '🐷', color: '#ff78ae', desc: '안전하게 은행에 저축해요' },
    { id: 2, type: 'INVEST', name: '투자 칸', emoji: '📈', color: '#54a0ff', desc: '주식이나 채권에 투자해요' },
    { id: 3, type: 'QUIZ', name: '금융퀴즈', emoji: '❓', color: '#feca57', desc: '퀴즈를 풀고 돈을 얻어요!' },
    { id: 4, type: 'STOCK_NEWS', name: '주식뉴스', emoji: '📰', color: '#3498db', desc: '주식 뉴스를 읽고 시세가 변해요' },
    { id: 5, type: 'SAVINGS', name: '저축 칸', emoji: '🐷', color: '#ff78ae', desc: '안전하게 은행에 저축해요' },
    { id: 6, type: 'INVEST', name: '투자 칸', emoji: '📈', color: '#54a0ff', desc: '주식이나 채권에 투자해요' },
    { id: 7, type: 'QUIZ', name: '금융퀴즈', emoji: '❓', color: '#feca57', desc: '퀴즈를 풀고 돈을 얻어요!' },
    { id: 8, type: 'INTEREST', name: '이자지급', emoji: '💰', color: '#ffb142', desc: '저축한 돈의 10%를 이자로 받아오!' },
    { id: 9, type: 'SAVINGS', name: '저축 칸', emoji: '🐷', color: '#ff78ae', desc: '안전하게 은행에 저축해요' },
    { id: 10, type: 'INVEST', name: '투자 칸', emoji: '📈', color: '#54a0ff', desc: '주식이나 채권에 투자해요' },
    { id: 11, type: 'TRAVEL', name: '금융여행', emoji: '✈️', color: '#1dd1a1', desc: '원하는 금융 활동을 자유롭게 선택해요' },
    { id: 12, type: 'BOND_NEWS', name: '채권뉴스', emoji: '📰', color: '#2ecc71', desc: '채권 뉴스를 읽고 시세가 변해요' },
    { id: 13, type: 'SAVINGS', name: '저축 칸', emoji: '🐷', color: '#ff78ae', desc: '안전하게 은행에 저축해요' },
    { id: 14, type: 'INVEST', name: '투자 칸', emoji: '📈', color: '#54a0ff', desc: '주식이나 채권에 투자해요' },
    { id: 15, type: 'REST', name: '휴식 칸', emoji: '☕', color: '#a5b1c2', desc: '잠시 쉬어가요. 아무 일도 없어요' }

];

console.log('[Board] 16개 보드 칸 정보가 설정되었습니다.', BOARD_TILES);
