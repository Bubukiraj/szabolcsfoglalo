/**
 * =========================================================================
 * 🏰 SZABOLCSFOGLALÓ — MULTIPLAYER HÁLÓZATI MENEDZSER (Socket.IO)
 * =========================================================================
 * Kezeli a szobák létrehozását, csatlakozást, valós idejű játékos-szinkronizációt
 * Render.com és lokális szerver környezetben egyaránt.
 */

class SzabolcsMultiplayer {
  constructor(game) {
    this.game = game;
    this.socket = null;
    this.roomCode = null;
    this.myPlayerId = 'p1'; // 'p1' | 'p2' | 'p3'
    this.isHost = false;
    this.isMultiplayer = false;
    this.roomPlayers = [];
    this.connected = false;

    this.dom = {};
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.checkUrlForRoomCode();
  }

  cacheDom() {
    this.dom.modalOverlay = document.getElementById('modal-overlay');
    this.dom.startModal = document.getElementById('start-modal');
    this.dom.lobbyModal = document.getElementById('multiplayer-lobby-modal');
    
    // Kezdőképernyő módválasztók
    this.dom.modeCards = document.querySelectorAll('.mode-card input[name="gamemode"]');
    this.dom.singlePlayerSection = document.getElementById('singleplayer-start-section');
    this.dom.multiplayerSection = document.getElementById('multiplayer-options-section');
    
    // Szoba kezelő gombok
    this.dom.btnCreateRoom = document.getElementById('btn-create-room');
    this.dom.btnJoinRoom = document.getElementById('btn-join-room');
    this.dom.inputRoomCode = document.getElementById('input-room-code');
    this.dom.inputPlayerName = document.getElementById('player-name-input');
    
    // Lobby elemek
    this.dom.lobbyRoomCode = document.getElementById('lobby-room-code-display');
    this.dom.lobbyPlayerCards = [
      document.getElementById('lobby-card-p1'),
      document.getElementById('lobby-card-p2'),
      document.getElementById('lobby-card-p3')
    ];
    this.dom.btnCopyCode = document.getElementById('btn-copy-room-code');
    this.dom.btnCopyLink = document.getElementById('btn-copy-invite-link');
    this.dom.btnAddBot = document.getElementById('btn-lobby-add-bot');
    this.dom.btnStartMultiplayer = document.getElementById('btn-start-multiplayer-game');
    this.dom.lobbyStatusMsg = document.getElementById('lobby-status-msg');
    this.dom.btnLeaveLobby = document.getElementById('btn-leave-lobby');
  }

