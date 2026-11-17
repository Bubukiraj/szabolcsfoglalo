/**
 * =========================================================================
 * 🏰 SZABOLCSFOGLALÓ — MULTIPLAYER HÁLÓZATI MENEDZSER (Socket.IO)
 * =========================================================================
 * Kezeli az Egyjátékos / Online 3 fős módváltást, szobák létrehozását,
 * csatlakozást és valós idejű játékos-szinkronizációt.
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
    
    // Módválasztó kártyák
    this.dom.modeBtnSingle = document.getElementById('mode-btn-single');
    this.dom.modeBtnOnline = document.getElementById('mode-btn-online');
    this.dom.singlePlayerSection = document.getElementById('singleplayer-start-section');
    this.dom.multiplayerSection = document.getElementById('multiplayer-options-section');
    
    // Szobakezelő gombok és input
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

  // ==========================================
  // JÁTÉKMÓD VÁLTÁS (EGYJÁTÉKOS <-> ONLINE 3 FŐ)
  // ==========================================
  setMode(mode) {
    if (window.szabolcsAudio) window.szabolcsAudio.playClick();

    if (mode === 'online') {
      if (this.dom.modeBtnSingle) this.dom.modeBtnSingle.classList.remove('selected');
      if (this.dom.modeBtnOnline) this.dom.modeBtnOnline.classList.add('selected');
      if (this.dom.singlePlayerSection) this.dom.singlePlayerSection.style.display = 'none';
      if (this.dom.multiplayerSection) this.dom.multiplayerSection.style.display = 'block';

      // Előre csatlakoztatjuk a socketet a háttérben
      this.ensureSocketConnected();
    } else {
      if (this.dom.modeBtnOnline) this.dom.modeBtnOnline.classList.remove('selected');
      if (this.dom.modeBtnSingle) this.dom.modeBtnSingle.classList.add('selected');
      if (this.dom.singlePlayerSection) this.dom.singlePlayerSection.style.display = 'block';
      if (this.dom.multiplayerSection) this.dom.multiplayerSection.style.display = 'none';
    }
  }

  bindEvents() {
    // 1. Módválasztó gombok eseményei
    if (this.dom.modeBtnSingle) {
      this.dom.modeBtnSingle.addEventListener('click', () => this.setMode('single'));
    }
    if (this.dom.modeBtnOnline) {
      this.dom.modeBtnOnline.addEventListener('click', () => this.setMode('online'));
    }

    // 2. Szoba Létrehozása gomb
    if (this.dom.btnCreateRoom) {
      this.dom.btnCreateRoom.addEventListener('click', () => {
        const originalText = this.dom.btnCreateRoom.innerText;
        this.dom.btnCreateRoom.innerText = '⌛ Szoba létrehozása...';
        this.dom.btnCreateRoom.disabled = true;

        this.ensureSocketConnected(
          () => {
            const pName = this.getPlayerName();
            console.log('[Multiplayer] Szoba létrehozás kérése:', pName);
            this.socket.emit('create_room', { playerName: pName });
          },
          (err) => {
            this.dom.btnCreateRoom.innerText = originalText;
            this.dom.btnCreateRoom.disabled = false;
            alert('⚠️ Nem sikerült kapcsolódni a szerverhez!\nHa a Render.com-ot használod, ellenőrizd, hogy a Start Command "node server.js"-re van-e állítva, és a szerver zöld "Live" állapotban van-e.');
          }
        );
      });
    }

    // 3. Csatlakozás Szobához gomb
    if (this.dom.btnJoinRoom) {
      this.dom.btnJoinRoom.addEventListener('click', () => {
        const code = this.dom.inputRoomCode.value.trim().toUpperCase();
        if (!code) {
          alert('Kérlek írd be a szobakódot a csatlakozáshoz!');
          return;
        }

        const originalText = this.dom.btnJoinRoom.innerText;
        this.dom.btnJoinRoom.innerText = '⌛ Csatlakozás...';
        this.dom.btnJoinRoom.disabled = true;

        this.ensureSocketConnected(
          () => {
            const pName = this.getPlayerName();
            console.log('[Multiplayer] Csatlakozás kérése:', code, pName);
            this.socket.emit('join_room', { roomCode: code, playerName: pName });
          },
          (err) => {
            this.dom.btnJoinRoom.innerText = originalText;
            this.dom.btnJoinRoom.disabled = false;
            alert('⚠️ Nem sikerült kapcsolódni a szerverhez!\nEllenőrizd a szervert és próbáld újra.');
          }
        );
      });
    }

    // Enter lenyomás a szobakód mezőben
    if (this.dom.inputRoomCode) {
      this.dom.inputRoomCode.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (this.dom.btnJoinRoom) this.dom.btnJoinRoom.click();
        }
      });
    }

    // 4. Kód és link másolása a vágólapra
    if (this.dom.btnCopyCode) {
      this.dom.btnCopyCode.addEventListener('click', () => {
        if (!this.roomCode) return;
        navigator.clipboard.writeText(this.roomCode).then(() => {
          this.showNotification('📋 Szobakód másolva a vágólapra!');
        });
      });
    }

    if (this.dom.btnCopyLink) {
      this.dom.btnCopyLink.addEventListener('click', () => {
        if (!this.roomCode) return;
        const url = `${window.location.origin}${window.location.pathname}?szoba=${this.roomCode}`;
        navigator.clipboard.writeText(url).then(() => {
          this.showNotification('🔗 Meghívó link kimásolva!');
        });
      });
    }

    // 5. Üres hely feltöltése bottal
    if (this.dom.btnAddBot) {
      this.dom.btnAddBot.addEventListener('click', () => {
        if (!this.isHost || !this.socket) return;
        this.socket.emit('fill_bot_slot');
      });
    }

    // 6. Többjátékos meccs indítása (csak a gazdának)
    if (this.dom.btnStartMultiplayer) {
      this.dom.btnStartMultiplayer.addEventListener('click', () => {
        if (!this.isHost || !this.socket) return;
        this.socket.emit('start_game');
      });
    }

    // 7. Kilépés a szobából a főmenübe
    if (this.dom.btnLeaveLobby) {
      this.dom.btnLeaveLobby.addEventListener('click', () => {
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
          this.connected = false;
        }
        this.isMultiplayer = false;
        this.roomCode = null;
        if (this.dom.lobbyModal) this.dom.lobbyModal.style.display = 'none';
        if (this.dom.startModal) this.dom.startModal.style.display = 'block';
        if (this.dom.modalOverlay) this.dom.modalOverlay.style.display = 'flex';
      });
    }
  }

  // URL paraméter ellenőrzése (?szoba=VAR123)
  checkUrlForRoomCode() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('szoba') || params.get('room');
    if (code) {
      this.setMode('online');
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
  ensureSocketConnected(callback, errorCallback) {
    if (this.socket && this.socket.connected) {
      if (callback) callback();
      return;
    }

    if (typeof io === 'undefined') {
      console.error('[Multiplayer] A Socket.IO könyvtár még nem töltődött be!');
      if (errorCallback) errorCallback('Socket.IO not loaded');
      return;
    }

    if (!this.socket) {
      this.socket = io({
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        timeout: 10000
      });

      this.setupSocketListeners();
    }

    if (this.socket.connected) {
      if (callback) callback();
    } else {
      let isHandled = false;

      const onConnect = () => {
        if (isHandled) return;
        isHandled = true;
        this.connected = true;
        this.socket.off('connect_error', onError);
        if (callback) callback();
      };

      const onError = (err) => {
        if (isHandled) return;
        isHandled = true;
        this.socket.off('connect', onConnect);
        console.error('[Multiplayer] Socket kapcsolódási hiba:', err);
        if (errorCallback) errorCallback(err);
      };

      this.socket.once('connect', onConnect);
      this.socket.once('connect_error', onError);

      setTimeout(() => {
        if (!isHandled && !this.socket.connected) {
          isHandled = true;
          this.socket.off('connect', onConnect);
          this.socket.off('connect_error', onError);
          if (errorCallback) errorCallback('Connection timed out');
        }
      }, 9000);
    }
  }

  setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('[Multiplayer] Socket csatlakozva:', this.socket.id);
      this.connected = true;
    });

    // 1. Szoba létrehozva
    this.socket.on('room_created', (data) => {
      if (this.dom.btnCreateRoom) {
        this.dom.btnCreateRoom.innerText = '🏰 Új Szoba Létrehozása (Gazda)';
        this.dom.btnCreateRoom.disabled = false;
      }
      this.roomCode = data.roomCode;
      this.myPlayerId = data.myPlayerId;
      this.isHost = true;
      this.isMultiplayer = true;
      this.roomPlayers = data.players;
      this.openLobbyModal();
      this.updateLobbyUI();
      if (window.szabolcsAudio) window.szabolcsAudio.playClick();
    });

    // 2. Sikeres csatlakozás
    this.socket.on('room_joined', (data) => {
      if (this.dom.btnJoinRoom) {
        this.dom.btnJoinRoom.innerText = 'Csatlakozás';
        this.dom.btnJoinRoom.disabled = false;
      }
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

    // 4. Szobahiba
    this.socket.on('room_error', (data) => {
      if (this.dom.btnCreateRoom) {
        this.dom.btnCreateRoom.innerText = '🏰 Új Szoba Létrehozása (Gazda)';
        this.dom.btnCreateRoom.disabled = false;
      }
      if (this.dom.btnJoinRoom) {
        this.dom.btnJoinRoom.innerText = 'Csatlakozás';
        this.dom.btnJoinRoom.disabled = false;
      }
      alert(`⚠️ Hiba: ${data.message}`);
    });

    // 5. Játék elindult a szobában
    this.socket.on('game_started', (data) => {
      console.log('[Multiplayer] A játék elindult!', data);
      this.roomPlayers = data.players;
      this.closeLobbyModal();
      this.game.startOnlineMultiplayerGame(data.players, this.myPlayerId, this.isHost);
    });

    // 6. Távoli játékos akció
    this.socket.on('remote_game_action', (actionData) => {
      this.handleRemoteAction(actionData);
    });

    // 7. Játékos megszakadt
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

  sendAction(type, payload = {}) {
    if (!this.isMultiplayer || !this.socket) return;
    this.socket.emit('game_action', {
      type: type,
      senderPlayerId: this.myPlayerId,
      payload: payload,
      timestamp: Date.now()
    });
  }

  handleRemoteAction(data) {
    if (!data || !data.type) return;
    const { type, payload } = data;

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
        console.log('[Multiplayer] Ismeretlen akció:', type);
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

window.SzabolcsMultiplayer = SzabolcsMultiplayer;
