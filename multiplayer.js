







class SzabolcsMultiplayer {
  constructor(game) {
    this.game = game;
    this.socket = null;
    this.roomCode = null;
    this.myPlayerId = 'p1'; 
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
    this.prewarmServer();
  }

  cacheDom() {
    this.dom.modalOverlay = document.getElementById('modal-overlay');
    this.dom.startModal = document.getElementById('start-modal');
    this.dom.lobbyModal = document.getElementById('multiplayer-lobby-modal');
    
    
    this.dom.modeBtnSingle = document.getElementById('mode-btn-single');
    this.dom.modeBtnOnline = document.getElementById('mode-btn-online');
    this.dom.singlePlayerSection = document.getElementById('singleplayer-start-section');
    this.dom.multiplayerSection = document.getElementById('multiplayer-options-section');
    
    
    this.dom.btnCreateRoom = document.getElementById('btn-create-room');
    this.dom.btnJoinRoom = document.getElementById('btn-join-room');
    this.dom.inputRoomCode = document.getElementById('input-room-code');
    this.dom.inputPlayerName = document.getElementById('player-name-input');
    
    
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

  
  
  
  setMode(mode) {
    if (window.szabolcsAudio) window.szabolcsAudio.playClick();

    if (mode === 'online') {
      if (this.dom.modeBtnSingle) this.dom.modeBtnSingle.classList.remove('selected');
      if (this.dom.modeBtnOnline) this.dom.modeBtnOnline.classList.add('selected');
      if (this.dom.singlePlayerSection) this.dom.singlePlayerSection.style.display = 'none';
      if (this.dom.multiplayerSection) this.dom.multiplayerSection.style.display = 'block';

      
      this.ensureSocketConnected();
    } else {
      if (this.dom.modeBtnOnline) this.dom.modeBtnOnline.classList.remove('selected');
      if (this.dom.modeBtnSingle) this.dom.modeBtnSingle.classList.add('selected');
      if (this.dom.singlePlayerSection) this.dom.singlePlayerSection.style.display = 'block';
      if (this.dom.multiplayerSection) this.dom.multiplayerSection.style.display = 'none';
    }
  }

  bindEvents() {
    
    if (this.dom.modeBtnSingle) {
      this.dom.modeBtnSingle.addEventListener('click', () => this.setMode('single'));
    }
    if (this.dom.modeBtnOnline) {
      this.dom.modeBtnOnline.addEventListener('click', () => this.setMode('online'));
    }

    
    if (this.dom.btnCreateRoom) {
      this.dom.btnCreateRoom.addEventListener('click', () => {
        const originalText = this.dom.btnCreateRoom.innerText;
        this.dom.btnCreateRoom.innerText = '⌛ Kapcsolódás a szerverhez...';
        this.dom.btnCreateRoom.disabled = true;

        const slowNotice = setTimeout(() => {
          if (this.dom.btnCreateRoom && this.dom.btnCreateRoom.disabled) {
            this.dom.btnCreateRoom.innerText = '⌛ Szerver ébresztése... (~25 mp)';
          }
        }, 3000);

        this.ensureSocketConnected(
          () => {
            clearTimeout(slowNotice);
            const pName = this.getPlayerName();
            this.socket.emit('create_room', { playerName: pName });
          },
          (err) => {
            clearTimeout(slowNotice);
            this.dom.btnCreateRoom.innerText = originalText;
            this.dom.btnCreateRoom.disabled = false;
            alert('⚠️ Nem sikerült kapcsolódni a szerverhez! Kérlek várj pár másodpercet és próbáld újra.');
          }
        );
      });
    }

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

        const slowNotice = setTimeout(() => {
          if (this.dom.btnJoinRoom && this.dom.btnJoinRoom.disabled) {
            this.dom.btnJoinRoom.innerText = '⌛ Szerver ébresztése... (~25 mp)';
          }
        }, 3000);

        this.ensureSocketConnected(
          () => {
            clearTimeout(slowNotice);
            const pName = this.getPlayerName();
            this.socket.emit('join_room', { roomCode: code, playerName: pName });
          },
          (err) => {
            clearTimeout(slowNotice);
            this.dom.btnJoinRoom.innerText = originalText;
            this.dom.btnJoinRoom.disabled = false;
            alert('⚠️ Nem sikerült kapcsolódni a szerverhez! Kérlek ellenőrizd a szobakódot és próbáld újra.');
          }
        );
      });
    }

    
    if (this.dom.inputRoomCode) {
      this.dom.inputRoomCode.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (this.dom.btnJoinRoom) this.dom.btnJoinRoom.click();
        }
      });
    }

    
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
        const base = (window.location.protocol.startsWith('http'))
          ? `${window.location.origin}${window.location.pathname}`
          : 'https://szabolcsfoglalo.onrender.com/';
        const url = `${base}?szoba=${this.roomCode}`;
        navigator.clipboard.writeText(url).then(() => {
          this.showNotification('🔗 Meghívó link kimásolva!');
        });
      });
    }

    
    if (this.dom.btnAddBot) {
      this.dom.btnAddBot.addEventListener('click', () => {
        if (!this.isHost || !this.socket) return;
        this.socket.emit('fill_bot_slot');
      });
    }

    
    if (this.dom.btnStartMultiplayer) {
      this.dom.btnStartMultiplayer.addEventListener('click', () => {
        if (!this.isHost || !this.socket) return;
        this.socket.emit('start_game');
      });
    }

    
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

  
  getServerUrl() {
    if (window.location.protocol === 'file:' || !window.location.protocol.startsWith('http')) {
      return 'https://szabolcsfoglalo.onrender.com';
    }
    if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port === '3000') {
      return undefined;
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'https://szabolcsfoglalo.onrender.com';
    }
    if (window.location.hostname.includes('onrender.com')) {
      return undefined;
    }
    return 'https://szabolcsfoglalo.onrender.com';
  }

  prewarmServer() {
    try {
      const base = this.getServerUrl() || window.location.origin;
      fetch(base + '/ping', { method: 'GET', mode: 'cors', cache: 'no-store' }).catch(() => {});
    } catch (e) {}
  }

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
      const serverUrl = this.getServerUrl();
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 25,
        reconnectionDelay: 1000,
        timeout: 45000
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
        if (callback) callback();
      };

      this.socket.once('connect', onConnect);

      setTimeout(() => {
        if (!isHandled && (!this.socket || !this.socket.connected)) {
          isHandled = true;
          this.socket.off('connect', onConnect);
          if (errorCallback) errorCallback('Connection timed out');
        }
      }, 40000);
    }
  }

  setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('[Multiplayer] Socket csatlakozva:', this.socket.id);
      this.connected = true;
    });

    
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

    
    this.socket.on('room_update', (data) => {
      this.roomPlayers = data.players;
      this.isHost = (data.hostSocketId === this.socket.id);
      this.updateLobbyUI();
    });

    
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

    
    this.socket.on('game_started', (data) => {
      console.log('[Multiplayer] A játék elindult!', data);
      this.roomPlayers = data.players;
      this.closeLobbyModal();
      this.game.startOnlineMultiplayerGame(data.players, this.myPlayerId, this.isHost);
    });

    
    this.socket.on('remote_game_action', (actionData) => {
      this.handleRemoteAction(actionData);
    });

    
    this.socket.on('player_disconnected', (data) => {
      console.warn('[Multiplayer] Játékos kilépett vagy megszakadt:', data);
      if (data.newHostPlayerId && data.newHostPlayerId === this.myPlayerId) {
        this.isHost = true;
        this.game.isHost = true;
        this.showNotification('👑 Átvetted a meccs vezetését (új szobagazda lettél)!');
      }
      this.game.handlePlayerDisconnect(data.playerId, data.playerName, data.newHostPlayerId);
    });
  }

  openLobbyModal() {
    if (this.dom.startModal) this.dom.startModal.style.display = 'none';
    if (this.dom.lobbyModal) this.dom.lobbyModal.style.display = 'block';
    if (this.dom.modalOverlay) {
      this.dom.modalOverlay.style.display = 'flex';
      this.dom.modalOverlay.classList.add('active');
    }
  }

  closeLobbyModal() {
    if (this.dom.lobbyModal) this.dom.lobbyModal.style.display = 'none';
    if (this.dom.modalOverlay) {
      this.dom.modalOverlay.classList.remove('active');
      this.dom.modalOverlay.style.display = 'none';
    }
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