  bindEvents() {
    // Játékmód rádiógomb váltás (Egyjátékos vs Online többjátékos)
    this.dom.modeCards.forEach(radio => {
      radio.addEventListener('change', (e) => {
        document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
        const parentCard = e.target.closest('.mode-card');
        if (parentCard) parentCard.classList.add('selected');

        const val = e.target.value;
        if (val === 'online') {
          if (this.dom.singlePlayerSection) this.dom.singlePlayerSection.style.display = 'none';
          if (this.dom.multiplayerSection) this.dom.multiplayerSection.style.display = 'block';
        } else {
          if (this.dom.singlePlayerSection) this.dom.singlePlayerSection.style.display = 'block';
          if (this.dom.multiplayerSection) this.dom.multiplayerSection.style.display = 'none';
        }
      });
    });

    // Szoba Létrehozása
    if (this.dom.btnCreateRoom) {
      this.dom.btnCreateRoom.addEventListener('click', () => {
        this.ensureSocketConnected(() => {
          const pName = this.getPlayerName();
          console.log('[Multiplayer] Szoba létrehozás kérése:', pName);
          this.socket.emit('create_room', { playerName: pName });
        });
      });
    }

    // Csatlakozás Szobához
    if (this.dom.btnJoinRoom) {
      this.dom.btnJoinRoom.addEventListener('click', () => {
        const code = this.dom.inputRoomCode.value.trim().toUpperCase();
        if (!code) {
          alert('Kérlek írd be a szobakódot a csatlakozáshoz!');
          return;
        }
        this.ensureSocketConnected(() => {
          const pName = this.getPlayerName();
          console.log('[Multiplayer] Csatlakozás kérése:', code, pName);
          this.socket.emit('join_room', { roomCode: code, playerName: pName });
        });
      });
    }

    // Kód és link másolása a vágólapra
    if (this.dom.btnCopyCode) {
      this.dom.btnCopyCode.addEventListener('click', () => {
        if (!this.roomCode) return;
        navigator.clipboard.writeText(this.roomCode).then(() => {
          this.showNotification('Szobakód másolva a vágólapra!');
        });
      });
    }

    if (this.dom.btnCopyLink) {
      this.dom.btnCopyLink.addEventListener('click', () => {
        if (!this.roomCode) return;
        const url = `${window.location.origin}${window.location.pathname}?szoba=${this.roomCode}`;
        navigator.clipboard.writeText(url).then(() => {
          this.showNotification('Meghívó link kimásolva!');
        });
      });
    }

    // Üres hely feltöltése bottal (csak a gazdának)
    if (this.dom.btnAddBot) {
      this.dom.btnAddBot.addEventListener('click', () => {
        if (!this.isHost || !this.socket) return;
        this.socket.emit('fill_bot_slot');
      });
    }

    // Többjátékos meccs indítása (csak a gazdának)
    if (this.dom.btnStartMultiplayer) {
      this.dom.btnStartMultiplayer.addEventListener('click', () => {
        if (!this.isHost || !this.socket) return;
        this.socket.emit('start_game');
      });
    }

    // Kilépés a szobából a főmenübe
    if (this.dom.btnLeaveLobby) {
      this.dom.btnLeaveLobby.addEventListener('click', () => {
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }
        this.isMultiplayer = false;
        this.roomCode = null;
        if (this.dom.lobbyModal) this.dom.lobbyModal.style.display = 'none';
        if (this.dom.startModal) this.dom.startModal.style.display = 'block';
      });
    }
  }

  // URL paraméter ellenőrzése (?szoba=VAR123)
  checkUrlForRoomCode() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('szoba') || params.get('room');
    if (code) {
      const onlineRadio = document.querySelector('input[name="gamemode"][value="online"]');
      if (onlineRadio) {
        onlineRadio.checked = true;
        onlineRadio.dispatchEvent(new Event('change'));
      }
      if (this.dom.inputRoomCode) {
        this.dom.inputRoomCode.value = code.toUpperCase();
      }
    }
  }

  getPlayerName() {
    if (this.dom.inputPlayerName && this.dom.inputPlayerName.value.trim()) {
      return this.dom.inputPlayerName.value.trim().substring(0, 20);
    }
    return 'Vezér';
  }

  // Socket.IO kapcsolat felépítése
  ensureSocketConnected(callback) {
    if (this.socket && this.socket.connected) {
      if (callback) callback();
      return;
    }

    if (typeof io === 'undefined') {
      alert('A Socket.IO könyvtár még nem töltődött be! Kérlek indítsd el a szervert ("node server.js").');
      return;
    }

    this.socket = io();

    this.socket.on('connect', () => {
      console.log('[Multiplayer] Socket csatlakozva a szerverhez:', this.socket.id);
      this.connected = true;
      if (callback) callback();
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Multiplayer] Kapcsolódási hiba:', err);
      alert('Nem sikerült csatlakozni a szerverhez! Ellenőrizd, hogy fut-e a Node.js szerver.');
    });

    // 1. Szoba létrehozva válasz
    this.socket.on('room_created', (data) => {
      this.roomCode = data.roomCode;
      this.myPlayerId = data.myPlayerId;
      this.isHost = true;
      this.isMultiplayer = true;
      this.roomPlayers = data.players;
      this.openLobbyModal();
      this.updateLobbyUI();
      if (window.szabolcsAudio) window.szabolcsAudio.playClick();
    });

    // 2. Sikeres csatlakozás meglévő szobához
    this.socket.on('room_joined', (data) => {
      this.roomCode = data.roomCode;
      this.myPlayerId = data.myPlayerId;
      this.isHost = false;
      this.isMultiplayer = true;
      this.roomPlayers = data.players;
      this.openLobbyModal();
      this.updateLobbyUI();
      if (window.szabolcsAudio) window.szabolcsAudio.playClick();
    });

    // 3. Szoba tagjainak frissülése
    this.socket.on('room_update', (data) => {
      this.roomPlayers = data.players;
      this.isHost = (data.hostSocketId === this.socket.id);
      this.updateLobbyUI();
    });

    // 4. Szobahiba (nem létezik, tele van, stb.)
    this.socket.on('room_error', (data) => {
      alert(`⚠️ Hiba: ${data.message}`);
    });

    // 5. Játék elindult a szobában
    this.socket.on('game_started', (data) => {
      console.log('[Multiplayer] A játék elkezdődött!', data);
      this.roomPlayers = data.players;
      this.closeLobbyModal();
      
      // Átadjuk a vezérlést a játékmotornak a szinkronizált játékosokkal
      this.game.startOnlineMultiplayerGame(data.players, this.myPlayerId, this.isHost);
    });

    // 6. Távoli játékos akció érkezett
    this.socket.on('remote_game_action', (actionData) => {
      this.handleRemoteAction(actionData);
    });

    // 7. Játékos kapcsolat megszakadt
    this.socket.on('player_disconnected', (data) => {
      console.warn('[Multiplayer] Játékos megszakadt:', data);
      this.game.handlePlayerDisconnect(data.playerId, data.playerName);
    });
  }

  openLobbyModal() {
    if (this.dom.startModal) this.dom.startModal.style.display = 'none';
    if (this.dom.lobbyModal) this.dom.lobbyModal.style.display = 'block';
    if (this.dom.modalOverlay) this.dom.modalOverlay.style.display = 'flex';
  }

  closeLobbyModal() {
    if (this.dom.lobbyModal) this.dom.lobbyModal.style.display = 'none';
    if (this.dom.modalOverlay) this.dom.modalOverlay.style.display = 'none';
  }

  updateLobbyUI() {
    if (this.dom.lobbyRoomCode) {
      this.dom.lobbyRoomCode.innerText = this.roomCode || '---';
    }

    // 3 játékos kártya frissítése
    const slots = ['p1', 'p2', 'p3'];
    slots.forEach((slotId, idx) => {
      const card = this.dom.lobbyPlayerCards[idx];
      if (!card) return;

      const player = this.roomPlayers.find(p => p.id === slotId);
      const nameElem = card.querySelector('.lobby-player-name');
      const badgeElem = card.querySelector('.lobby-player-role');
      const statusElem = card.querySelector('.lobby-player-status');

      if (player) {
        card.classList.add('occupied');
        card.classList.remove('empty');
        if (nameElem) nameElem.innerText = player.name;
        if (badgeElem) {
          if (player.isHost) {
            badgeElem.innerText = '👑 Szobagazda';
            badgeElem.className = 'lobby-player-role host';
          } else if (player.isBot) {
            badgeElem.innerText = '🤖 Gép (Bot)';
            badgeElem.className = 'lobby-player-role bot';
          } else {
            badgeElem.innerText = (player.id === this.myPlayerId) ? '⭐ Te magad' : '⚔ Vezértárs';
            badgeElem.className = 'lobby-player-role guest';
          }
        }
        if (statusElem) statusElem.innerText = '✅ Csatlakozva';
      } else {
        card.classList.remove('occupied');
        card.classList.add('empty');
        if (nameElem) nameElem.innerText = 'Szabad hely...';
        if (badgeElem) {
          badgeElem.innerText = '⏳ Várakozás';
          badgeElem.className = 'lobby-player-role waiting';
        }
        if (statusElem) statusElem.innerText = 'Hívd meg barátodat!';
      }
    });

    // Indító gomb és állapotfrissítés
    const humanCount = this.roomPlayers.filter(p => !p.isBot).length;
    const totalCount = this.roomPlayers.length;

    if (this.isHost) {
      if (this.dom.btnStartMultiplayer) {
        this.dom.btnStartMultiplayer.style.display = 'block';
        this.dom.btnStartMultiplayer.innerText = `⚔ Hadjárat Indítása (${totalCount}/3)`;
      }
      if (this.dom.btnAddBot) {
        this.dom.btnAddBot.style.display = (totalCount < 3) ? 'inline-block' : 'none';
      }
      if (this.dom.lobbyStatusMsg) {
        if (totalCount === 3) {
          this.dom.lobbyStatusMsg.innerText = 'Minden hely betelt! Te vagy a szobagazda, indíthatod a hadjáratot!';
          this.dom.lobbyStatusMsg.className = 'lobby-status ready';
        } else {
          this.dom.lobbyStatusMsg.innerText = `Várakozás játékosokra (${totalCount}/3)... Oszd meg a szobakódot vagy linket barátaiddal!`;
          this.dom.lobbyStatusMsg.className = 'lobby-status waiting';
        }
      }
    } else {
      if (this.dom.btnStartMultiplayer) this.dom.btnStartMultiplayer.style.display = 'none';
      if (this.dom.btnAddBot) this.dom.btnAddBot.style.display = 'none';
      if (this.dom.lobbyStatusMsg) {
        this.dom.lobbyStatusMsg.innerText = 'Csatlakoztál a szobához! Várakozás a szobagazda indítására...';
        this.dom.lobbyStatusMsg.className = 'lobby-status waiting';
      }
    }
  }

  // Akció küldése a szoba összes többi tagjának
  sendAction(type, payload = {}) {
    if (!this.isMultiplayer || !this.socket) return;
    this.socket.emit('game_action', {
      type: type,
      senderPlayerId: this.myPlayerId,
      payload: payload,
      timestamp: Date.now()
    });
  }

  // Távoli játékos akció feldolgozása a játékmotorban
  handleRemoteAction(data) {
    if (!data || !data.type) return;
    const { type, senderPlayerId, payload } = data;

    switch (type) {
      case 'PICK_BASE':
        this.game.applyRemotePickBase(payload.cityId, payload.playerId);
        break;

      case 'PRESENT_QUESTION':
        this.game.applyRemoteQuestion(payload.question);
        break;

      case 'SUBMIT_ANSWER':
        this.game.applyRemoteAnswer(payload.playerId, payload.answer, payload.timeSpent);
        break;

      case 'EXPANSION_PICK':
        this.game.applyRemoteExpansionPick(payload.cityId, payload.playerId);
        break;

      case 'BATTLE_DECLARE':
        this.game.applyRemoteBattleDeclare(payload.attackerCityId, payload.targetCityId, payload.attackerId, payload.defenderId);
        break;

      case 'LIFELINE_USED':
        this.game.applyRemoteLifeline(payload.playerId, payload.type, payload.details);
        break;

      case 'STATE_SYNC':
        this.game.applyRemoteStateSync(payload);
        break;

      default:
        console.log('[Multiplayer] Ismeretlen távoli akció:', type, payload);
    }
  }

  showNotification(msg) {
    const toast = document.createElement('div');
    toast.className = 'game-toast';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }
}

// Globális példány
window.SzabolcsMultiplayer = SzabolcsMultiplayer;
