/**
 * 역할: 게임 진입점 및 화면 전환 관리 (main.js)
 * 설명: 어플리케이션이 로드되면 플레이어 수 선택 이벤트 및 게임 시작 단추 이벤트를 감지하여
 *       초기 화면을 구동하고 데이터를 저장/분배합니다.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Main] 보드게임 어플리케이션이 초기화되었습니다.');

    let selectedPlayerCount = 0;

    // 게임방법 보기 및 돌아가기 버튼 이벤트 바인딩 (2단계 추가)
    const btnShowGuide = document.getElementById('btn-show-guide');
    const btnBackToLobby = document.getElementById('btn-back-to-lobby');

    if (btnShowGuide) {
        btnShowGuide.addEventListener('click', () => {
            UI.showScreen('guide');
        });
    }

    if (btnBackToLobby) {
        btnBackToLobby.addEventListener('click', () => {
            UI.showScreen('lobby');
        });
    }

    // 1. 플레이어 수 선택 버튼 이벤트 바인딩
    UI.btnCounts.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // 모든 인원 선택 버튼에서 selected 클래스 제거
            UI.btnCounts.forEach(b => b.classList.remove('selected'));
            
            // 현재 클릭한 버튼 활성화
            btn.classList.add('selected');
            
            // 인원 수 파싱 및 로컬 변수 저장
            selectedPlayerCount = parseInt(btn.dataset.count, 10);
            
            // UI에 동적 입력창 생성 요청
            UI.renderNicknameInputs(selectedPlayerCount);
        });
    });

    // 2. 게임 시작 버튼 이벤트 바인딩
    UI.btnStartGame.addEventListener('click', () => {
        if (selectedPlayerCount < 2 || selectedPlayerCount > 4) {
            alert('인원 수는 2명에서 4명까지만 선택할 수 있어요! 😅');
            return;
        }

        // 플레이어가 입력한 이름 리스트 수집
        const names = UI.getPlayerNames();
        
        // gamestate.js를 통해 전역 상태 초기화
        initGameState(selectedPlayerCount, names);

        // 콘솔로 초기화 완료된 플레이어 정보 출력 (정상 설정 검증용)
        console.log('[Main] 게임 시작 준비 완료! 설정된 플레이어 데이터:', getPlayers());

        // UI에 보드판 빌드 및 플레이어 정보 렌더링 요청
        UI.buildBoard();
        UI.updateGameUI();

        // 중앙 메인 카드 기본 텍스트 리셋
        document.getElementById('center-message').innerText = '🎲 주사위를 굴려주세요!';

        // 게임 화면으로 전환
        UI.showScreen('game');
    });

    // 3. 주사위 던지기 및 말 이동 처리
    const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

    UI.btnRollDice.addEventListener('click', () => {
        if (checkIsGameOver()) return;

        // 1) 버튼 더블클릭 방지 비활성화 및 주사위 롤링 애니메이션
        UI.btnRollDice.disabled = true;
        UI.diceVisual.innerText = '🎲';
        UI.diceVisual.style.transform = 'rotate(720deg)';

        // 2) 주사위 눈금 굴리기 (1~6 난수)
        const steps = getRandomDice();

        setTimeout(() => {
            // 3) 주사위 회전 완료 후 눈금 대입
            UI.diceVisual.innerText = diceFaces[steps - 1];
            UI.diceVisual.style.transform = 'rotate(0deg)';

            // 4) 현재 플레이어 이동
            const activePlayer = getCurrentPlayer();
            const { nextPosition, lapCompleted } = movePlayerState(activePlayer.id, steps);

            // 5) 중앙 대시보드 알림 메시지 출력
            const tile = BOARD_TILES[nextPosition];
            const centerMsg = document.getElementById('center-message');
            
            let message = `${activePlayer.name}님이 주사위 ${steps}을(를) 던져 [${tile.name} ${tile.emoji}]에 도착했어요!`;
            if (lapCompleted) {
                message += `\n🎉 완주 성공! (다음 차례부터는 맵에서 제외됩니다!)`;
            }
            centerMsg.innerText = message;

            // 6) 말의 물리적 위치 갱신
            UI.updateGameUI();

            // 7) 0.5초 대기 후 타일 효과 실행 (비동기 콜백 연동)
            setTimeout(() => {
                executeTileEffect(activePlayer, tile, () => {
                    // 8) 타일 효과로 변동된 잔액 최종 갱신
                    UI.updateGameUI();

                    // 9) 1초 대기 후 다음 턴 전환 또는 게임 종료 처리
                    setTimeout(() => {
                        // 다음 플레이어로 차례 교대 및 화면 갱신
                        advanceTurn();
                        UI.updateGameUI();

                        // 게임 종료 확인
                        if (checkIsGameOver()) {
                            UI.renderResultScreen();
                            UI.showScreen('result');
                        } else {
                            // 주사위 버튼 재활성화
                            UI.btnRollDice.disabled = false;
                            
                            const nextPlayer = getCurrentPlayer();
                            centerMsg.innerText = `🎲 ${nextPlayer.name}님의 차례입니다. 주사위를 던져주세요!`;
                        }
                    }, 1000);
                });
            }, 500);

        }, 600); // 0.6초 회전 효과
    });

    /**
     * 도착한 칸의 효과를 실행하는 핵심 로직 함수
     * @param {object} player - 현재 턴 플레이어 객체
     * @param {object} tile - 도착한 칸의 정보 객체
     * @param {function} onComplete - 효과 집계 종료 시 호출할 비동기 콜백 함수
     */
    function executeTileEffect(player, tile, onComplete) {
        console.log(`[Tile Effect] ${player.name}님이 [${tile.name}] 효과 실행`);
        
        switch (tile.type) {
            case 'SAVINGS': // 저축 칸
                if (player.gold >= 10) {
                    const wantSave = confirm(`🐷 [저축 칸]에 도착했습니다!\n10골드를 저축에 넣을까요?\n(저축한 돈은 이자지급 칸에서 10%의 보너스 이자를 받을 수 있어요!)`);
                    if (wantSave) {
                        updatePlayerGold(player.id, -10);
                        updatePlayerSavings(player.id, 10);
                        alert(`🐷 10골드를 성공적으로 저축했습니다!\n(보관 중인 저축액: ${player.savings}골드)`);
                    } else {
                        alert(`저축하지 않고 그냥 지나갑니다!`);
                    }
                } else {
                    alert(`골드가 부족해서 저축할 수 없어요! (최소 10골드가 필요해요)`);
                }
                onComplete();
                break;

            case 'INVEST': // 투자 칸 (2단계 모달 비동기 연동)
                UI.showInvestmentModal(player, onComplete);
                break;

            case 'STOCK_NEWS': // 주식 뉴스 칸 (2단계 추가)
                const stockCard = drawStockNews();
                UI.showNewsCard(stockCard, onComplete);
                break;

            case 'BOND_NEWS': // 채권 뉴스 칸 (2단계 추가)
                const bondCard = drawBondNews();
                UI.showNewsCard(bondCard, onComplete);
                break;


            case 'QUIZ': // 금융퀴즈 칸
                const quiz = drawRandomQuiz();
                const playerAnswer = confirm(`❓ [금융 O/X 퀴즈]에 도전합니다!\n\n퀴즈: "${quiz.question}"\n\n[확인]을 누르면 O (참)\n[취소]를 누르면 X (거짓)`);
                if (playerAnswer === quiz.answer) {
                    updatePlayerGold(player.id, 5);
                    alert(`🎉 정답입니다!!! +5골드를 획득하셨습니다!\n\n해설: ${quiz.desc}`);
                } else {
                    updatePlayerGold(player.id, -3);
                    alert(`😢 아쉽네요! 정답이 아닙니다. -3골드를 잃었습니다.\n\n해설: ${quiz.desc}`);
                }
                onComplete();
                break;

            case 'EVENT': // 이벤트 칸
                const event = drawRandomEvent();
                alert(`${event.emoji} [이벤트] 행운의 카드를 뽑았습니다!\n\n제목: ${event.title}\n설명: ${event.desc}\n효과: ${event.goldEffect >= 0 ? '+' : ''}${event.goldEffect}골드`);
                updatePlayerGold(player.id, event.goldEffect);
                onComplete();
                break;

            case 'INTEREST': // 이자지급 칸
                const interest = Math.floor(player.savings * 0.1);
                if (interest > 0) {
                    updatePlayerGold(player.id, interest);
                    alert(`💰 [이자 지급] 저축한 ${player.savings}골드의 10%인 ${interest}골드를 보너스 이자로 받았습니다!`);
                } else {
                    alert(`💰 [이자 지급] 저축한 돈이 없어 이자를 받지 못했습니다. 저축 칸에서 저축을 해보세요!`);
                }
                onComplete();
                break;

            case 'TRAVEL': // 금융여행 칸
                const choice = prompt(`✈️ [금융 여행] 칸에 도착했습니다!\n하고 싶은 금융 활동의 번호(1~4)를 입력해주세요:\n\n1. 10골드 저축하기 🐷\n2. 은행 보너스 이자 받기 💰\n3. 행운 카드 뽑기 🎁\n4. 그냥 쉬어가기 ☕`);
                if (choice === '1') {
                    if (player.gold >= 10) {
                        updatePlayerGold(player.id, -10);
                        updatePlayerSavings(player.id, 10);
                        alert(`🐷 10골드를 저축했습니다!`);
                    } else {
                        alert(`골드가 부족해서 저축할 수 없습니다!`);
                    }
                } else if (choice === '2') {
                    const travelInterest = Math.floor(player.savings * 0.1);
                    if (travelInterest > 0) {
                        updatePlayerGold(player.id, travelInterest);
                        alert(`💰 저축한 ${player.savings}골드의 10%인 ${travelInterest}골드를 보너스 이자로 받았습니다!`);
                    } else {
                        alert(`저축액이 없거나 부족하여 이자를 받지 못했습니다.`);
                    }
                } else if (choice === '3') {
                    const travelEvent = drawRandomEvent();
                    alert(`${travelEvent.emoji} [이벤트] 행운 카드를 뽑았습니다!\n\n제목: ${travelEvent.title}\n효과: ${travelEvent.goldEffect >= 0 ? '+' : ''}${travelEvent.goldEffect}골드`);
                    updatePlayerGold(player.id, travelEvent.goldEffect);
                } else {
                    alert(`그냥 편하게 쉬어가기로 했습니다!`);
                }
                onComplete();
                break;

            case 'REST': // 휴식 칸
            default:
                alert(`☕ [휴식 칸] 편안하게 휴식을 취합니다. 아무 일도 일어나지 않았습니다.`);
                onComplete();
                break;
        }
    }


    // 4. 다시 시작 버튼 이벤트 바인딩
    document.getElementById('btn-restart').addEventListener('click', () => {
        // 인원수 선택 원복 및 화면 가리기
        UI.btnCounts.forEach(btn => btn.classList.remove('selected'));
        UI.nicknameArea.classList.add('hidden');
        UI.btnStartGame.classList.add('hidden');
        selectedPlayerCount = 0;

        // 로비 스크린으로 전환
        UI.showScreen('lobby');
    });

    const btnGameReset = document.getElementById('btn-game-reset');
    if (btnGameReset) {
        btnGameReset.addEventListener('click', () => {
            const confirmReset = confirm("정말로 게임을 처음부터 다시 시작할까요?");
            if (confirmReset) {
                // 인원수 선택 원복 및 화면 가리기
                UI.btnCounts.forEach(btn => btn.classList.remove('selected'));
                UI.nicknameArea.classList.add('hidden');
                UI.btnStartGame.classList.add('hidden');
                selectedPlayerCount = 0;
                UI.showScreen('lobby');
            }
        });
    }
});


