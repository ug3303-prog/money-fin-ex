/**
 * 역할: 화면 렌더링 및 UI 업데이트 관리 (ui.js)
 * 설명: DOM 엘리먼트들을 직접 조작하여 화면 전환, 인원수 버튼 클릭 시 동적 닉네임 입력칸 생성,
 *       보드판 생성, 플레이어 토큰 이동, 헤더 상태 동기화 등을 전담합니다.
 */

const UI = {
    // 1. 엘리먼트 캐싱
    screens: {
        lobby: document.getElementById('screen-lobby'),
        guide: document.getElementById('screen-guide'),
        game: document.getElementById('screen-game'),
        result: document.getElementById('screen-result')
    },
    btnCounts: document.querySelectorAll('.btn-count'),
    nicknameArea: document.getElementById('nickname-area'),
    nicknameContainer: document.getElementById('nickname-inputs-container'),
    btnStartGame: document.getElementById('btn-start-game'),
    
    // 게임 화면 엘리먼트
    turnPlayer: document.getElementById('game-turn-player'),
    turnLap: document.getElementById('game-turn-lap'),
    statusPanel: document.getElementById('player-status-panel'),
    gameBoard: document.getElementById('game-board'),
    diceVisual: document.getElementById('dice-visual'),
    btnRollDice: document.getElementById('btn-roll-dice'),

    /**
     * 특정 화면을 활성화하고 다른 화면은 모두 가리는 메서드
     * @param {string} screenKey - 'lobby', 'game', 'result' 중 하나
     */
    showScreen(screenKey) {
        Object.keys(this.screens).forEach(key => {
            if (key === screenKey) {
                this.screens[key].classList.add('active');
            } else {
                this.screens[key].classList.remove('active');
            }
        });
        console.log(`[UI] 화면 전환 -> ${screenKey}`);
    },

    /**
     * 선택된 인원 수에 맞춰 닉네임 입력 필드를 동적으로 생성하는 메서드
     * @param {number} count - 플레이어 수 (2~4)
     */
    renderNicknameInputs(count) {
        this.nicknameContainer.innerHTML = ''; // 기존 입력 필드 청소

        // 게임 설정 정보를 불러와 활용
        const playerDetails = GAME_CONFIG.PLAYER_DETAILS;

        for (let i = 0; i < count; i++) {
            const detail = playerDetails[i];
            
            // 입력칸 그룹 생성
            const groupDiv = document.createElement('div');
            groupDiv.className = 'nickname-input-group';
            
            // 이모지 & 플레이어 번호 표시
            const emojiSpan = document.createElement('span');
            emojiSpan.className = 'player-emoji';
            emojiSpan.innerHTML = `${detail.emoji}`;
            
            // 입력 창 생성
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.id = `input-player-${detail.id}`;
            inputField.placeholder = `플레이어 ${detail.id} (이름을 입력해줘!)`;
            inputField.maxLength = 8; // 너무 긴 이름 방지
            
            // 조립
            groupDiv.appendChild(emojiSpan);
            groupDiv.appendChild(inputField);
            
            this.nicknameContainer.appendChild(groupDiv);
        }

        // 닉네임 영역 및 게임 시작 버튼 표시하기
        this.nicknameArea.classList.remove('hidden');
        this.btnStartGame.classList.remove('hidden');
        
        console.log(`[UI] ${count}명 분의 닉네임 입력 필드가 동적으로 렌더링되었습니다.`);
    },

    /**
     * 입력된 플레이어 이름 배열을 수집하는 메서드
     * @returns {Array<string>} 이름 목록
     */
    getPlayerNames() {
        const names = [];
        const inputs = this.nicknameContainer.querySelectorAll('input');
        inputs.forEach(input => {
            names.push(input.value.trim());
        });
        return names;
    },

    /**
     * 16개 보드 칸의 5x5 그리드 행/열 좌표를 구해주는 헬퍼 메서드
     * @param {number} index - 타일 인덱스 (0~15)
     * @returns {object} { row, col }
     */
    getGridCoordinates(index) {
        if (index >= 0 && index <= 4) {
            return { row: 1, col: index + 1 }; // 상단 행 (1,1) ~ (1,5)
        } else if (index >= 5 && index <= 7) {
            return { row: index - 3, col: 5 }; // 우측 열 (2,5) ~ (4,5)
        } else if (index >= 8 && index <= 12) {
            return { row: 5, col: 5 - (index - 8) }; // 하단 행 (5,5) ~ (5,1)
        } else if (index >= 13 && index <= 15) {
            return { row: 5 - (index - 12), col: 1 }; // 좌측 열 (4,1) ~ (2,1)
        }
        return { row: 1, col: 1 };
    },

    /**
     * board.js에서 칸 데이터를 읽어서 5x5 Grid 보드판을 동적으로 빌드하는 메서드
     */
    buildBoard() {
        // 기존에 렌더링된 타일들 제거 (중앙 카드는 남겨둠)
        const existingTiles = this.gameBoard.querySelectorAll('.board-tile');
        existingTiles.forEach(tile => tile.remove());

        BOARD_TILES.forEach((tile, index) => {
            const tileDiv = document.createElement('div');
            tileDiv.className = 'board-tile';
            tileDiv.id = `tile-${tile.id}`;
            
            // 타입별 배경색 및 폰트색 매핑
            tileDiv.style.backgroundColor = tile.color;

            // 5x5 그리드 좌표 설정
            const coords = this.getGridCoordinates(index);
            tileDiv.style.gridRow = coords.row;
            tileDiv.style.gridColumn = coords.col;

            // 내부 요소 (이모지, 타이틀)
            const emojiSpan = document.createElement('span');
            emojiSpan.className = 'tile-emoji';
            emojiSpan.innerText = tile.emoji;

            const nameDiv = document.createElement('div');
            nameDiv.className = 'tile-name';
            nameDiv.innerText = tile.name;

            // 플레이어 말들이 서있을 컨테이너 생성
            const tokensDiv = document.createElement('div');
            tokensDiv.className = 'tile-tokens';
            tokensDiv.id = `tile-tokens-${tile.id}`;

            tileDiv.appendChild(emojiSpan);
            tileDiv.appendChild(nameDiv);
            tileDiv.appendChild(tokensDiv);

            // 보드판에 삽입
            this.gameBoard.appendChild(tileDiv);
        });

        console.log('[UI] 16개 보드 타일이 5x5 바둑판 둘레에 정상 배치되었습니다.');
    },

    /**
     * 실시간으로 플레이어 정보 패널, 턴 헤더, 맵 위의 말들을 업데이트
     */
    updateGameUI() {
        const players = getPlayers();
        const currentPlayer = getCurrentPlayer();
        const stockPrice = getStockPrice();
        const bondPrice = getBondPrice();

        // 1. 헤더 턴 정보 업데이트
        if (currentPlayer) {
            this.turnPlayer.innerHTML = `${currentPlayer.emoji} <span style="color: ${currentPlayer.colorHex}">${currentPlayer.name}</span>의 차례`;
            this.turnLap.innerText = `완주 목표: ${currentPlayer.lapCount}/1바퀴 (${currentPlayer.position}/16칸)`;
        }

        // 2. 플레이어 자산 현황 가로 패널 렌더링
        this.statusPanel.innerHTML = '';
        players.forEach(player => {
            const statusCard = document.createElement('div');
            statusCard.className = 'status-card';
            
            // 현재 턴인 플레이어 강조
            if (currentPlayer && player.id === currentPlayer.id) {
                statusCard.classList.add('active-player');
            }

            const nameSpan = document.createElement('span');
            nameSpan.className = 'status-name';
            nameSpan.innerText = `${player.emoji} ${player.name}`;

            const goldSpan = document.createElement('span');
            goldSpan.className = 'status-gold';
            goldSpan.innerText = `💰 ${player.gold}G`;

            statusCard.appendChild(nameSpan);
            statusCard.appendChild(goldSpan);

            // 2단계 추가: 주식/채권 보유 현황 및 현재 평가가치 표시
            const stockVal = (player.stocks || 0) * stockPrice;
            const bondVal = (player.bonds || 0) * bondPrice;

            const assetsDiv = document.createElement('div');
            assetsDiv.className = 'status-assets-detail';
            assetsDiv.innerHTML = `
                <div class="asset-line" title="주식">📈 ${player.stocks || 0}주 (${stockVal}G)</div>
                <div class="asset-line" title="돈 빌려준 약속종이(채권)">📜 ${player.bonds || 0}매 (${bondVal}G)</div>
            `;
            statusCard.appendChild(assetsDiv);

            this.statusPanel.appendChild(statusCard);
        });


        // 2-b. 주식/채권 실시간 시세 표시판 갱신 (2단계 추가)
        this.updateMarketBoard();



        // 3. 맵 위의 플레이어 토큰(말) 업데이트
        // 먼저 모든 타일의 토큰 청소
        const tokenContainers = this.gameBoard.querySelectorAll('.tile-tokens');
        tokenContainers.forEach(container => container.innerHTML = '');

        // 플레이어별 위치에 토큰 추가
        players.forEach(player => {
            if (player.hasFinished) return; // 완주 완료한 말은 맵에서 감춤

            const container = document.getElementById(`tile-tokens-${player.position}`);
            if (container) {
                const tokenSpan = document.createElement('span');
                tokenSpan.className = 'token';
                tokenSpan.innerText = player.emoji;
                container.appendChild(tokenSpan);
            }
        });

        console.log('[UI] 게임 대시보드 상태가 성공적으로 동기화되었습니다.');
    },

    /**
     * 최종 결과를 집계하여 결과 화면(screen-result)에 렌더링하는 메서드
     * 주식과 채권 자산을 현재 시세로 정산하여 총 자산 가치(Net Worth)로 랭킹 산정
     */
    renderResultScreen() {
        const players = getPlayers();
        if (players.length === 0) return;

        const stockPrice = getStockPrice();
        const bondPrice = getBondPrice();

        // 각 플레이어별 총자산 가치 계산 및 매핑
        const liquidatedPlayers = players.map(player => {
            const stockVal = (player.stocks || 0) * stockPrice;
            const bondVal = (player.bonds || 0) * bondPrice;
            const netWorth = player.gold + (player.savings || 0) + stockVal + bondVal;
            return {
                ...player,
                stockVal,
                bondVal,
                netWorth
            };
        });

        // 총자산(netWorth) 기준으로 내림차순 정렬
        const sorted = liquidatedPlayers.sort((a, b) => b.netWorth - a.netWorth);
        const winner = sorted[0];

        // 1. 우승자 포디움 렌더링
        const winnerPodium = document.getElementById('winner-podium');
        winnerPodium.innerHTML = `
            <div class="podium-crown">👑</div>
            <div class="podium-name">${winner.emoji} ${winner.name}</div>
            <div class="podium-gold">최종 총자산: ${winner.netWorth}G 💰</div>
            <div style="font-size: 12px; color: #7f8c8d; margin-top: 4px;">
                (현금 ${winner.gold}G + 저축 ${winner.savings}G + 주식 ${winner.stockVal}G + 채권 ${winner.bondVal}G)
            </div>
        `;

        // 2. 전체 랭킹 리스트 렌더링
        const rankingList = document.getElementById('final-ranking-list');
        rankingList.innerHTML = '';

        sorted.forEach((player, idx) => {
            const item = document.createElement('div');
            item.className = 'ranking-item';
            
            // 등수 뱃지 결정
            let badge = `${idx + 1}등`;
            if (idx === 0) badge = '🥇 1등';
            else if (idx === 1) badge = '🥈 2등';
            else if (idx === 2) badge = '🥉 3등';

            item.innerHTML = `
                <div class="rank-badge">${badge}</div>
                <div class="rank-item-info">
                    <span class="rank-name">${player.emoji} ${player.name}</span>
                    <span style="font-size: 10px; color: #7f8c8d; margin-left: 6px;">
                        (현금:${player.gold} 저축:${player.savings} 주식:${player.stocks} 채권:${player.bonds})
                    </span>
                </div>
                <div class="rank-gold">${player.netWorth}G</div>
            `;
            rankingList.appendChild(item);
        });

        console.log('[UI] 최종 정산 결과 화면이 성공적으로 렌더링되었습니다.');
    },


    /**
     * 2단계 투자 시스템 전용: 주식/채권 실시간 시세판 UI를 화려하게 업데이트하는 메서드
     * 수치 애니메이션, 배경 깜빡임(Blink), 최고치/최저치 뱃지, 트렌드 아이콘 연동 처리
     */
    updateMarketBoard() {
        const stockPrice = getStockPrice();
        const bondPrice = getBondPrice();
        const prevStockPrice = getPrevStockPrice();
        const prevBondPrice = getPrevBondPrice();

        const stockCard = document.getElementById('stock-card');
        const bondCard = document.getElementById('bond-card');

        if (!stockCard || !bondCard) return;

        // --- 1. 주식 카드 업데이트 ---
        const stockPriceDisplay = document.getElementById('stock-price-display');
        const stockTrendIcon = document.getElementById('stock-trend-icon');
        const stockDiffDisplay = document.getElementById('stock-diff-display');
        const stockLimitBadge = document.getElementById('stock-limit-badge');

        const stockDiff = stockPrice - prevStockPrice;

        // (1) 숫자 카운트업/다운 애니메이션 (0.5초)
        this.animateNumberValue(stockPriceDisplay, prevStockPrice, stockPrice, 500);

        // (2) 변동값 표시 및 방향 아이콘 연동
        stockDiffDisplay.classList.remove('rise', 'fall', 'animate-pop');
        void stockDiffDisplay.offsetWidth; // reflow

        if (stockDiff > 0) {
            stockDiffDisplay.innerText = `+${stockDiff}`;
            stockDiffDisplay.classList.add('rise', 'animate-pop');
            stockTrendIcon.innerText = '🐂'; // 황소
            
            // 카드 배경 빨간색 깜빡임
            stockCard.classList.remove('blink-rise', 'blink-fall');
            void stockCard.offsetWidth;
            stockCard.classList.add('blink-rise');
        } else if (stockDiff < 0) {
            stockDiffDisplay.innerText = `${stockDiff}`;
            stockDiffDisplay.classList.add('fall', 'animate-pop');
            stockTrendIcon.innerText = '🐻'; // 곰
            
            // 카드 배경 파란색 깜빡임
            stockCard.classList.remove('blink-rise', 'blink-fall');
            void stockCard.offsetWidth;
            stockCard.classList.add('blink-fall');
        } else {
            stockDiffDisplay.innerText = '변동 없음';
            stockDiffDisplay.className = 'diff-val';
            stockTrendIcon.innerText = '➡️';
        }

        // (3) 한계 도달 배지 처리 (5G 또는 20G)
        if (stockPrice >= 20) {
            stockLimitBadge.innerText = '최고치!';
            stockLimitBadge.classList.remove('hidden');
        } else if (stockPrice <= 5) {
            stockLimitBadge.innerText = '최저치!';
            stockLimitBadge.classList.remove('hidden');
        } else {
            stockLimitBadge.classList.add('hidden');
        }

        // --- 2. 채권 카드 업데이트 ---
        const bondPriceDisplay = document.getElementById('bond-price-display');
        const bondTrendIcon = document.getElementById('bond-trend-icon');
        const bondDiffDisplay = document.getElementById('bond-diff-display');
        const bondLimitBadge = document.getElementById('bond-limit-badge');

        const bondDiff = bondPrice - prevBondPrice;

        // (1) 숫자 카운트업/다운 애니메이션
        this.animateNumberValue(bondPriceDisplay, prevBondPrice, bondPrice, 500);

        // (2) 변동값 표시 및 방향 아이콘 연동
        bondDiffDisplay.classList.remove('rise', 'fall', 'animate-pop');
        void bondDiffDisplay.offsetWidth;

        if (bondDiff > 0) {
            bondDiffDisplay.innerText = `+${bondDiff}`;
            bondDiffDisplay.classList.add('rise', 'animate-pop');
            bondTrendIcon.innerText = '🐰'; // 토끼
            
            bondCard.classList.remove('blink-rise', 'blink-fall');
            void bondCard.offsetWidth;
            bondCard.classList.add('blink-rise');
        } else if (bondDiff < 0) {
            bondDiffDisplay.innerText = `${bondDiff}`;
            bondDiffDisplay.classList.add('fall', 'animate-pop');
            bondTrendIcon.innerText = '🐢'; // 거북이
            
            bondCard.classList.remove('blink-rise', 'blink-fall');
            void bondCard.offsetWidth;
            bondCard.classList.add('blink-fall');
        } else {
            bondDiffDisplay.innerText = '변동 없음';
            bondDiffDisplay.className = 'diff-val';
            bondTrendIcon.innerText = '➡️';
        }

        // (3) 한계 도달 배지 처리
        if (bondPrice >= 20) {
            bondLimitBadge.innerText = '최고치!';
            bondLimitBadge.classList.remove('hidden');
        } else if (bondPrice <= 5) {
            bondLimitBadge.innerText = '최저치!';
            bondLimitBadge.classList.remove('hidden');
        } else {
            bondLimitBadge.classList.add('hidden');
        }
    },

    /**
     * 부드러운 숫자 증감 애니메이션을 구동하는 유틸리티 메서드
     */
    animateNumberValue(element, start, end, duration) {
        if (!element) return;
        if (start === end) {
            element.innerText = end;
            return;
        }
        const startTime = performance.now();

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(start + (end - start) * progress);
            element.innerText = value;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.innerText = end;
            }
        }
        requestAnimationFrame(step);
    },

    /**
     * 2단계 투자 전용: 주식/채권 투자 선택 커스텀 모달 팝업을 띄우는 메서드
     * @param {object} player - 구매 또는 판매를 선택하는 플레이어
     * @param {function} onComplete - 작업 종료 시 호출하여 다음 차례로 원활히 연결해주는 콜백
     */
    showInvestmentModal(player, onComplete) {
        const modal = document.getElementById('game-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalFooter = document.getElementById('modal-footer');

        if (!modal || !modalTitle || !modalBody || !modalFooter) {
            onComplete();
            return;
        }

        const stockPrice = getStockPrice();
        const bondPrice = getBondPrice();

        // 1. 모달 텍스트 갱신
        modalTitle.innerHTML = `🏦 ${player.name}님의 투자 은행`;
        modalBody.innerHTML = `
            현재 자산을 불릴 수 있는 두 상품의 가격이에요:<br>
            📈 주식 가격: <strong>${stockPrice}G</strong><br>
            📜 채권 가격: <strong>${bondPrice}G</strong><br><br>
            어떤 금융 거래를 하시겠습니까?<br>
            <span style="font-size: 13px; color: #7f8c8d;">(내 가방: 💰 ${player.gold}G | 📈 주식 ${player.stocks || 0}주 | 📜 채권 ${player.bonds || 0}매)</span>
        `;

        // 2. 푸터 버튼 구성 초기화 및 주입
        modalFooter.innerHTML = '';

        // (1) 주식 사기 버튼
        const buyStockBtn = document.createElement('button');
        buyStockBtn.type = 'button';
        buyStockBtn.className = 'btn-modal btn-buy-stock';
        buyStockBtn.innerHTML = `📈 주식 1주 사기 (-${stockPrice}G)`;
        if (player.gold < stockPrice) {
            buyStockBtn.disabled = true;
        }
        buyStockBtn.addEventListener('click', () => {
            buyStockState(player.id, stockPrice);
            modal.classList.add('hidden');
            onComplete();
        });

        // (2) 채권 사기 버튼
        const buyBondBtn = document.createElement('button');
        buyBondBtn.type = 'button';
        buyBondBtn.className = 'btn-modal btn-buy-bond';
        buyBondBtn.innerHTML = `📜 채권 1매 사기 (-${bondPrice}G)`;
        if (player.gold < bondPrice) {
            buyBondBtn.disabled = true;
        }
        buyBondBtn.addEventListener('click', () => {
            buyBondState(player.id, bondPrice);
            modal.classList.add('hidden');
            onComplete();
        });

        // (3) 주식 팔기 버튼 (보유 시에만 렌더링)
        let sellStockBtn = null;
        if (player.stocks && player.stocks >= 1) {
            sellStockBtn = document.createElement('button');
            sellStockBtn.type = 'button';
            sellStockBtn.className = 'btn-modal btn-sell-stock';
            sellStockBtn.innerHTML = `📉 주식 1주 팔기 (+${stockPrice}G)`;
            sellStockBtn.addEventListener('click', () => {
                sellStockState(player.id, stockPrice);
                modal.classList.add('hidden');
                onComplete();
            });
        }

        // (4) 채권 팔기 버튼 (보유 시에만 렌더링)
        let sellBondBtn = null;
        if (player.bonds && player.bonds >= 1) {
            sellBondBtn = document.createElement('button');
            sellBondBtn.type = 'button';
            sellBondBtn.className = 'btn-modal btn-sell-bond';
            sellBondBtn.innerHTML = `🐢 채권 1매 팔기 (+${bondPrice}G)`;
            sellBondBtn.addEventListener('click', () => {
                sellBondState(player.id, bondPrice);
                modal.classList.add('hidden');
                onComplete();
            });
        }

        // (5) 그냥 지나치기 버튼
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'btn-modal btn-close-modal';
        closeBtn.innerHTML = `☕ 아무것도 안 하고 지나갈래`;
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            onComplete();
        });

        // 푸터 조립
        modalFooter.appendChild(buyStockBtn);
        modalFooter.appendChild(buyBondBtn);
        if (sellStockBtn) modalFooter.appendChild(sellStockBtn);
        if (sellBondBtn) modalFooter.appendChild(sellBondBtn);
        modalFooter.appendChild(closeBtn);

        // 모달창 띄우기
        modal.classList.remove('hidden');
    },

    /**
     * 2단계 투자 전용: 경제 뉴스 카드 알림 모달을 시각적으로 띄우는 메서드
     * @param {object} card - cards.js에서 반환된 뉴스 카드 객체
     * @param {function} onComplete - 닫기 버튼 클릭 시 시세가 반영된 후 다음 턴 전환을 연결해주는 콜백
     */
    showNewsCard(card, onComplete) {
        const modal = document.getElementById('game-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalFooter = document.getElementById('modal-footer');

        if (!modal || !modalTitle || !modalBody || !modalFooter) {
            onComplete();
            return;
        }

        const contentEl = modal.querySelector('.modal-content');
        
        // 1. 카드 타입 및 등락에 따라 CSS 클래스명 분기 지정 (테두리 및 상단 띠 처리)
        contentEl.className = 'modal-content'; // 기본화
        
        if (card.type === 'stock') {
            contentEl.classList.add('stock-news-card');
            modalTitle.innerText = '📈 주식 경제 뉴스';
        } else {
            contentEl.classList.add('bond-news-card');
            modalTitle.innerText = '📜 채권 경제 뉴스';
        }

        if (card.effect > 0) {
            contentEl.classList.add('news-rise');
        } else if (card.effect < 0) {
            contentEl.classList.add('news-fall');
        }

        // 2. 모달 바디 내용 렌더링
        const typeText = card.type === 'stock' ? '주식 가격' : '채권 가격';
        const effectText = card.effect > 0 ? `+${card.effect}` : `${card.effect}`;
        
        modalBody.innerHTML = `
            <div class="news-header-band"></div>
            <div class="news-body-text">"${card.text}"</div>
            <div class="news-effect-box">
                <span>${card.icon} ${typeText} ${effectText}G</span>
            </div>
        `;

        // 3. 모달 푸터 확인 버튼 생성
        modalFooter.innerHTML = '';
        const okBtn = document.createElement('button');
        okBtn.type = 'button';
        okBtn.className = 'btn-modal';
        okBtn.innerText = '확인 (시세 반영) 👍';
        
        // 상승/하락 뱃지 색상과 맞춤 디자인 연동
        if (card.effect > 0) {
            okBtn.classList.add('btn-buy-stock');
        } else if (card.effect < 0) {
            okBtn.classList.add('btn-sell-stock');
        } else {
            okBtn.classList.add('btn-close-modal');
        }

        okBtn.addEventListener('click', () => {
            // 모달을 먼저 닫기
            this.closeNewsCard();

            // 시세 반영 함수 호출 (market.js) -> UI.updateMarketBoard가 자동 호출됨!
            if (card.type === 'stock') {
                const result = updateStockPrice(card.effect);
                if (result.hitLimit && result.message) {
                    alert(result.message);
                }
            } else {
                const result = updateBondPrice(card.effect);
                if (result.hitLimit && result.message) {
                    alert(result.message);
                }
            }

            // 턴 교대 등의 후속 콜백 트리거
            onComplete();
        });

        modalFooter.appendChild(okBtn);

        // 모달 띄우기
        modal.classList.remove('hidden');
    },

    /**
     * 뉴스 모달 닫기 및 스타일 클래스 원상 복귀
     */
    closeNewsCard() {
        const modal = document.getElementById('game-modal');
        const contentEl = modal.querySelector('.modal-content');
        modal.classList.add('hidden');
        contentEl.className = 'modal-content'; // 완전 기본화
    }
};




