




class SzabolcsGame {
  constructor() {
    this.mapData = SZABOLCS_MAP_DATA;
    this.questions = QUESTIONS_DATABASE;

    
    this.players = [
      { id: 'p1', name: 'Játékos 1', color: 'p1', colorHex: '#e74c3c', score: 0, isBot: false, castleCity: null, towers: 3, alive: true, lifelines: { choice: 1, guess: 1 } },
      { id: 'p2', name: 'Mc Isti', color: 'p2', colorHex: '#2ecc71', score: 0, isBot: true, castleCity: null, towers: 3, alive: true, lifelines: { choice: 1, guess: 1 } },
      { id: 'p3', name: 'Subi Roli', color: 'p3', colorHex: '#3498db', score: 0, isBot: true, castleCity: null, towers: 3, alive: true, lifelines: { choice: 1, guess: 1 } }
    ];

    
    this.phase = 'SETUP'; 
    this.currentRound = 1;
    this.maxBattleRounds = 6;
    this.activePlayerIdx = 0;
    this.territoryOwners = {}; 

    
    this.actionLocked = false;
    this.currentPicker = null;

    
    this.questionTimer = null;
    this.briefingTimer = null;
    this.botTimeouts = [];
    this.animTimeouts = [];

    this.timeLeft = 20;
    this.briefingTimeLeft = 5;
    this.briefingTimeLeft = 2;
    this.currentQuestion = null;
    this.playerAnswers = {};
    this.pendingConquerors = [];

    
    this.battleAttacker = null;
    this.battleDefender = null;
    this.battleAttackerCity = null;
    this.battleTargetCity = null;

    
    this.isOnlineGame = false;
    this.myPlayerId = 'p1';
    this.isHost = false;
    this.multiplayer = null;

    
    this.choiceDeck = [];
    this.guessDeck = [];
    this.matchUsedQuestions = new Set();
    this.lastQuestionType = null;
    this.initQuestionDecks();

    this.dom = {};
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.renderMap();
    this.openStartModal();

    if (typeof SzabolcsMultiplayer !== 'undefined') {
      this.multiplayer = new SzabolcsMultiplayer(this);
      this.multiplayer.init();
    }
  }

  cacheDom() {
    this.dom.svgMap = document.getElementById('szabolcs-map');
    this.dom.phaseText = document.getElementById('phase-text');
    this.dom.roundText = document.getElementById('round-text');
    this.dom.turnBanner = document.getElementById('turn-banner');
    this.dom.turnBannerText = document.getElementById('turn-banner-text');
    this.dom.turnBannerBadge = document.getElementById('turn-banner-badge');
    this.dom.instructionText = document.getElementById('instruction-text');
    this.dom.logArea = document.getElementById('log-area');
    this.dom.previewBox = document.getElementById('territory-preview');

    this.dom.pCards = [
      document.getElementById('card-p1'),
      document.getElementById('card-p2'),
      document.getElementById('card-p3')
    ];

    this.dom.modalOverlay = document.getElementById('modal-overlay');
    this.dom.startModal = document.getElementById('start-modal');
    this.dom.briefingModal = document.getElementById('briefing-modal');
    this.dom.quizModal = document.getElementById('quiz-modal');
    this.dom.victoryModal = document.getElementById('victory-modal');

    
    this.dom.briefingBadge = document.getElementById('briefing-badge');
    this.dom.briefingTitle = document.getElementById('briefing-title');
    this.dom.briefingAttackerCard = document.getElementById('briefing-attacker-card');
    this.dom.briefingAttackerAvatar = document.getElementById('briefing-attacker-avatar');
    this.dom.briefingAttackerName = document.getElementById('briefing-attacker-name');
    this.dom.briefingDefenderCard = document.getElementById('briefing-defender-card');
    this.dom.briefingDefenderAvatar = document.getElementById('briefing-defender-avatar');
    this.dom.briefingDefenderName = document.getElementById('briefing-defender-name');
    this.dom.briefingStakes = document.getElementById('briefing-stakes');
    this.dom.btnReadyQuestion = document.getElementById('btn-ready-question');
    this.dom.briefingCountdown = document.getElementById('briefing-countdown-text');

    
    this.dom.quizTopic = document.getElementById('quiz-topic');
    this.dom.timerCircle = document.getElementById('timer-circle');
    this.dom.questionText = document.getElementById('question-text');
    this.dom.choicesGrid = document.getElementById('choices-grid');
    this.dom.guessWrap = document.getElementById('guess-wrap');
    this.dom.guessInput = document.getElementById('guess-input');
    this.dom.guessUnit = document.getElementById('guess-unit');
    this.dom.guessSlider = document.getElementById('guess-slider');
    this.dom.btnSubmitGuess = document.getElementById('btn-submit-guess');
    this.dom.revealBox = document.getElementById('reveal-box');

    
    this.dom.btnLifelineChoice = document.getElementById('btn-lifeline-choice');
    this.dom.countLifelineChoice = document.getElementById('count-lifeline-choice');
    this.dom.btnLifelineGuess = document.getElementById('btn-lifeline-guess');
    this.dom.countLifelineGuess = document.getElementById('count-lifeline-guess');

    
    this.dom.spectatorBanner = document.getElementById('spectator-banner');
    this.dom.answerStatusPill = document.getElementById('answer-status-pill');
  }

  bindEvents() {
    
    document.getElementById('btn-mute').addEventListener('click', (e) => {
      const isMuted = sounds.toggleMute();
      e.currentTarget.innerHTML = isMuted ? '🔇 Néma' : '🔊 Hang';
    });

    
    document.getElementById('btn-restart').addEventListener('click', () => {
      this.resetAllTimers();
      this.openStartModal();
    });

    
    document.getElementById('btn-start-game').addEventListener('click', () => {
      this.startNewGame();
    });

    
    if (this.dom.btnReadyQuestion) {
      this.dom.btnReadyQuestion.style.display = 'none';
      this.dom.btnReadyQuestion.addEventListener('click', () => {
        sounds.playClick();
        clearInterval(this.briefingTimer);
        this.launchQuestionModal();
      });
    }

    
    document.querySelectorAll('.btn-adjust').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const delta = parseInt(e.target.dataset.delta);
        let val = (parseInt(this.dom.guessInput.value) || 0) + delta;
        val = Math.max(0, val);
        this.dom.guessInput.value = val;
        this.dom.guessSlider.value = Math.min(parseInt(this.dom.guessSlider.max), val);
        sounds.playClick();
      });
    });

    
    this.dom.guessSlider.addEventListener('input', (e) => {
      this.dom.guessInput.value = e.target.value;
    });

    this.dom.guessInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value) || 0;
      this.dom.guessSlider.value = Math.min(parseInt(this.dom.guessSlider.max), val);
    });

    this.dom.guessInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.submitGuess();
      }
    });

    this.dom.btnSubmitGuess.addEventListener('click', () => {
      this.submitGuess();
    });

    
    this.dom.btnLifelineChoice.addEventListener('click', () => this.useLifelineChoice());
    this.dom.btnLifelineGuess.addEventListener('click', () => this.useLifelineGuess());

    
    document.getElementById('btn-play-again').addEventListener('click', () => {
      this.closeModal();
      this.openStartModal();
    });

    
    window.addEventListener('keydown', (e) => {
      if (this.dom.quizModal.style.display === 'block' && this.currentQuestion && this.currentQuestion.type === 'choice') {
        if (!this.isHumanParticipatingInCurrentQuestion()) return;
        const keyMap = { '1': 0, '2': 1, '3': 2, '4': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
        const k = e.key.toLowerCase();
        if (keyMap[k] !== undefined) {
          const btns = this.dom.choicesGrid.querySelectorAll('.choice-btn');
          if (btns[keyMap[k]] && !btns[keyMap[k]].disabled) {
            btns[keyMap[k]].click();
          }
        }
      }
    });
  }

  submitGuess() {
    if (this.dom.btnSubmitGuess.disabled) return;
    if (!this.isHumanParticipatingInCurrentQuestion()) return;
    sounds.playClick();
    this.dom.btnSubmitGuess.disabled = true;
    this.dom.guessInput.disabled = true;
    const val = parseInt(this.dom.guessInput.value) || 0;
    const myId = this.isOnlineGame ? this.myPlayerId : this.players[0].id;
    const timeSpent = Math.max(0.1, 20 - this.timeLeft);
    this.handlePlayerAnswer(myId, val, timeSpent);
    if (this.isOnlineGame && this.multiplayer) {
      this.multiplayer.sendAction('SUBMIT_ANSWER', { playerId: myId, answer: val, timeSpent: timeSpent });
    }
  }

  
  resetAllTimers() {
    clearInterval(this.questionTimer);
    clearInterval(this.briefingTimer);
    this.botTimeouts.forEach(t => clearTimeout(t));
    this.botTimeouts = [];
    this.animTimeouts.forEach(t => clearTimeout(t));
    this.animTimeouts = [];
    this.actionLocked = false;
    this.currentPicker = null;
  }

  
  
  
  
  
  
  renderMap() {
    const W = this.mapData.width;
    const H = this.mapData.height;

    this.dom.svgMap.setAttribute('viewBox', `0 0 ${W} ${H}`);
    this.dom.svgMap.innerHTML = '';

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <clipPath id="szabolcs-clip">
        <path d="${this.mapData.border_path}" />
      </clipPath>
      <marker id="arrow-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#ff4757" />
      </marker>
      <filter id="cartouche-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#1a0f0a" flood-opacity="0.35" />
      </filter>
    `;
    this.dom.svgMap.appendChild(defs);

    
    
    
    const decorGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    decorGroup.setAttribute('class', 'vintage-decorations');
    decorGroup.setAttribute('pointer-events', 'none');

    
    let rhumbLinesHtml = '';
    const angles = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5];
    angles.forEach(deg => {
      const rad = deg * (Math.PI / 180);
      const x2 = 105 + Math.cos(rad) * 900;
      const y2 = 115 + Math.sin(rad) * 900;
      rhumbLinesHtml += `<line x1="105" y1="115" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#b89358" stroke-width="0.7" opacity="0.22" stroke-dasharray="8,6" />`;

      const x3 = 830 + Math.cos(rad) * 700;
      const y3 = 580 + Math.sin(rad) * 700;
      rhumbLinesHtml += `<line x1="830" y1="580" x2="${x3.toFixed(1)}" y2="${y3.toFixed(1)}" stroke="#b89358" stroke-width="0.6" opacity="0.18" stroke-dasharray="6,8" />`;
    });

    decorGroup.innerHTML = `
      <!-- Antik térkép kettős díszkeret -->
      <rect x="8" y="8" width="934" height="684" fill="none" stroke="#7a552b" stroke-width="2.5" rx="5" />
      <rect x="13" y="13" width="924" height="674" fill="none" stroke="#c8a84e" stroke-width="1" stroke-dasharray="8,4" opacity="0.6" />

      <!-- Barokk sarokornamentika a 4 sarokban -->
      <!-- Bal felső -->
      <path d="M 14,35 Q 28,28 35,14 M 14,48 Q 42,42 48,14 M 22,22 L 32,32" stroke="#8b6914" stroke-width="1.5" fill="none" opacity="0.75" />
      <circle cx="28" cy="28" r="3" fill="#8b6914" opacity="0.6" />
      <!-- Jobb felső -->
      <path d="M 936,35 Q 922,28 915,14 M 936,48 Q 908,42 902,14 M 928,22 L 918,32" stroke="#8b6914" stroke-width="1.5" fill="none" opacity="0.75" />
      <circle cx="922" cy="28" r="3" fill="#8b6914" opacity="0.6" />
      <!-- Bal alsó -->
      <path d="M 14,665 Q 28,672 35,686 M 14,652 Q 42,658 48,686 M 22,678 L 32,668" stroke="#8b6914" stroke-width="1.5" fill="none" opacity="0.75" />
      <circle cx="28" cy="672" r="3" fill="#8b6914" opacity="0.6" />
      <!-- Jobb alsó -->
      <path d="M 936,665 Q 922,672 915,686 M 936,652 Q 908,658 902,686 M 928,678 L 918,668" stroke="#8b6914" stroke-width="1.5" fill="none" opacity="0.75" />
      <circle cx="922" cy="672" r="3" fill="#8b6914" opacity="0.6" />

      <!-- Koncentrikus navigációs körök -->
      <circle cx="105" cy="115" r="90" fill="none" stroke="#b89358" stroke-width="0.8" stroke-dasharray="3,5" opacity="0.25" />
      <circle cx="105" cy="115" r="180" fill="none" stroke="#b89358" stroke-width="0.6" stroke-dasharray="4,6" opacity="0.18" />
      <circle cx="830" cy="580" r="110" fill="none" stroke="#b89358" stroke-width="0.8" stroke-dasharray="3,5" opacity="0.22" />

      <!-- Sugaras navigációs vonalak -->
      ${rhumbLinesHtml}

      <!-- Történelmi szomszédos tájegységek antik vízjelei a háttérben -->
      <text x="780" y="85" class="vintage-region-watermark" transform="rotate(-6 780 85)">• UNG ÉS BEREG VÁRMEGYE •</text>
      <text x="145" y="275" class="vintage-region-watermark" transform="rotate(-18 145 275)">• ZEMPLÉN VÁRMEGYE •</text>
      <text x="95" y="495" class="vintage-region-watermark" transform="rotate(28 95 495)">• HAJDÚ KERÜLET •</text>
      <text x="825" y="635" class="vintage-region-watermark" transform="rotate(-10 825 635)">• SZATMÁR VÁRMEGYE •</text>
      <text x="880" y="230" class="vintage-region-watermark" transform="rotate(50 880 230)">KÁRPÁTALJA</text>

      <!-- Antik vitorlás sószállító hajó a Tisza felső kanyarulatánál -->
      <g class="tisza-ship" opacity="0.5" transform="translate(262, 235) scale(0.9)">
        <path d="M -16,5 Q 0,11 16,5 L 12,10 Q 0,14 -12,10 Z" fill="#4a3524" stroke="#2c1810" stroke-width="1.2" />
        <line x1="0" y1="5" x2="0" y2="-17" stroke="#2c1810" stroke-width="1.6" />
        <path d="M 0,-15 Q 10,-8 0,-2 Z" fill="#ffffff" stroke="#8b6914" stroke-width="1" />
        <path d="M 0,-15 Q -8,-9 0,-3 Z" fill="#f5e8cc" stroke="#8b6914" stroke-width="0.8" />
        <text x="0" y="22" class="vintage-ship-label">A szőke Tisza</text>
      </g>

      <!-- Díszes antik térkép címertábla és lépték (Cartouche) a bal alsó sarokban -->
      <g class="map-cartouche" transform="translate(30, 580)" filter="url(#cartouche-shadow)">
        <rect x="0" y="0" width="205" height="92" rx="6" fill="#fdf7ea" stroke="#7a552b" stroke-width="2" />
        <rect x="4" y="4" width="197" height="84" rx="4" fill="none" stroke="#c8a84e" stroke-width="1" />
        
        <!-- Korona és kardok miniatűr motívum -->
        <text x="102" y="19" font-family="'Cinzel', serif" font-size="12" text-anchor="middle" fill="#8b6914">⚔ 👑 ⚔</text>
        <text x="102" y="34" class="cartouche-title">SZABOLCSI HADITÉRKÉP</text>
        <text x="102" y="46" class="cartouche-subtitle">Királyi Műveltségi Hadjárat • Anno Domini</text>
        
        <line x1="25" y1="52" x2="180" y2="52" stroke="#c8a84e" stroke-width="0.8" />
        
        <!-- Grafikus lépték (Scale bar) -->
        <g transform="translate(28, 58)">
          <rect x="0" y="0" width="37" height="5" fill="#2c1810" stroke="#7a552b" stroke-width="0.8" />
          <rect x="37" y="0" width="37" height="5" fill="#c8a84e" stroke="#7a552b" stroke-width="0.8" />
          <rect x="74" y="0" width="37" height="5" fill="#2c1810" stroke="#7a552b" stroke-width="0.8" />
          <rect x="111" y="0" width="37" height="5" fill="#c8a84e" stroke="#7a552b" stroke-width="0.8" />
          
          <text x="0" y="15" class="scale-text">0</text>
          <text x="74" y="15" class="scale-text">15</text>
          <text x="148" y="15" class="scale-text">30 km</text>
          <text x="74" y="24" class="scale-label">Magyar mérföld lépték</text>
        </g>
      </g>
    `;
    this.dom.svgMap.appendChild(decorGroup);

    
    
    
    const bgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    bgGroup.innerHTML = `
      <path class="county-shadow" d="${this.mapData.border_path}" transform="translate(4, 6)" />
      <path class="county-bg" d="${this.mapData.border_path}" />
    `;
    this.dom.svgMap.appendChild(bgGroup);

    
    const cellsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    cellsGroup.setAttribute('clip-path', 'url(#szabolcs-clip)');

    this.mapData.cities.forEach(c => {
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const ptsStr = c.voronoi_points.map(p => `${p[0]},${p[1]}`).join(' ');
      poly.setAttribute('points', ptsStr);
      poly.setAttribute('class', 'territory-cell neutral');
      poly.setAttribute('id', `poly-${c.id}`);
      poly.setAttribute('data-id', c.id);

      poly.addEventListener('mouseenter', () => this.onTerritoryHover(c));
      poly.addEventListener('click', () => this.onTerritoryClick(c));

      cellsGroup.appendChild(poly);
    });
    this.dom.svgMap.appendChild(cellsGroup);

    
    const borderOutline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    borderOutline.setAttribute('d', this.mapData.border_path);
    borderOutline.setAttribute('fill', 'none');
    borderOutline.setAttribute('stroke', '#8b6914');
    borderOutline.setAttribute('stroke-width', '2.8');
    borderOutline.setAttribute('pointer-events', 'none');
    this.dom.svgMap.appendChild(borderOutline);

    
    const riverGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    riverGroup.setAttribute('clip-path', 'url(#szabolcs-clip)');
    riverGroup.setAttribute('class', 'rivers-layer');
    riverGroup.setAttribute('pointer-events', 'none');

    const tiszaPath = "M 890,310 Q 840,270 780,295 T 710,285 T 650,290 T 580,220 T 540,85 T 460,160 T 340,240 T 240,265 T 170,315 T 150,380 T 130,420";
    const szamosPath = "M 810,510 Q 770,460 740,420 T 680,360 T 650,290";
    const krasznaPath = "M 690,470 Q 670,430 655,360 T 650,290";

    riverGroup.innerHTML = `
      <path d="${tiszaPath}" class="river-glow" />
      <path d="${tiszaPath}" class="river-main" />
      <path d="${szamosPath}" class="river-glow" />
      <path d="${szamosPath}" class="river-main" />
      <path d="${krasznaPath}" class="river-glow" />
      <path d="${krasznaPath}" class="river-main" />
      <text x="210" y="275" class="river-label" transform="rotate(-15 210 275)">TISZA</text>
      <text x="735" y="405" class="river-label" transform="rotate(-40 735 405)">SZAMOS</text>
    `;
    this.dom.svgMap.appendChild(riverGroup);

    
    const compassGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    compassGroup.setAttribute('class', 'compass-rose');
    compassGroup.setAttribute('transform', 'translate(105, 115)');
    compassGroup.setAttribute('pointer-events', 'none');
    compassGroup.innerHTML = `
      <circle r="42" fill="none" stroke="#8b6914" stroke-width="1.4" stroke-dasharray="2,3" opacity="0.6" />
      <circle r="35" fill="rgba(255,248,235,0.88)" stroke="#c8a84e" stroke-width="2" />
      <circle r="27" fill="none" stroke="#8b6914" stroke-width="0.9" opacity="0.5" />
      <polygon points="0,-34 4,-9 0,0" fill="#c8a84e" />
      <polygon points="0,-34 -4,-9 0,0" fill="#5a3e2b" />
      <polygon points="0,34 4,9 0,0" fill="#5a3e2b" />
      <polygon points="0,34 -4,9 0,0" fill="#c8a84e" />
      <polygon points="34,0 9,4 0,0" fill="#c8a84e" />
      <polygon points="34,0 9,-4 0,0" fill="#5a3e2b" />
      <polygon points="-34,0 -9,4 0,0" fill="#5a3e2b" />
      <polygon points="-34,0 -9,-4 0,0" fill="#c8a84e" />
      <polygon points="22,-22 7,-2 0,0" fill="#c8a84e" opacity="0.85" />
      <polygon points="22,-22 2,-7 0,0" fill="#5a3e2b" opacity="0.85" />
      <polygon points="-22,-22 -2,-7 0,0" fill="#c8a84e" opacity="0.85" />
      <polygon points="-22,-22 -7,-2 0,0" fill="#5a3e2b" opacity="0.85" />
      <polygon points="22,22 2,7 0,0" fill="#c8a84e" opacity="0.85" />
      <polygon points="22,22 7,2 0,0" fill="#5a3e2b" opacity="0.85" />
      <polygon points="-22,22 -7,2 0,0" fill="#c8a84e" opacity="0.85" />
      <polygon points="-22,22 -2,7 0,0" fill="#5a3e2b" opacity="0.85" />
      <circle r="3.5" fill="#2c1810" stroke="#ffd700" stroke-width="1.2" />
      <text x="0" y="-39" class="compass-label compass-north">É</text>
      <text x="42" y="4.5" class="compass-label">K</text>
      <text x="0" y="49" class="compass-label">D</text>
      <text x="-43" y="4.5" class="compass-label">NY</text>
      <text x="0" y="68" font-family="'Cinzel', serif" font-size="10.5" font-weight="900" fill="#2c1810" text-anchor="middle" letter-spacing="1.5">SZABOLCS</text>
      <text x="0" y="80" font-family="'Lora', serif" font-style="italic" font-size="9" font-weight="700" fill="#8b6914" text-anchor="middle">Vármegye</text>
    `;
    this.dom.svgMap.appendChild(compassGroup);

    
    const battleLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    battleLayer.setAttribute('id', 'battle-layer');
    this.dom.svgMap.appendChild(battleLayer);

    
    const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodesGroup.setAttribute('class', 'city-nodes-group');

    this.mapData.cities.forEach(c => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'city-node');
      g.setAttribute('id', `node-${c.id}`);

      const castleG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      castleG.setAttribute('id', `castle-${c.id}`);
      castleG.setAttribute('class', 'castle-badge');
      castleG.style.display = 'none';

      g.innerHTML = `
        <!-- Város bástya pont: 3 rétegű királyi arany-rubin jelölő -->
        <circle cx="${c.x}" cy="${c.y}" r="6.5" class="city-point-outer" />
        <circle cx="${c.x}" cy="${c.y}" r="3.8" class="city-point-inner" />
        <circle cx="${c.x}" cy="${c.y}" r="1.2" fill="#ffffff" />

        <!-- Város neve: vastag, tiszta fehér körvonallal és árnyékkal a 100%-os láthatóságért -->
        <text class="city-label" x="${c.x}" y="${c.y + 15}">${c.name}</text>

        <!-- Pontszám jelvény: elegáns arany keretes bőrtáblácska -->
        <g class="city-badge-wrap" transform="translate(${c.x}, ${c.y + 25})">
          <rect x="-24" y="-8.5" width="48" height="15" rx="7.5" class="city-points-rect" />
          <text class="city-points-badge" x="0" y="2.8">${c.points} pt</text>
        </g>
      `;
      g.appendChild(castleG);
      nodesGroup.appendChild(g);
    });
    this.dom.svgMap.appendChild(nodesGroup);
  }

  
  
  
  renderCastleBadgeSvg(player, towers, city) {
    const cx = city.x;
    const cy = city.y;
    const pColor = player.colorHex;

    if (towers <= 0) {
      return `
        <g class="castle-ruins">
          <ellipse cx="${cx}" cy="${cy - 7}" rx="18" ry="5" fill="#1a110b" opacity="0.65" />
          <path d="M ${cx - 15},${cy - 6} L ${cx - 11},${cy - 14} L ${cx - 7},${cy - 8} L ${cx - 3},${cy - 16} L ${cx + 3},${cy - 9} L ${cx + 8},${cy - 15} L ${cx + 14},${cy - 6} Z" fill="#4a3b32" stroke="#2c1810" stroke-width="1.2" />
          <path d="M ${cx - 6},${cy - 12} L ${cx - 2},${cy - 20} L ${cx + 2},${cy - 15} L ${cx + 7},${cy - 11}" stroke="#1a0f0a" stroke-width="1.5" fill="none" />
          <line x1="${cx - 8}" y1="${cy - 7}" x2="${cx - 14}" y2="${cy - 18}" stroke="#555" stroke-width="1.5" />
          <polygon points="${cx - 14},${cy - 18} ${cx - 22},${cy - 14} ${cx - 14},${cy - 10}" fill="${pColor}" opacity="0.6" />
          <g transform="translate(0, -6)">
            <rect x="${cx - 25}" y="${cy - 36}" width="50" height="13" rx="3" fill="#1a0f0a" stroke="#e74c3c" stroke-width="1.5" />
            <text x="${cx}" y="${cy - 27}" font-family="Cinzel, serif" font-size="8.5" font-weight="900" fill="#e74c3c" text-anchor="middle">💀 ELESETT</text>
          </g>
        </g>
      `;
    }

    const roman = ['💀', 'I', 'II', 'III'][towers] || 'III';

    
    const centerTower = `
      <rect x="${cx - 6}" y="${cy - 28}" width="12" height="18" fill="#5c4a3d" stroke="#2c1810" stroke-width="1.2" />
      <path d="M ${cx - 7},${cy - 28} h 3 v -3 h 3 v 3 h 2 v -3 h 3 v 3 h 3" stroke="#2c1810" stroke-width="1.2" fill="none" />
      <rect x="${cx - 1}" y="${cy - 23}" width="2" height="5" fill="#1a0f0a" rx="0.5" />
      <line x1="${cx}" y1="${cy - 28}" x2="${cx}" y2="${cy - 39}" stroke="#c8a84e" stroke-width="1.5" />
      <polygon points="${cx},${cy - 39} ${cx + 12},${cy - 34} ${cx},${cy - 29}" fill="${pColor}" stroke="#c8a84e" stroke-width="0.8" />
    `;

    
    const leftTower = (towers >= 2) ? `
      <rect x="${cx - 17}" y="${cy - 23}" width="9" height="14" fill="#4d3d32" stroke="#2c1810" stroke-width="1.2" />
      <path d="M ${cx - 18},${cy - 23} h 2.5 v -2.5 h 2.5 v 2.5 h 2 v -2.5 h 2.5 v 2.5 h 1.5" stroke="#2c1810" stroke-width="1" fill="none" />
      <rect x="${cx - 14}" y="${cy - 19}" width="2" height="4" fill="#1a0f0a" rx="0.5" />
      <polygon points="${cx - 12.5},${cy - 25.5} ${cx - 17},${cy - 23} ${cx - 8},${cy - 23}" fill="${pColor}" opacity="0.85" />
    ` : `
      <path d="M ${cx - 18},${cy - 9} L ${cx - 16},${cy - 15} L ${cx - 12},${cy - 11} L ${cx - 9},${cy - 9}" fill="#33241b" stroke="#1a0f0a" stroke-width="1" />
    `;

    
    const rightTower = (towers >= 3) ? `
      <rect x="${cx + 8}" y="${cy - 23}" width="9" height="14" fill="#4d3d32" stroke="#2c1810" stroke-width="1.2" />
      <path d="M ${cx + 7},${cy - 23} h 2.5 v -2.5 h 2.5 v 2.5 h 2 v -2.5 h 2.5 v 2.5 h 1.5" stroke="#2c1810" stroke-width="1" fill="none" />
      <rect x="${cx + 12}" y="${cy - 19}" width="2" height="4" fill="#1a0f0a" rx="0.5" />
      <polygon points="${cx + 12.5},${cy - 25.5} ${cx + 8},${cy - 23} ${cx + 17},${cy - 23}" fill="${pColor}" opacity="0.85" />
    ` : `
      <path d="M ${cx + 8},${cy - 9} L ${cx + 11},${cy - 14} L ${cx + 15},${cy - 11} L ${cx + 17},${cy - 9}" fill="#33241b" stroke="#1a0f0a" stroke-width="1" />
      <text x="${cx + 12}" y="${cy - 15}" font-size="9">🔥</text>
    `;

    return `
      <g class="castle-fortress" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.7))">
        <ellipse cx="${cx}" cy="${cy - 7}" rx="20" ry="5.5" fill="#1a110b" opacity="0.6" />
        <rect x="${cx - 17}" y="${cy - 16}" width="34" height="10" fill="#3f3127" stroke="#2c1810" stroke-width="1.2" />
        <path d="M ${cx - 3.5},${cy - 6} v -5 a 3.5 3.5 0 0 1 7 0 v 5 z" fill="#120a06" stroke="#2c1810" stroke-width="0.8" />
        ${leftTower}
        ${rightTower}
        ${centerTower}
        <g class="castle-banner-tag" transform="translate(0, -6)">
          <rect x="${cx - 25}" y="${cy - 43}" width="50" height="13" rx="3" fill="#2c1810" stroke="${pColor}" stroke-width="1.5" />
          <rect x="${cx - 23}" y="${cy - 41}" width="46" height="9" rx="1.5" fill="rgba(0,0,0,0.4)" />
          <text x="${cx}" y="${cy - 33.5}" font-family="Cinzel, serif" font-size="8.5" font-weight="900" fill="#f5e6c8" text-anchor="middle" letter-spacing="0.8px">
            🏰 VÁR ${roman}
          </text>
        </g>
      </g>
    `;
  }

  updateCastleBadge(city, player, towers) {
    const castleBadge = document.getElementById(`castle-${city.id}`);
    if (!castleBadge) return;
    castleBadge.style.display = 'block';
    castleBadge.innerHTML = this.renderCastleBadgeSvg(player, towers, city);
  }

  drawAttackAnimation(fromCity, toCity) {
    this.clearBattleAnimations();
    const battleLayer = document.getElementById('battle-layer');
    if (!battleLayer || !toCity) return;

    if (!fromCity || fromCity.id === toCity.id) {
      const poly = document.getElementById(`poly-${toCity.id}`);
      if (poly) poly.classList.add('under-attack');
      return;
    }

    const dx = toCity.x - fromCity.x;
    const dy = toCity.y - fromCity.y;
    const dist = Math.hypot(dx, dy) || 1;
    const trim = Math.min(22, dist * 0.28);
    const ux = dx / dist;
    const uy = dy / dist;

    const x1 = fromCity.x + ux * trim;
    const y1 = fromCity.y + uy * trim;
    const x2 = toCity.x - ux * trim;
    const y2 = toCity.y - uy * trim;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('class', 'attack-arrow-line');
    line.setAttribute('marker-end', 'url(#arrow-head)');
    battleLayer.appendChild(line);

    const swordsG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    swordsG.setAttribute('class', 'clashing-swords-node');
    swordsG.innerHTML = `
      <circle cx="${toCity.x}" cy="${toCity.y - 18}" r="15" fill="#ff4757" opacity="0.9" />
      <text x="${toCity.x}" y="${toCity.y - 12}" font-size="15" text-anchor="middle">⚔️</text>
    `;
    battleLayer.appendChild(swordsG);

    const poly = document.getElementById(`poly-${toCity.id}`);
    if (poly) poly.classList.add('under-attack');
  }

  clearBattleAnimations() {
    const battleLayer = document.getElementById('battle-layer');
    if (battleLayer) battleLayer.innerHTML = '';
    this.mapData.cities.forEach(c => {
      const poly = document.getElementById(`poly-${c.id}`);
      if (poly) poly.classList.remove('under-attack');
    });
  }

  onTerritoryHover(city) {
    const ownerId = this.territoryOwners[city.id];
    let ownerText = 'Független terület';
    let ownerColor = 'var(--text-muted)';

    if (ownerId) {
      const p = this.players.find(x => x.id === ownerId);
      ownerText = `${p.name} birtoka`;
      ownerColor = p.colorHex;
    }

    const isBase = this.players.some(p => p.castleCity === city.id);
    const baseBadge = isBase ? ' 🏰 [BÁZIS VÁR]' : '';

    this.dom.previewBox.innerHTML = `
      <div class="name" style="color: ${ownerColor}">${city.name}${baseBadge}</div>
      <div class="region-tag">${city.region}</div>
      <div class="desc">${city.desc}</div>
      <div class="meta-row">
        <span>Érték: <strong>${city.points} pont</strong></span>
        <span>Birtokos: <strong style="color:${ownerColor}">${ownerText}</strong></span>
      </div>
    `;
  }

  
  onTerritoryClick(city) {
    if (this.actionLocked) return;

    sounds.playClick();

    if (this.phase === 'BASE_SELECT') {
      this.handleBaseSelection(city);
    } else if (this.phase === 'EXPANSION') {
      this.handleExpansionTerritoryPick(city);
    } else if (this.phase === 'BATTLE') {
      this.handleBattleAttackTarget(city);
    }
  }

  openStartModal() {
    this.dom.modalOverlay.style.display = 'flex';
    this.dom.modalOverlay.classList.add('active');
    this.dom.startModal.style.display = 'block';
    this.dom.briefingModal.style.display = 'none';
    this.dom.quizModal.style.display = 'none';
    this.dom.victoryModal.style.display = 'none';
  }

  closeModal() {
    this.dom.modalOverlay.classList.remove('active');
    this.dom.modalOverlay.style.display = 'none';
    this.dom.startModal.style.display = 'none';
    this.dom.briefingModal.style.display = 'none';
    this.dom.quizModal.style.display = 'none';
    this.dom.victoryModal.style.display = 'none';
  }

  
  
  
  startNewGame() {
    this.resetAllTimers();
    this.isOnlineGame = false;
    this.myPlayerId = 'p1';
    this.isHost = true;

    const p1Name = document.getElementById('player-name-input').value.trim() || 'Játékos 1';

    this.players[0].name = p1Name;
    this.players[0].isBot = false;
    this.players[0].score = 0;
    this.players[0].towers = 3;
    this.players[0].castleCity = null;
    this.players[0].alive = true;
    this.players[0].lifelines = { choice: 1, guess: 1 };

    this.players[1].name = 'Mc Isti';
    this.players[1].isBot = true;
    this.players[1].score = 0;
    this.players[1].towers = 3;
    this.players[1].castleCity = null;
    this.players[1].alive = true;
    this.players[1].lifelines = { choice: 1, guess: 1 };

    this.players[2].name = 'Subi Roli';
    this.players[2].isBot = true;
    this.players[2].score = 0;
    this.players[2].towers = 3;
    this.players[2].castleCity = null;
    this.players[2].alive = true;
    this.players[2].lifelines = { choice: 1, guess: 1 };

    this.territoryOwners = {};
    this.currentRound = 1;
    this.activePlayerIdx = 0;
    this.actionLocked = false;
    this.currentPicker = null;
    this.matchUsedQuestions.clear();
    this.lastQuestionType = null;
    if (!this.choiceDeck || this.choiceDeck.length < 15 || !this.guessDeck || this.guessDeck.length < 10) {
      this.initQuestionDecks();
    }
    this.clearBattleAnimations();
    this.updateLifelineButtons();

    this.players.forEach((p, idx) => {
      const card = this.dom.pCards[idx];
      card.querySelector('.player-name').innerText = p.name;
      const botTag = card.querySelector('.bot-tag');
      if (botTag) botTag.style.display = p.isBot ? 'inline-block' : 'none';
      card.querySelector('.castle-towers').innerText = '🏰 🏰 🏰';
      card.querySelector('.score').innerText = '0';
      card.querySelector('.sub-stat').innerText = '0 város';
      card.style.opacity = '1';
    });

    this.mapData.cities.forEach(c => {
      const poly = document.getElementById(`poly-${c.id}`);
      poly.setAttribute('class', 'territory-cell neutral');
      const castleBadge = document.getElementById(`castle-${c.id}`);
      castleBadge.style.display = 'none';
      castleBadge.innerHTML = '';
    });

    this.dom.logArea.innerHTML = '';
    this.logEvent('Új hadjárat indult Szabolcs-Szatmár-Bereg vármegyében!', 'gold');
    this.closeModal();

    this.startBaseSelectionPhase();
  }

  
  
  
  startBaseSelectionPhase() {
    this.phase = 'BASE_SELECT';
    this.dom.phaseText.innerText = '1. Fázis: Bázisválasztás';
    this.dom.roundText.innerText = 'Kezdés';
    this.activePlayerIdx = 0;
    this.promptNextBaseSelection();
  }

  promptNextBaseSelection() {
    if (this.activePlayerIdx >= this.players.length) {
      this.actionLocked = true;
      this.updateTurnBanner('🏰 Minden vezér felépítette várát! Kezdődik a Honfoglalás!', '2. Fázis');
      this.logEvent('Minden vezér felépítette várát! Kezdődik a Honfoglalás!', 'gold');
      sounds.playBattleHorn();
      const t = setTimeout(() => this.startExpansionPhase(), 1500);
      this.animTimeouts.push(t);
      return;
    }

    const player = this.players[this.activePlayerIdx];
    this.highlightActiveCard(this.activePlayerIdx);

    if (this.isOnlineGame) {
      if (player.id === this.myPlayerId) {
        this.actionLocked = false;
        this.updateTurnBanner(`🚩 A TE KÖRÖD: Válassz bázisvárost a térképen!`, '1. Fázis');
        this.setInstruction(`Kattints egy szabad szabolcsi városra a bázisod felépítéséhez!`);
        this.markAvailableBaseCities();
      } else {
        this.actionLocked = true;
        this.updateTurnBanner(`🚩 ${player.name} bázisvárost választ...`, '1. Fázis');
        this.setInstruction(`${player.name} épp bázisvárost választ a térképen...`);
        this.cleanTargetableCells();
        if (player.isBot && this.isHost) {
          const t = setTimeout(() => this.botPickBase(player), 1200);
          this.botTimeouts.push(t);
        }
      }
      return;
    }

    if (player.isBot) {
      this.actionLocked = true;
      this.updateTurnBanner(`🤖 ${player.name} bázisvárost választ...`, '1. Fázis');
      this.setInstruction(`${player.name} bázisvárost választ a térképen...`);
      const t = setTimeout(() => this.botPickBase(player), 1300);
      this.botTimeouts.push(t);
    } else {
      this.actionLocked = false;
      this.updateTurnBanner(`🚩 ${player.name} köre: Válassz bázisvárost!`, '1. Fázis');
      this.setInstruction(`${player.name}, válassz ki egy várost a térképen a BÁZISODNAK!`);
      this.markAvailableBaseCities();
    }
  }

  markAvailableBaseCities() {
    this.mapData.cities.forEach(c => {
      const poly = document.getElementById(`poly-${c.id}`);
      if (!this.territoryOwners[c.id]) {
        poly.classList.add('targetable');
      } else {
        poly.classList.remove('targetable');
      }
    });
  }

  handleBaseSelection(city) {
    if (this.actionLocked) return;
    if (this.phase !== 'BASE_SELECT') return;
    const player = this.players[this.activePlayerIdx];
    if (!player) return;

    if (this.isOnlineGame) {
      if (player.id !== this.myPlayerId) return;
    } else {
      if (player.isBot) return;
    }

    if (this.territoryOwners[city.id]) return;

    
    this.actionLocked = true;
    this.cleanTargetableCells();
    this.assignBaseCity(player, city);

    if (this.isOnlineGame && this.multiplayer) {
      this.multiplayer.sendAction('PICK_BASE', { cityId: city.id, playerId: player.id });
    }

    const t = setTimeout(() => {
      this.activePlayerIdx++;
      this.promptNextBaseSelection();
    }, 700);
    this.animTimeouts.push(t);
  }

  botPickBase(bot) {
    const preferred = ['kisvarda', 'mateszalka', 'vasarosnameny', 'nyirbator', 'fehergyarmat', 'zahony', 'tiszavasvari'];
    const freePreferred = preferred.filter(id => !this.territoryOwners[id]);

    let chosenId = freePreferred.length > 0
      ? freePreferred[Math.floor(Math.random() * freePreferred.length)]
      : this.mapData.cities.find(c => !this.territoryOwners[c.id]).id;

    const city = this.mapData.cities.find(c => c.id === chosenId);
    this.assignBaseCity(bot, city);
    this.activePlayerIdx++;
    this.promptNextBaseSelection();
  }

  assignBaseCity(player, city) {
    this.territoryOwners[city.id] = player.id;
    player.castleCity = city.id;
    player.score += city.points;

    const poly = document.getElementById(`poly-${city.id}`);
    poly.classList.remove('neutral', 'targetable');
    poly.classList.add(`${player.color}-owner`);

    this.updateCastleBadge(city, player, player.towers);

    sounds.playCapture();
    this.updatePlayerScorecards();
    this.logEvent(`${player.name} felépítette várát itt: ${city.name} (+${city.points} pt)!`, player.color);
  }

  
  
  
  startExpansionPhase() {
    this.phase = 'EXPANSION';
    this.currentRound = 1;
    this.dom.phaseText.innerText = '2. Fázis: Honfoglalás';
    this.cleanTargetableCells();
    this.triggerExpansionRound();
  }

  triggerExpansionRound() {
    this.actionLocked = true;
    const freeCities = this.mapData.cities.filter(c => !this.territoryOwners[c.id]);

    if (freeCities.length === 0) {
      this.updateTurnBanner('🏰 Minden város gazdára talált! Kezdődik a csaták kora!', '3. Fázis');
      this.logEvent('Minden szabolcsi város gazdára talált! Kezdődik a csaták kora!', 'gold');
      sounds.playBattleHorn();
      const t = setTimeout(() => this.startBattlePhase(), 1600);
      this.animTimeouts.push(t);
      return;
    }

    this.dom.roundText.innerText = `${this.currentRound}. Területszerző kör (${freeCities.length} szabad város)`;
    this.updateTurnBanner(`🚩 ${this.currentRound}. Honfoglaló kvízkör (${freeCities.length} szabad város maradt)`, 'Honfoglalás');
    this.setInstruction('Készülj fel a kérdésre! A legjobb válaszadó szabad várost foglalhat!');

    const t = setTimeout(() => {
      this.showBriefingModal('EXPANSION');
    }, 1000);
    this.animTimeouts.push(t);
  }

  
  
  
  startBattlePhase() {
    this.phase = 'BATTLE';
    this.dom.phaseText.innerText = '3. Fázis: Csaták & Várrombolás';
    this.currentRound = 1;
    this.activePlayerIdx = 0;
    this.promptNextBattleTurn();
  }

  promptNextBattleTurn() {
    this.clearBattleAnimations();

    const livingPlayers = this.players.filter(p => p.alive);
    if (livingPlayers.length <= 1 || this.currentRound > this.maxBattleRounds) {
      this.endGame();
      return;
    }

    while (!this.players[this.activePlayerIdx].alive) {
      this.activePlayerIdx = (this.activePlayerIdx + 1) % this.players.length;
    }

    const attacker = this.players[this.activePlayerIdx];
    this.highlightActiveCard(this.activePlayerIdx);
    this.dom.roundText.innerText = `${this.currentRound} / ${this.maxBattleRounds}. Csata forduló`;

    const attackTargets = this.getValidAttackTargets(attacker);

    if (attackTargets.length === 0) {
      this.logEvent(`${attacker.name} nem tud szomszédos várost támadni, kimarad a köre.`, attacker.color);
      this.advanceBattleTurn();
      return;
    }

    if (this.isOnlineGame) {
      if (attacker.id === this.myPlayerId) {
        this.actionLocked = false;
        this.updateTurnBanner(`⚔️ A TE TÁMADÓ KÖRÖD! Válassz egy szomszédos ellenséges várost!`, `Csata ${this.currentRound}`);
        this.setInstruction(`Kattints egy villogó ellenséges városra a TÁMADÁSHOZ!`);
        this.markAttackTargets(attackTargets);
      } else {
        this.actionLocked = true;
        this.updateTurnBanner(`⚔️ ${attacker.name} hadjáratot tervez...`, `Csata ${this.currentRound}`);
        this.setInstruction(`${attacker.name} épp célpontot választ a térképen...`);
        this.cleanTargetableCells();
        if (attacker.isBot && this.isHost) {
          const t = setTimeout(() => this.botExecuteAttack(attacker, attackTargets), 1500);
          this.botTimeouts.push(t);
        }
      }
      return;
    }

    if (attacker.isBot) {
      this.actionLocked = true;
      this.updateTurnBanner(`🤖 ${attacker.name} hadjáratot tervez egy ellenséges város ellen...`, `Csata ${this.currentRound}`);
      this.setInstruction(`${attacker.name} hadjáratot tervez...`);
      const t = setTimeout(() => this.botExecuteAttack(attacker, attackTargets), 1600);
      this.botTimeouts.push(t);
    } else {
      this.actionLocked = false;
      this.updateTurnBanner(`⚔️ ${attacker.name} támadása következik! Válassz egy szomszédos ellenséges várost!`, `Csata ${this.currentRound}`);
      this.setInstruction(`${attacker.name}, válassz egy villogó ellenséges várost a TÁMADÁSHOZ!`);
      this.markAttackTargets(attackTargets);
    }
  }

  getValidAttackTargets(attacker) {
    const myCities = this.mapData.cities.filter(c => this.territoryOwners[c.id] === attacker.id);
    const targetSet = new Set();

    myCities.forEach(myCity => {
      myCity.neighbors.forEach(neighborId => {
        const ownerId = this.territoryOwners[neighborId];
        if (ownerId && ownerId !== attacker.id) {
          targetSet.add(neighborId);
        }
      });
    });

    return Array.from(targetSet).map(id => this.mapData.cities.find(c => c.id === id));
  }

  markAttackTargets(targetCities) {
    this.cleanTargetableCells();
    targetCities.forEach(city => {
      const poly = document.getElementById(`poly-${city.id}`);
      if (poly) poly.classList.add('targetable');
    });
  }

  handleBattleAttackTarget(city) {
    if (this.actionLocked) return;
    if (this.phase !== 'BATTLE') return;

    const attacker = this.players[this.activePlayerIdx];
    if (!attacker || attacker.isBot) return;

    const validTargets = this.getValidAttackTargets(attacker);
    if (!validTargets.some(t => t.id === city.id)) return;

    
    this.actionLocked = true;
    this.cleanTargetableCells();

    const defenderId = this.territoryOwners[city.id];
    const defender = this.players.find(p => p.id === defenderId);
    let attackerCity = this.mapData.cities.find(c => this.territoryOwners[c.id] === attacker.id && c.neighbors.includes(city.id));
    if (!attackerCity) {
      attackerCity = this.mapData.cities
        .filter(c => this.territoryOwners[c.id] === attacker.id)
        .sort((a, b) => Math.hypot(a.x - city.x, a.y - city.y) - Math.hypot(b.x - city.x, b.y - city.y))[0];
    }

    if (this.isOnlineGame && this.multiplayer) {
      this.multiplayer.sendAction('BATTLE_DECLARE', {
        attackerCityId: attackerCity.id,
        targetCityId: city.id,
        attackerId: attacker.id,
        defenderId: defender.id
      });
    }

    this.executeBattleDuel(attacker, defender, attackerCity, city);
  }

  botExecuteAttack(bot, targets) {
    if (!this.isOnlineGame) {
      
      
      targets.sort((a, b) => {
        const isBaseA = this.players.some(p => p.castleCity === a.id) ? 1 : 0;
        const isBaseB = this.players.some(p => p.castleCity === b.id) ? 1 : 0;
        
        const scoreA = isBaseA * 80 + a.points + (Math.random() * 90);
        const scoreB = isBaseB * 80 + b.points + (Math.random() * 90);
        return scoreB - scoreA;
      });
    } else {
      targets.sort((a, b) => {
        const isBaseA = this.players.some(p => p.castleCity === a.id) ? 1 : 0;
        const isBaseB = this.players.some(p => p.castleCity === b.id) ? 1 : 0;
        return (isBaseB * 500 + b.points) - (isBaseA * 500 + a.points);
      });
    }

    const targetCity = targets[0];
    const defenderId = this.territoryOwners[targetCity.id];
    const defender = this.players.find(p => p.id === defenderId);
    let attackerCity = this.mapData.cities.find(c => this.territoryOwners[c.id] === bot.id && c.neighbors.includes(targetCity.id));
    if (!attackerCity) {
      attackerCity = this.mapData.cities
        .filter(c => this.territoryOwners[c.id] === bot.id)
        .sort((a, b) => Math.hypot(a.x - targetCity.x, a.y - targetCity.y) - Math.hypot(b.x - targetCity.x, b.y - targetCity.y))[0];
    }

    if (this.isOnlineGame && this.isHost && this.multiplayer) {
      this.multiplayer.sendAction('BATTLE_DECLARE', {
        attackerCityId: attackerCity.id,
        targetCityId: targetCity.id,
        attackerId: bot.id,
        defenderId: defender.id
      });
    }

    this.executeBattleDuel(bot, defender, attackerCity, targetCity);
  }

  executeBattleDuel(attacker, defender, fromCity, targetCity) {
    this.actionLocked = true;
    this.battleAttacker = attacker;
    this.battleDefender = defender;
    this.battleAttackerCity = fromCity || targetCity;
    this.battleTargetCity = targetCity;

    const isBaseAttack = (defender.castleCity === targetCity.id);
    const attackDesc = isBaseAttack ? '🏰 BÁZISVÁR OSTROMA' : 'terület elfoglalása';

    this.drawAttackAnimation(this.battleAttackerCity, targetCity);
    sounds.playSwordClash();
    sounds.playBattleHorn();

    this.updateTurnBanner(`⚔️ ${attacker.name} megtámadta ${targetCity.name} városát! Védő: ${defender.name}`, 'Harcban');
    this.logEvent(`⚔️ ${attacker.name} megtámadta ${defender.name} védelmét itt: ${targetCity.name} (${attackDesc})!`, 'gold');

    const t = setTimeout(() => {
      this.showBriefingModal('BATTLE');
    }, 1200);
    this.animTimeouts.push(t);
  }

  advanceBattleTurn() {
    this.clearBattleAnimations();
    this.actionLocked = false;
    this.activePlayerIdx = (this.activePlayerIdx + 1) % this.players.length;
    if (this.activePlayerIdx === 0) {
      this.currentRound++;
    }
    const t = setTimeout(() => this.promptNextBattleTurn(), 1000);
    this.animTimeouts.push(t);
  }

  
  
  
  showBriefingModal(context) {
    this.actionLocked = true;
    clearInterval(this.briefingTimer);
    this.briefingTimeLeft = 2; 

    this.dom.modalOverlay.style.display = 'flex';
    this.dom.modalOverlay.classList.add('active');
    this.dom.briefingModal.style.display = 'block';
    this.dom.quizModal.style.display = 'none';
    this.dom.startModal.style.display = 'none';
    this.dom.victoryModal.style.display = 'none';

    if (this.dom.btnReadyQuestion) {
      this.dom.btnReadyQuestion.style.display = 'none';
    }

    if (context === 'BATTLE') {
      const isBase = (this.battleDefender.castleCity === this.battleTargetCity.id);
      this.dom.briefingBadge.innerText = isBase ? '🏰 BÁZISVÁR OSTROMA!' : '⚔️ VÁROS MEGTÁMADÁSA!';
      this.dom.briefingTitle.innerText = `${this.battleTargetCity.name} ostroma`;

      this.dom.briefingAttackerAvatar.innerText = this.battleAttacker.name[0];
      this.dom.briefingAttackerAvatar.style.background = this.battleAttacker.colorHex;
      this.dom.briefingAttackerName.innerText = this.battleAttacker.name;

      this.dom.briefingDefenderAvatar.innerText = this.battleDefender.name[0];
      this.dom.briefingDefenderAvatar.style.background = this.battleDefender.colorHex;
      this.dom.briefingDefenderName.innerText = this.battleDefender.name;

      const baseNote = isBase ? ` (Védő vára: ${this.battleDefender.towers}/3 torony!)` : '';
      this.dom.briefingStakes.innerHTML = `Tét: <strong>${this.battleTargetCity.points} pont</strong> és ${this.battleTargetCity.name} birtoklása!${baseNote}`;
    } else {
      this.dom.briefingBadge.innerText = '🚩 HONFOGLALÓ KVÍZKÖR';
      this.dom.briefingTitle.innerText = 'Küzdelem a szabad szabolcsi városokért!';

      this.dom.briefingAttackerAvatar.innerText = '⚔️';
      this.dom.briefingAttackerAvatar.style.background = '#d4af37';
      this.dom.briefingAttackerName.innerText = 'Minden élő vezér';

      this.dom.briefingDefenderAvatar.innerText = '📍';
      this.dom.briefingDefenderAvatar.style.background = '#4a5568';
      this.dom.briefingDefenderName.innerText = 'Szabad területek';

      this.dom.briefingStakes.innerHTML = 'A legpontosabb és leggyorsabb válaszadók szabad várost foglalhatnak el!';
    }

    this.dom.briefingCountdown.innerText = `A kérdés ${this.briefingTimeLeft} másodperc múlva indul...`;

    this.briefingTimer = setInterval(() => {
      this.briefingTimeLeft--;
      if (this.briefingTimeLeft > 0) {
        this.dom.briefingCountdown.innerText = `A kérdés ${this.briefingTimeLeft} másodperc múlva indul...`;
      } else {
        clearInterval(this.briefingTimer);
        this.dom.briefingCountdown.innerText = 'Kérdés betöltése...';
        this.launchQuestionModal();
      }
    }, 1000);
  }

  launchQuestionModal() {
    clearInterval(this.briefingTimer);
    if (this.isOnlineGame && !this.isHost) {
      if (this.dom.briefingCountdown) {
        this.dom.briefingCountdown.innerText = 'Kérdés betöltése a szobagazdától...';
      }
      return;
    }
    this.dom.briefingModal.style.display = 'none';
    this.presentTriviaQuestion(this.phase === 'BATTLE' ? 'BATTLE' : 'EXPANSION');
  }

  
  
  
  initQuestionDecks() {
    let recentQuestions = [];
    try {
      const stored = localStorage.getItem('szabolcs_recent_questions');
      if (stored) recentQuestions = JSON.parse(stored);
    } catch (e) {
      recentQuestions = [];
    }

    
    const shuffleArray = (arr) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    
    const createDeck = (pool) => {
      if (!pool || pool.length === 0) return [];
      const shuffled = shuffleArray(pool);
      const fresh = [];
      const recent = [];
      shuffled.forEach(q => {
        if (recentQuestions.includes(q.q)) {
          recent.push(q);
        } else {
          fresh.push(q);
        }
      });
      return [...fresh, ...recent];
    };

    this.choiceDeck = createDeck(this.questions?.choice || []);
    this.guessDeck = createDeck(this.questions?.guess || []);
  }

  drawNextQuestion(context) {
    if (!this.choiceDeck || this.choiceDeck.length === 0) {
      this.choiceDeck = [...(this.questions?.choice || [])];
      this.initQuestionDecks();
    }
    if (!this.guessDeck || this.guessDeck.length === 0) {
      this.guessDeck = [...(this.questions?.guess || [])];
      this.initQuestionDecks();
    }

    
    let isGuess = false;
    if (this.lastQuestionType === 'guess') {
      isGuess = Math.random() < 0.35;
    } else if (this.lastQuestionType === 'choice') {
      isGuess = Math.random() < 0.55;
    } else {
      isGuess = Math.random() < 0.45;
    }

    let deck = isGuess ? this.guessDeck : this.choiceDeck;
    if (!deck || deck.length === 0) {
      isGuess = !isGuess;
      deck = isGuess ? this.guessDeck : this.choiceDeck;
    }

    
    let chosenIdx = -1;
    for (let i = 0; i < deck.length; i++) {
      if (!this.matchUsedQuestions.has(deck[i].q)) {
        chosenIdx = i;
        break;
      }
    }

    
    if (chosenIdx === -1) {
      chosenIdx = 0;
    }

    const question = deck.splice(chosenIdx, 1)[0];
    this.matchUsedQuestions.add(question.q);
    this.lastQuestionType = isGuess ? 'guess' : 'choice';

    
    try {
      let recent = [];
      const stored = localStorage.getItem('szabolcs_recent_questions');
      if (stored) recent = JSON.parse(stored);
      recent.push(question.q);
      if (recent.length > 100) recent = recent.slice(-100);
      localStorage.setItem('szabolcs_recent_questions', JSON.stringify(recent));
    } catch (e) {}

    return { question, isGuess };
  }

  isHumanParticipatingInCurrentQuestion() {
    const myPlayer = this.players.find(p => p.id === this.myPlayerId) || this.players[0];
    if (!myPlayer || !myPlayer.alive) return false;
    if (myPlayer.isBot) return false;
    if (!this.currentQuestion) return false;
    if (this.currentQuestion.context === 'BATTLE') {
      return (this.battleAttacker && this.battleAttacker.id === myPlayer.id) ||
        (this.battleDefender && this.battleDefender.id === myPlayer.id);
    }
    return true;
  }

  presentTriviaQuestion(context) {
    const nextData = this.drawNextQuestion(context);
    const isGuess = nextData.isGuess;
    const rawQ = nextData.question;

    this.currentQuestion = {
      ...rawQ,
      type: isGuess ? 'guess' : 'choice',
      context: context
    };

    
    if (this.currentQuestion.type === 'choice') {
      const originalChoices = [...rawQ.a];
      const correctText = originalChoices[rawQ.correct];

      const shuffled = [...originalChoices];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      this.currentQuestion.shuffledChoices = shuffled;
      this.currentQuestion.shuffledCorrectIndex = shuffled.indexOf(correctText);
    }

    this.playerAnswers = {};
    this.dom.revealBox.style.display = 'none';
    this.dom.revealBox.innerHTML = '';

    const isHumanParticipating = this.isHumanParticipatingInCurrentQuestion();

    
    if (this.dom.spectatorBanner) {
      this.dom.spectatorBanner.style.display = 'none';
    }

    if (this.dom.answerStatusPill) {
      this.dom.answerStatusPill.style.display = 'none';
      this.dom.answerStatusPill.innerHTML = '';
    }

    this.dom.quizTopic.innerText = this.currentQuestion.topic || 'Műveltség';
    this.dom.questionText.innerText = this.currentQuestion.q;

    if (this.currentQuestion.type === 'choice') {
      this.dom.choicesGrid.style.display = 'grid';
      this.dom.guessWrap.style.display = 'none';
      this.renderChoiceButtons();
    } else {
      this.dom.choicesGrid.style.display = 'none';
      this.dom.guessWrap.style.display = 'flex';
      this.setupGuessControls();
    }

    this.updateLifelineButtons();

    this.dom.modalOverlay.style.display = 'flex';
    this.dom.modalOverlay.classList.add('active');
    this.dom.briefingModal.style.display = 'none';
    this.dom.quizModal.style.display = 'block';

    if (this.isOnlineGame && this.isHost && this.multiplayer) {
      this.multiplayer.sendAction('PRESENT_QUESTION', { question: this.currentQuestion });
    }

    this.startTimer(20, () => this.onTimerExpire());
    this.scheduleBotAnswers();
  }

  renderChoiceButtons() {
    this.dom.choicesGrid.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    const choices = this.currentQuestion.shuffledChoices;
    const isHumanParticipating = this.isHumanParticipatingInCurrentQuestion();

    choices.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      if (!isHumanParticipating) {
        btn.disabled = true;
        btn.style.opacity = '0.55';
        btn.style.cursor = 'not-allowed';
      }
      btn.innerHTML = `<span class="key-letter">${letters[idx]}</span> ${opt}`;
      btn.addEventListener('click', () => {
        if (!this.isHumanParticipatingInCurrentQuestion()) return;
        sounds.playClick();
        const myId = this.isOnlineGame ? this.myPlayerId : this.players[0].id;
        const timeSpent = Math.max(0.1, 20 - this.timeLeft);
        this.handlePlayerAnswer(myId, idx, timeSpent);
        if (this.isOnlineGame && this.multiplayer) {
          this.multiplayer.sendAction('SUBMIT_ANSWER', { playerId: myId, answer: idx, timeSpent: timeSpent });
        }
        this.dom.choicesGrid.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);
        btn.classList.add('selected');
      });
      this.dom.choicesGrid.appendChild(btn);
    });
  }

  
  setupGuessControls() {
    const q = this.currentQuestion;
    const isHumanParticipating = this.isHumanParticipatingInCurrentQuestion();

    this.dom.guessSlider.min = 0;
    const calcMax = Math.max(100, Math.ceil(q.answer * 2.2 / 50) * 50);
    this.dom.guessSlider.max = Math.max(q.max, calcMax);

    
    this.dom.guessSlider.value = 0;
    this.dom.guessInput.value = 0;
    this.dom.guessUnit.innerText = q.unit || '';
    this.dom.guessInput.classList.remove('hint-applied');

    if (!isHumanParticipating) {
      this.dom.btnSubmitGuess.disabled = true;
      this.dom.guessInput.disabled = true;
      this.dom.guessSlider.disabled = true;
      document.querySelectorAll('.btn-adjust').forEach(b => b.disabled = true);
    } else {
      this.dom.btnSubmitGuess.disabled = false;
      this.dom.guessInput.disabled = false;
      this.dom.guessSlider.disabled = false;
      document.querySelectorAll('.btn-adjust').forEach(b => b.disabled = false);

      
      setTimeout(() => {
        if (this.dom.guessInput) {
          this.dom.guessInput.focus();
          this.dom.guessInput.select();
        }
      }, 150);
    }
  }

  startTimer(seconds, onComplete) {
    clearInterval(this.questionTimer);
    this.timeLeft = seconds;
    this.dom.timerCircle.innerText = this.timeLeft;
    this.dom.timerCircle.classList.remove('urgent');

    this.questionTimer = setInterval(() => {
      this.timeLeft--;
      this.dom.timerCircle.innerText = this.timeLeft;
      sounds.playTick();

      if (this.timeLeft <= 5) {
        this.dom.timerCircle.classList.add('urgent');
      }

      if (this.timeLeft <= 0) {
        clearInterval(this.questionTimer);
        onComplete();
      }
    }, 1000);
  }

  
  
  
  generateBotAnswer(botPlayer) {
    if (!this.currentQuestion) return 0;
    const isSinglePlayer = !this.isOnlineGame;

    if (this.currentQuestion.type === 'choice') {
      const correctIdx = this.currentQuestion.shuffledCorrectIndex;
      
      
      const hitChance = isSinglePlayer ? 0.45 : 0.65;
      const isCorrect = Math.random() < hitChance;

      if (isCorrect) {
        return correctIdx;
      } else {
        
        const wrongChoices = [0, 1, 2, 3].filter(i => i !== correctIdx);
        return wrongChoices[Math.floor(Math.random() * wrongChoices.length)];
      }
    } else {
      
      const trueVal = this.currentQuestion.answer;

      if (isSinglePlayer) {
        
        if (trueVal >= 1000 && trueVal <= 2050) {
          
          const sign = Math.random() < 0.5 ? -1 : 1;
          const yearDiff = sign * Math.round(25 + Math.random() * 85);
          return Math.max(1, trueVal + yearDiff);
        } else {
          
          const sign = Math.random() < 0.5 ? -1 : 1;
          const pct = sign * (0.25 + Math.random() * 0.40);
          const variance = pct * trueVal;
          return Math.round(Math.max(0, trueVal + variance));
        }
      } else {
        
        const variance = (Math.random() * 0.4 - 0.2) * trueVal;
        return Math.round(Math.max(0, trueVal + variance));
      }
    }
  }

  scheduleBotAnswers() {
    if (this.isOnlineGame && !this.isHost) return;
    const isSpectator = !this.isHumanParticipatingInCurrentQuestion();
    const isSinglePlayer = !this.isOnlineGame;

    this.players.forEach(p => {
      if (p.isBot && p.alive) {
        
        
        const delay = isSpectator
          ? (1200 + Math.random() * 1000)
          : (isSinglePlayer ? (4500 + Math.random() * 4500) : (3500 + Math.random() * 4000));

        const t = setTimeout(() => {
          if (!this.playerAnswers[p.id] && this.timeLeft > 0) {
            const answerVal = this.generateBotAnswer(p);
            this.handlePlayerAnswer(p.id, answerVal);
            if (this.isOnlineGame && this.isHost && this.multiplayer) {
              this.multiplayer.sendAction('SUBMIT_ANSWER', { playerId: p.id, answer: answerVal, timeSpent: (20 - this.timeLeft) });
            }
          }
        }, delay);
        this.botTimeouts.push(t);
      }
    });
  }

  
  accelerateRemainingBots() {
    if (this.isOnlineGame && !this.isHost) return;
    this.botTimeouts.forEach(t => clearTimeout(t));
    this.botTimeouts = [];

    const relevantBots = (this.currentQuestion.context === 'BATTLE'
      ? [this.battleAttacker, this.battleDefender]
      : this.players
    ).filter(p => p && p.isBot && p.alive && this.playerAnswers[p.id] === undefined);

    relevantBots.forEach((p, idx) => {
      const quickDelay = 220 + idx * 220; 
      const t = setTimeout(() => {
        if (!this.playerAnswers[p.id] && this.timeLeft > 0) {
          const answerVal = this.generateBotAnswer(p);
          this.handlePlayerAnswer(p.id, answerVal);
        }
      }, quickDelay);
      this.botTimeouts.push(t);
    });
  }

  handlePlayerAnswer(playerId, answer, customTimeSpent = null) {
    if (this.playerAnswers[playerId] !== undefined) return;

    const timeSpent = (customTimeSpent !== null) ? customTimeSpent : Math.max(0.1, 20 - this.timeLeft);
    let isCorrect = false;
    let diff = 999999;

    if (this.currentQuestion.type === 'choice') {
      isCorrect = (answer === this.currentQuestion.shuffledCorrectIndex);
    } else {
      diff = Math.abs(answer - this.currentQuestion.answer);
      isCorrect = (diff === 0);
    }

    this.playerAnswers[playerId] = {
      answer: answer,
      time: timeSpent,
      isCorrect: isCorrect,
      diff: diff
    };

    
    if (playerId === (this.isOnlineGame ? this.myPlayerId : this.players[0].id)) {
      this.updateLifelineButtons();
      if (this.dom.answerStatusPill) {
        this.dom.answerStatusPill.style.display = 'none';
        this.dom.answerStatusPill.innerHTML = '';
      }
      this.accelerateRemainingBots();
    }

    const relevantPlayers = this.currentQuestion.context === 'BATTLE'
      ? [this.battleAttacker.id, this.battleDefender.id]
      : this.players.filter(p => p.alive).map(p => p.id);

    const allAnswered = relevantPlayers.every(id => this.playerAnswers[id] !== undefined);
    if (allAnswered) {
      clearInterval(this.questionTimer);
      const t = setTimeout(() => this.onTimerExpire(), 320);
      this.animTimeouts.push(t);
    }
  }

  onTimerExpire() {
    clearInterval(this.questionTimer);

    this.players.forEach(p => {
      if (!this.playerAnswers[p.id] && p.alive) {
        this.playerAnswers[p.id] = {
          answer: 'Nem válaszolt',
          time: 20,
          isCorrect: false,
          diff: 999999
        };
      }
    });

    this.revealResults();
  }

  revealResults() {
    if (this.currentQuestion.type === 'choice') {
      const btns = this.dom.choicesGrid.querySelectorAll('.choice-btn');
      btns.forEach((b, idx) => {
        if (idx === this.currentQuestion.shuffledCorrectIndex) {
          b.classList.add('correct');
        } else {
          b.classList.add('wrong');
        }
      });
    }

    this.dom.revealBox.style.display = 'flex';
    this.dom.revealBox.innerHTML = '';

    const isGuess = (this.currentQuestion.type === 'guess');

    
    const banner = document.createElement('div');
    banner.className = 'reveal-exact-banner';

    if (isGuess) {
      banner.innerHTML = `
        <span class="reveal-exact-label">🎯 A PONTOS HELYES ÉRTÉK:</span>
        <div class="reveal-exact-number-wrap">
          <span class="reveal-exact-number">${this.currentQuestion.answer}</span>
          <span class="reveal-exact-unit">${this.currentQuestion.unit || ''}</span>
        </div>
      `;
    } else {
      const letters = ['A', 'B', 'C', 'D'];
      const correctLetter = letters[this.currentQuestion.shuffledCorrectIndex];
      const correctText = this.currentQuestion.shuffledChoices[this.currentQuestion.shuffledCorrectIndex];
      banner.innerHTML = `
        <span class="reveal-exact-label">✅ A HELYES VÁLASZ:</span>
        <div class="reveal-exact-text">${correctLetter}: ${correctText}</div>
      `;
    }
    this.dom.revealBox.appendChild(banner);

    const ranked = this.rankAnswers();

    ranked.forEach((item, rankIdx) => {
      const row = document.createElement('div');
      row.className = `reveal-player-row ${item.player.color}`;

      let guessInfo = '';
      if (isGuess) {
        if (typeof item.answer === 'number') {
          const sign = item.answer > this.currentQuestion.answer ? `+${item.diff}` : `-${item.diff}`;
          const exactBadge = item.diff === 0 ? '🏆 PONTOS TALÁLAT!' : `eltérés: ${sign}`;
          guessInfo = `Tipp: <strong>${item.answer}</strong> (${exactBadge})`;
        } else {
          guessInfo = 'Nem tippelt időben';
        }
      } else {
        if (typeof item.answer === 'number') {
          const letters = ['A', 'B', 'C', 'D'];
          const chosenLetter = letters[item.answer];
          const chosenText = this.currentQuestion.shuffledChoices[item.answer];
          guessInfo = item.isCorrect ? `✅ [${chosenLetter}] Helyes válasz!` : `❌ [${chosenLetter}: ${chosenText}]`;
        } else {
          guessInfo = 'Nem válaszolt';
        }
      }

      const crown = rankIdx === 0 ? '👑 ' : '';
      row.innerHTML = `
        <span><strong>${crown}${item.player.name}</strong> <span class="player-guess-tag">${guessInfo}</span></span>
        <span>⏱️ ${item.time.toFixed(1)} mp</span>
      `;
      this.dom.revealBox.appendChild(row);
    });

    let advanced = false;
    const advance = () => {
      if (advanced) return;
      advanced = true;
      if (this.currentQuestion.context === 'EXPANSION') {
        this.resolveExpansionRound(ranked);
      } else {
        this.resolveBattleRound(ranked);
      }
    };

    const nextBtn = document.createElement('button');
    nextBtn.className = 'reveal-skip-btn';
    nextBtn.innerHTML = 'Tovább a hadjáratra ➔';
    nextBtn.addEventListener('click', () => {
      sounds.playClick();
      advance();
    });
    this.dom.revealBox.appendChild(nextBtn);

    
    const t = setTimeout(advance, 4200);
    this.animTimeouts.push(t);
  }

  rankAnswers() {
    const list = [];
    const participants = this.currentQuestion.context === 'BATTLE'
      ? [this.battleAttacker, this.battleDefender]
      : this.players.filter(p => p.alive);

    participants.forEach(p => {
      const res = this.playerAnswers[p.id];
      list.push({ player: p, ...res });
    });

    if (this.currentQuestion.type === 'choice') {
      list.sort((a, b) => {
        if (a.isCorrect && !b.isCorrect) return -1;
        if (!a.isCorrect && b.isCorrect) return 1;
        return a.time - b.time;
      });
    } else {
      list.sort((a, b) => {
        if (a.diff !== b.diff) return a.diff - b.diff;
        return a.time - b.time;
      });
    }

    return list;
  }

  
  
  
  resolveExpansionRound(ranked) {
    this.closeModal();

    const winners = [];
    if (this.currentQuestion.type === 'choice') {
      if (ranked[0] && ranked[0].isCorrect) winners.push(ranked[0].player);
      if (ranked[1] && ranked[1].isCorrect) winners.push(ranked[1].player);
    } else {
      if (ranked[0]) winners.push(ranked[0].player);
      if (ranked[1]) winners.push(ranked[1].player);
    }

    if (winners.length === 0) {
      this.updateTurnBanner('Senki sem adott helyes választ, a kör területszerzés nélkül ért véget.', 'Honfoglalás');
      this.logEvent('Senki sem adott helyes választ, a kör területszerzés nélkül ért véget.', 'gold');
      this.currentRound++;
      this.triggerExpansionRound();
      return;
    }

    this.pendingConquerors = winners;
    this.processNextPendingConqueror();
  }

  processNextPendingConqueror() {
    const freeCities = this.mapData.cities.filter(c => !this.territoryOwners[c.id]);

    if (freeCities.length === 0 || this.pendingConquerors.length === 0) {
      this.currentPicker = null;
      this.actionLocked = true;
      this.currentRound++;
      const t = setTimeout(() => this.triggerExpansionRound(), 600);
      this.animTimeouts.push(t);
      return;
    }

    
    this.currentPicker = this.pendingConquerors.shift();
    this.highlightActiveCard(this.players.indexOf(this.currentPicker));

    const validTargets = this.getValidExpansionTargets(this.currentPicker);
    const freeCount = freeCities.length;
    const isAdjacentOnly = (validTargets.length < freeCount);

    const bannerMsg = isAdjacentOnly
      ? `🚩 Megnyerted a kört! Válassz egy SZOMSZÉDOS szabad várost!`
      : `🚩 Megnyerted a kört! Válassz egy szabad várost!`;
    const instrMsg = isAdjacentOnly
      ? `Kattints a határaid mentén villogó SZOMSZÉDOS szabad városok egyikére!`
      : `Mivel nincs közvetlen szomszédos szabad terület, bármelyik megmaradt várost választhatod!`;

    if (this.isOnlineGame) {
      if (this.currentPicker.id === this.myPlayerId) {
        this.actionLocked = false;
        this.updateTurnBanner(bannerMsg, 'Honfoglalás');
        this.setInstruction(instrMsg);
        this.markAvailableExpansionCities(this.currentPicker);
      } else {
        this.actionLocked = true;
        this.updateTurnBanner(`🚩 ${this.currentPicker.name} nyert! Területet választ a térképen...`, 'Honfoglalás');
        this.setInstruction(`${this.currentPicker.name} szomszédos szabad várost választ a térképen...`);
        this.cleanTargetableCells();
        if (this.currentPicker.isBot && this.isHost) {
          const t = setTimeout(() => this.botPickExpansionTerritory(this.currentPicker), 1200);
          this.botTimeouts.push(t);
        }
      }
      return;
    }

    if (this.currentPicker.isBot) {
      this.actionLocked = true;
      this.updateTurnBanner(`🤖 ${this.currentPicker.name} szabad várost választ a térképen...`, 'Honfoglalás');
      this.setInstruction(`${this.currentPicker.name} szabad várost választ a térképen...`);
      const t = setTimeout(() => this.botPickExpansionTerritory(this.currentPicker), 1300);
      this.botTimeouts.push(t);
    } else {
      this.actionLocked = false;
      this.updateTurnBanner(bannerMsg, 'Honfoglalás');
      this.setInstruction(instrMsg);
      this.markAvailableExpansionCities(this.currentPicker);
    }
  }

  
  
  getValidExpansionTargets(player) {
    const freeCities = this.mapData.cities.filter(c => !this.territoryOwners[c.id]);
    if (freeCities.length === 0) return [];

    const myCities = this.mapData.cities.filter(c => this.territoryOwners[c.id] === player.id);
    if (myCities.length === 0) return freeCities;

    const adjacentSet = new Set();
    myCities.forEach(city => {
      if (city.neighbors && Array.isArray(city.neighbors)) {
        city.neighbors.forEach(neighborId => {
          if (!this.territoryOwners[neighborId]) {
            adjacentSet.add(neighborId);
          }
        });
      }
    });

    const adjacentCities = Array.from(adjacentSet)
      .map(id => this.mapData.cities.find(c => c.id === id))
      .filter(Boolean);

    if (adjacentCities.length > 0) {
      return adjacentCities;
    }
    return freeCities;
  }

  markAvailableExpansionCities(player) {
    this.cleanTargetableCells();
    const validTargets = this.getValidExpansionTargets(player);
    validTargets.forEach(c => {
      const poly = document.getElementById(`poly-${c.id}`);
      if (poly) poly.classList.add('targetable');
    });
    return validTargets;
  }

  handleExpansionTerritoryPick(city) {
    if (this.actionLocked) return;
    if (this.phase !== 'EXPANSION') return;
    if (!this.currentPicker) return;

    if (this.isOnlineGame) {
      if (this.currentPicker.id !== this.myPlayerId) return;
    } else {
      if (this.currentPicker.isBot) return;
    }

    if (this.territoryOwners[city.id]) return; 

    const validTargets = this.getValidExpansionTargets(this.currentPicker);
    if (!validTargets.some(t => t.id === city.id)) {
      sounds.playWrong();
      this.setInstruction('⚠️ Csak a határaid mentén lévő SZOMSZÉDOS szabad várost választhatod!');
      return;
    }

    
    this.actionLocked = true;
    const picker = this.currentPicker;
    this.currentPicker = null;

    this.cleanTargetableCells();
    this.conquerTerritory(picker, city);

    if (this.isOnlineGame && this.multiplayer) {
      this.multiplayer.sendAction('EXPANSION_PICK', { cityId: city.id, playerId: picker.id });
    }

    const t = setTimeout(() => {
      this.processNextPendingConqueror();
    }, 800);
    this.animTimeouts.push(t);
  }

  botPickExpansionTerritory(bot) {
    const validTargets = this.getValidExpansionTargets(bot);
    if (validTargets.length === 0) {
      this.processNextPendingConqueror();
      return;
    }

    validTargets.sort((a, b) => b.points - a.points);
    const chosen = validTargets[0];

    this.currentPicker = null;
    this.conquerTerritory(bot, chosen);

    if (this.isOnlineGame && this.isHost && this.multiplayer) {
      this.multiplayer.sendAction('EXPANSION_PICK', { cityId: chosen.id, playerId: bot.id });
    }

    const t = setTimeout(() => {
      this.processNextPendingConqueror();
    }, 800);
    this.animTimeouts.push(t);
  }

  conquerTerritory(player, city) {
    this.territoryOwners[city.id] = player.id;
    player.score += city.points;

    const poly = document.getElementById(`poly-${city.id}`);
    poly.setAttribute('class', `territory-cell ${player.color}-owner`);

    sounds.playCapture();
    this.updatePlayerScorecards();
    this.updateTurnBanner(`🚩 ${player.name} elfoglalta ${city.name} városát (+${city.points} pt)!`, 'Sikeres hódítás');
    this.logEvent(`🚩 ${player.name} birtokba vette ${city.name} városát (+${city.points} pt)!`, player.color);
  }

  
  
  
  resolveBattleRound(ranked) {
    this.closeModal();

    const attacker = this.battleAttacker;
    const defender = this.battleDefender;
    const targetCity = this.battleTargetCity;
    const isBaseAttack = (defender.castleCity === targetCity.id);

    const winner = ranked[0].player;

    if (winner.id === attacker.id) {
      if (isBaseAttack) {
        defender.towers--;
        sounds.playCastleHit();

        this.updateCastleBadge(targetCity, defender, defender.towers);

        if (defender.towers <= 0) {
          
          defender.alive = false;
          sounds.playVictory();
          this.updateCastleBadge(targetCity, defender, 0);
          this.updateTurnBanner(`👑 ${defender.name} BÁZISA ELESETT! ${attacker.name} megszerezte minden városát!`, 'Bázisgyőzelem');
          this.logEvent(`👑 ${defender.name} BÁZISA ELESETT! ${defender.name} kiesett a játékból, minden városa ${attacker.name} birtokába kerül!`, attacker.color);

          this.mapData.cities.forEach(c => {
            if (this.territoryOwners[c.id] === defender.id) {
              this.territoryOwners[c.id] = attacker.id;
              attacker.score += c.points;
              const poly = document.getElementById(`poly-${c.id}`);
              poly.setAttribute('class', `territory-cell ${attacker.color}-owner`);
            }
          });

          this.updatePlayerScorecards();
          this.advanceBattleTurn();
        } else {
          
          this.updatePlayerScorecards();
          this.updateTurnBanner(`💥 SIKERES ROHAM! 1 torony ledőlt (${defender.towers}/3 torony maradt)! ${attacker.name} folytatja a vár ostromát!`, 'Várharc');
          this.logEvent(`💥 SIKERES ROHAM! 1 torony ledőlt (${defender.towers}/3 torony maradt)! ${attacker.name} újabb rohamot indít ${targetCity.name} falai ellen!`, attacker.color);

          const t = setTimeout(() => {
            this.executeBattleDuel(attacker, defender, this.battleAttackerCity, targetCity);
          }, 2200);
          this.animTimeouts.push(t);
        }
      } else {
        
        this.territoryOwners[targetCity.id] = attacker.id;
        attacker.score += targetCity.points;
        defender.score = Math.max(0, defender.score - targetCity.points);

        const poly = document.getElementById(`poly-${targetCity.id}`);
        poly.setAttribute('class', `territory-cell ${attacker.color}-owner`);

        sounds.playCapture();
        this.updateTurnBanner(`⚔️ ${attacker.name} sikeresen elfoglalta ${targetCity.name} városát! (+${targetCity.points} pt)`, 'Győztes csata');
        this.logEvent(`⚔️ ${attacker.name} sikeresen elfoglalta ${targetCity.name} városát ${defender.name}-től (+${targetCity.points} pt)!`, attacker.color);

        this.updatePlayerScorecards();
        this.advanceBattleTurn();
      }
    } else {
      
      sounds.playCorrect();
      this.updateTurnBanner(`🛡️ ${defender.name} sikeresen megvédte ${targetCity.name} falait!`, 'Sikeres védelem');
      this.logEvent(`🛡️ ${defender.name} visszaverte ${attacker.name} támadását ${targetCity.name} falainál! Az ostrom megszakadt.`, defender.color);

      this.updatePlayerScorecards();
      this.advanceBattleTurn();
    }
  }

  
  
  
  updateLifelineButtons() {
    const p1 = this.players[0];
    const isHumanParticipating = this.isHumanParticipatingInCurrentQuestion();
    const hasAnswered = (this.playerAnswers && this.playerAnswers[p1.id] !== undefined);
    const choiceLeft = (p1.lifelines && p1.lifelines.choice !== undefined) ? p1.lifelines.choice : 0;
    const guessLeft = (p1.lifelines && p1.lifelines.guess !== undefined) ? p1.lifelines.guess : 0;

    if (this.dom.countLifelineChoice) this.dom.countLifelineChoice.innerText = `(${choiceLeft})`;
    if (this.dom.countLifelineGuess) this.dom.countLifelineGuess.innerText = `(${guessLeft})`;

    if (this.dom.btnLifelineChoice) {
      this.dom.btnLifelineChoice.disabled = (!isHumanParticipating || hasAnswered || choiceLeft <= 0);
    }
    if (this.dom.btnLifelineGuess) {
      this.dom.btnLifelineGuess.disabled = (!isHumanParticipating || hasAnswered || guessLeft <= 0);
    }

    if (this.currentQuestion) {
      if (this.currentQuestion.type === 'choice') {
        if (this.dom.btnLifelineChoice) this.dom.btnLifelineChoice.style.display = 'inline-flex';
        if (this.dom.btnLifelineGuess) this.dom.btnLifelineGuess.style.display = 'none';
      } else {
        if (this.dom.btnLifelineChoice) this.dom.btnLifelineChoice.style.display = 'none';
        if (this.dom.btnLifelineGuess) this.dom.btnLifelineGuess.style.display = 'inline-flex';
      }
    }
  }

  useLifelineChoice() {
    if (!this.isHumanParticipatingInCurrentQuestion()) return;
    const p1 = this.players[0];
    if (!p1.lifelines || p1.lifelines.choice <= 0 || !this.currentQuestion || this.currentQuestion.type !== 'choice') return;
    if (this.playerAnswers && this.playerAnswers[p1.id] !== undefined) return;

    p1.lifelines.choice--;
    this.updateLifelineButtons();
    sounds.playCorrect();

    const correctIdx = (typeof this.currentQuestion.shuffledCorrectIndex === 'number' && this.currentQuestion.shuffledCorrectIndex >= 0)
      ? this.currentQuestion.shuffledCorrectIndex
      : 0;

    const btns = this.dom.choicesGrid.querySelectorAll('.choice-btn');
    const targetBtn = btns[correctIdx];

    if (targetBtn) {
      targetBtn.classList.add('hint-highlight');
      if (!targetBtn.querySelector('.lifeline-badge')) {
        const badge = document.createElement('span');
        badge.className = 'lifeline-badge';
        badge.innerText = '⭐ BIZTOS VÁLASZ!';
        targetBtn.appendChild(badge);
      }
      
      targetBtn.click();
    } else {
      this.handlePlayerAnswer(p1.id, correctIdx);
    }

    this.logEvent(`💡 ${p1.name} segítséget kért: a helyes választ automatikusan kiválasztotta a rendszer!`, 'gold');
  }

  useLifelineGuess() {
    if (!this.isHumanParticipatingInCurrentQuestion()) return;
    const p1 = this.players[0];
    if (!p1.lifelines || p1.lifelines.guess <= 0 || !this.currentQuestion || this.currentQuestion.type !== 'guess') return;
    if (this.playerAnswers && this.playerAnswers[p1.id] !== undefined) return;

    p1.lifelines.guess--;
    this.updateLifelineButtons();
    sounds.playCorrect();

    const ans = this.currentQuestion.answer;
    const delta = Math.round((Math.random() > 0.5 ? 1 : -1) * Math.max(1, Math.round(ans * 0.012)));
    const nearVal = Math.max(0, ans + delta);

    this.dom.guessInput.value = nearVal;
    this.dom.guessSlider.value = Math.min(parseInt(this.dom.guessSlider.max), nearVal);
    this.dom.guessInput.classList.add('hint-applied');
    this.logEvent(`🎯 ${p1.name} segítséget kért: a hadmérnök beállította a precíz értéket (${nearVal})!`, 'gold');

    
    this.submitGuess();
  }

  
  
  
  cleanTargetableCells() {
    this.mapData.cities.forEach(c => {
      const poly = document.getElementById(`poly-${c.id}`);
      if (poly) poly.classList.remove('targetable');
    });
  }

  highlightActiveCard(activeIdx) {
    this.dom.pCards.forEach((c, idx) => {
      if (idx === activeIdx) c.classList.add('active-turn');
      else c.classList.remove('active-turn');
    });
  }

  updateTurnBanner(text, badge = '') {
    this.dom.turnBannerText.innerHTML = text;
    if (badge) this.dom.turnBannerBadge.innerText = badge;
  }

  setInstruction(text) {
    this.dom.instructionText.innerHTML = `<span class="blink-dot"></span> ${text}`;
  }

  updatePlayerScorecards() {
    this.players.forEach((p, idx) => {
      const card = this.dom.pCards[idx];
      const count = Object.values(this.territoryOwners).filter(id => id === p.id).length;
      card.querySelector('.score').innerText = p.score;
      card.querySelector('.sub-stat').innerText = `${count} város`;

      const towersStr = p.alive
        ? Array(p.towers).fill('🏰').join(' ')
        : '💀 KIESETT';
      card.querySelector('.castle-towers').innerText = towersStr;

      if (!p.alive) {
        card.style.opacity = '0.45';
      }
    });
  }

  logEvent(msg, type = 'gold') {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const div = document.createElement('div');
    div.className = `log-entry ${type}`;
    div.innerHTML = `<strong>[${time}]</strong> ${msg}`;
    this.dom.logArea.prepend(div);
  }

  endGame() {
    this.phase = 'GAMEOVER';
    this.resetAllTimers();
    this.cleanTargetableCells();
    this.clearBattleAnimations();
    sounds.playVictory();

    const ranking = [...this.players].sort((a, b) => {
      if (a.alive && !b.alive) return -1;
      if (!a.alive && b.alive) return 1;
      return b.score - a.score;
    });

    const winner = ranking[0];
    this.updateTurnBanner(`🏆 A hadjárat véget ért! Győztes: ${winner.name}`, 'Győzelem');
    this.logEvent(`🏆 A Szabolcsfoglaló győztese: ${winner.name} (${winner.score} ponttal)!`, 'gold');

    document.getElementById('winner-announcement').innerText = `🏆 ${winner.name} uralja Szabolcs-Szatmár-Bereg vármegyét!`;

    const podiumSlots = [
      document.getElementById('podium-p1'),
      document.getElementById('podium-p2'),
      document.getElementById('podium-p3')
    ];

    ranking.forEach((p, idx) => {
      const count = Object.values(this.territoryOwners).filter(id => id === p.id).length;
      podiumSlots[idx].querySelector('.podium-player').innerHTML = `
        <strong style="color:${p.colorHex}">${p.name}</strong><br>
        <span style="font-size:11px;color:#ccc">${p.score} pt (${count} város)</span>
      `;
    });

    this.dom.modalOverlay.style.display = 'flex';
    this.dom.modalOverlay.classList.add('active');
    this.dom.victoryModal.style.display = 'block';
    this.dom.briefingModal.style.display = 'none';
    this.dom.quizModal.style.display = 'none';
    this.dom.startModal.style.display = 'none';
  }

  
  
  
  startOnlineMultiplayerGame(roster, myPlayerId, isHost) {
    this.resetAllTimers();
    this.isOnlineGame = true;
    this.myPlayerId = myPlayerId;
    this.isHost = isHost;

    this.players = roster.map((p, idx) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      colorHex: p.colorHex,
      score: 0,
      isBot: p.isBot,
      castleCity: null,
      towers: 3,
      alive: true,
      lifelines: { choice: 1, guess: 1 }
    }));

    this.territoryOwners = {};
    this.currentRound = 1;
    this.activePlayerIdx = 0;
    this.actionLocked = false;
    this.currentPicker = null;
    this.matchUsedQuestions.clear();
    this.lastQuestionType = null;
    if (!this.choiceDeck || this.choiceDeck.length < 15 || !this.guessDeck || this.guessDeck.length < 10) {
      this.initQuestionDecks();
    }
    this.clearBattleAnimations();
    this.updateLifelineButtons();

    this.players.forEach((p, idx) => {
      const card = this.dom.pCards[idx];
      const isMe = (p.id === this.myPlayerId);
      card.querySelector('.player-name').innerText = isMe ? `${p.name} (Te)` : p.name;
      const botTag = card.querySelector('.bot-tag');
      if (botTag) botTag.style.display = p.isBot ? 'inline-block' : 'none';
      card.querySelector('.castle-towers').innerText = '🏰 🏰 🏰';
      card.querySelector('.score').innerText = '0';
      card.querySelector('.sub-stat').innerText = '0 város';
      card.style.opacity = '1';
    });

    this.mapData.cities.forEach(c => {
      const poly = document.getElementById(`poly-${c.id}`);
      poly.setAttribute('class', 'territory-cell neutral');
      const castleBadge = document.getElementById(`castle-${c.id}`);
      castleBadge.style.display = 'none';
      castleBadge.innerHTML = '';
    });

    this.dom.logArea.innerHTML = '';
    const myName = this.players.find(p => p.id === this.myPlayerId)?.name || 'Vezér';
    this.logEvent(`🌐 3 fős online hadjárat indult! Csatlakozva mint: ${myName} (${this.myPlayerId})`, 'gold');
    this.closeModal();

    this.startBaseSelectionPhase();
  }

  applyRemotePickBase(cityId, playerId) {
    const player = this.players.find(p => p.id === playerId);
    const city = this.mapData.cities.find(c => c.id === cityId);
    if (!player || !city) return;

    this.actionLocked = true;
    this.cleanTargetableCells();
    this.assignBaseCity(player, city);

    setTimeout(() => {
      this.activePlayerIdx++;
      this.promptNextBaseSelection();
    }, 700);
  }

  applyRemoteQuestion(question) {
    clearInterval(this.briefingTimer);
    if (this.dom.briefingModal) this.dom.briefingModal.style.display = 'none';

    this.currentQuestion = question;
    this.playerAnswers = {};
    this.dom.revealBox.style.display = 'none';
    this.dom.revealBox.innerHTML = '';

    if (this.dom.spectatorBanner) {
      this.dom.spectatorBanner.style.display = 'none';
    }
    if (this.dom.answerStatusPill) {
      this.dom.answerStatusPill.style.display = 'none';
      this.dom.answerStatusPill.innerHTML = '';
    }

    this.dom.quizTopic.innerText = question.topic || 'Műveltség';
    this.dom.questionText.innerText = question.q;

    if (question.type === 'choice') {
      this.dom.choicesGrid.style.display = 'grid';
      this.dom.guessWrap.style.display = 'none';
      this.renderChoiceButtons();
    } else {
      this.dom.choicesGrid.style.display = 'none';
      this.dom.guessWrap.style.display = 'flex';
      this.setupGuessControls();
    }

    this.updateLifelineButtons();
    this.dom.modalOverlay.style.display = 'flex';
    this.dom.modalOverlay.classList.add('active');
    this.dom.quizModal.style.display = 'block';

    this.startTimer(20, () => this.onTimerExpire());
  }

  applyRemoteAnswer(playerId, answer, timeSpent) {
    if (this.playerAnswers[playerId] !== undefined) return;
    this.handlePlayerAnswer(playerId, answer, timeSpent);
  }

  applyRemoteExpansionPick(cityId, playerId) {
    const player = this.players.find(p => p.id === playerId);
    const city = this.mapData.cities.find(c => c.id === cityId);
    if (!player || !city) return;

    this.actionLocked = true;
    this.cleanTargetableCells();
    this.conquerTerritory(player, city);

    setTimeout(() => {
      this.processNextPendingConqueror();
    }, 800);
  }

  applyRemoteBattleDeclare(attackerCityId, targetCityId, attackerId, defenderId) {
    const attacker = this.players.find(p => p.id === attackerId);
    const defender = this.players.find(p => p.id === defenderId);
    const attackerCity = this.mapData.cities.find(c => c.id === attackerCityId);
    const targetCity = this.mapData.cities.find(c => c.id === targetCityId);
    if (!attacker || !defender || !attackerCity || !targetCity) return;

    this.actionLocked = true;
    this.cleanTargetableCells();
    this.executeBattleDuel(attacker, defender, attackerCity, targetCity);
  }

  applyRemoteStateSync(payload) {
    if (!payload || this.isHost) return;
    if (payload.territoryOwners) {
      this.territoryOwners = payload.territoryOwners;
      this.mapData.cities.forEach(c => {
        const ownerId = this.territoryOwners[c.id];
        const poly = document.getElementById(`poly-${c.id}`);
        if (poly) {
          poly.setAttribute('class', ownerId ? `territory-cell ${ownerId}-owner` : 'territory-cell neutral');
        }
      });
    }
    if (payload.scores) {
      payload.scores.forEach(s => {
        const p = this.players.find(x => x.id === s.id);
        if (p) {
          p.score = s.score;
          p.towers = s.towers;
          p.castleCity = s.castleCity;
          const idx = this.players.indexOf(p);
          const card = this.dom.pCards[idx];
          if (card) {
            card.querySelector('.score').innerText = p.score;
            card.querySelector('.castle-towers').innerText = '🏰 '.repeat(Math.max(0, p.towers));
          }
        }
      });
    }
  }

  handlePlayerDisconnect(playerId, playerName, newHostPlayerId) {
    const p = this.players.find(x => x.id === playerId);
    if (!p) return;
    p.isBot = true;
    const card = this.dom.pCards[this.players.indexOf(p)];
    if (card) {
      const botTag = card.querySelector('.bot-tag');
      if (botTag) botTag.style.display = 'inline-block';
    }
    this.logEvent(`[Kapcsolat] ${playerName} kilépett, a helyét egy automata vezér vette át!`, p.color);
    if (this.multiplayer) {
      this.multiplayer.showNotification(`${playerName} kilépett, átvette a gép!`);
    }

    
    let becameHostNow = false;
    if (newHostPlayerId === this.myPlayerId) {
      becameHostNow = true;
    } else if (!this.isHost && this.isOnlineGame) {
      const remainingHumans = this.players.filter(x => !x.isBot);
      if (remainingHumans.length > 0 && remainingHumans[0].id === this.myPlayerId) {
        becameHostNow = true;
      }
    }

    if (becameHostNow && !this.isHost) {
      this.isHost = true;
      if (this.multiplayer) this.multiplayer.isHost = true;
      this.logEvent(`👑 Te lettél a meccs új szobagazdája, a játék zavartalanul halad tovább!`, '#d4af37');

      
      if (this.dom.briefingModal && this.dom.briefingModal.style.display !== 'none') {
        clearInterval(this.briefingTimer);
        this.launchQuestionModal();
      } else if (this.dom.quizModal && this.dom.quizModal.style.display !== 'none') {
        this.scheduleBotAnswers();
      }
    }

    if (this.isHost) {
      if (this.phase === 'BASE_SELECT' && this.players[this.activePlayerIdx]?.id === playerId) {
        this.botPickBase(p);
      } else if (this.phase === 'EXPANSION' && this.currentPicker?.id === playerId) {
        this.botPickExpansionTerritory(p);
      } else if (this.phase === 'BATTLE' && this.players[this.activePlayerIdx]?.id === playerId) {
        const attackTargets = this.getValidAttackTargets(p);
        if (attackTargets.length > 0) {
          this.botExecuteAttack(p, attackTargets);
        } else {
          this.advanceBattleTurn();
        }
      }
    }
  }

  
  applyRemoteLifeline(playerId, type, details) {
    const p = this.players.find(x => x.id === playerId);
    if (!p) return;
    this.logEvent(`💡 ${p.name} segítséget vett igénybe (${type === 'choice' ? 'helyes válasz' : 'tipp közelítő'})!`, p.color);
  }

}

window.addEventListener('DOMContentLoaded', () => {
  const game = new SzabolcsGame();
  window.szabolcsGame = game;
  game.init();
});

