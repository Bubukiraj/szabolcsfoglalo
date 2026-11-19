/**
 * Szabolcsfoglaló - Render.com Kompatibilis Node.js WebSocket & Web Szerver
 * Express + Socket.IO 3 fős valós idejű multiplayer szobakezelővel.
 */

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Statikus fájlok kiszolgálása a projekt gyökeréből
app.use(express.static(path.join(__dirname)));

// Egészségügyi ellenőrző végpont (Render.com health check-hez)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime(), rooms: rooms.size });
});

// Szobakezelő adatszerkezet
// roomCode -> { code, hostSocketId, players: [...], started: false }
const rooms = new Map();

const HISTORICAL_BOTS = [
  { name: 'Báthori Erzsébet', color: 'p2', colorHex: '#2ecc71' },
  { name: 'Kállai Botond', color: 'p3', colorHex: '#3498db' },
  { name: 'Jósa András', color: 'p2', colorHex: '#2ecc71' }
];

function generateRoomCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numbers = '23456789';
  let code = '';
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 3; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return code;
}

function getPlayerSlot(existingPlayers) {
  const taken = existingPlayers.map(p => p.id);
  if (!taken.includes('p1')) return 'p1';
  if (!taken.includes('p2')) return 'p2';
  if (!taken.includes('p3')) return 'p3';
  return null;
}

function getSlotColor(slotId) {
  if (slotId === 'p1') return { color: 'p1', colorHex: '#e74c3c' };
  if (slotId === 'p2') return { color: 'p2', colorHex: '#2ecc71' };
  return { color: 'p3', colorHex: '#3498db' };
}

io.on('connection', (socket) => {
  console.log(`[Socket] Új kapcsolat: ${socket.id}`);

  // 1. Új szoba létrehozása
  socket.on('create_room', (data) => {
    const playerName = (data && data.playerName && data.playerName.trim()) || 'Vezér 1';
    let roomCode = generateRoomCode();
    while (rooms.has(roomCode)) {
      roomCode = generateRoomCode();
    }

    const hostPlayer = {
      socketId: socket.id,
      id: 'p1',
      name: playerName,
      color: 'p1',
      colorHex: '#e74c3c',
      isHost: true,
      isBot: false,
      isReady: true
    };

    const room = {
      code: roomCode,
      hostSocketId: socket.id,
      players: [hostPlayer],
      started: false,
      createdAt: Date.now()
    };

    rooms.set(roomCode, room);
    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.playerId = 'p1';

    console.log(`[Szoba Létrehozva] Kód: ${roomCode}, Gazda: ${playerName} (${socket.id})`);

    socket.emit('room_created', {
      roomCode: roomCode,
      players: room.players,
      myPlayerId: 'p1'
    });
  });

  // 2. Csatlakozás meglévő szobához
  socket.on('join_room', (data) => {
    const rawCode = (data && data.roomCode) || '';
    const roomCode = rawCode.trim().toUpperCase();
    const playerName = (data && data.playerName && data.playerName.trim()) || 'Vezér';

    const room = rooms.get(roomCode);
    if (!room) {
      return socket.emit('room_error', { message: `A(z) "${roomCode}" kódú szoba nem létezik! Ellenőrizd a kódot.` });
    }

    if (room.started) {
      return socket.emit('room_error', { message: 'Ebben a szobában a hadjárat már elkezdődött!' });
    }

    const humanCount = room.players.filter(p => !p.isBot).length;
    if (humanCount >= 3) {
      return socket.emit('room_error', { message: 'Ez a szoba már megtelt (mind a 3 vezér csatlakozott)!' });
    }

    const slotId = getPlayerSlot(room.players);
    if (!slotId) {
      return socket.emit('room_error', { message: 'Nincs szabad játékoshely a szobában!' });
    }

    const colors = getSlotColor(slotId);
    const newPlayer = {
      socketId: socket.id,
      id: slotId,
      name: playerName,
      color: colors.color,
      colorHex: colors.colorHex,
      isHost: false,
      isBot: false,
      isReady: true
    };

    room.players.push(newPlayer);
    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.playerId = slotId;

    console.log(`[Szoba Csatlakozás] Kód: ${roomCode}, Játékos: ${playerName} (${slotId})`);

    socket.emit('room_joined', {
      roomCode: roomCode,
      players: room.players,
      myPlayerId: slotId
    });

    // Értesítjük a szoba összes többi tagját a megváltozott névsorról
    io.to(roomCode).emit('room_update', {
      players: room.players,
      hostSocketId: room.hostSocketId
    });
  });

  // 3. Üres hely kitöltése bottal (ha a gazda 2 emberrel és 1 bottal szeretne játszani)
  socket.on('fill_bot_slot', (data) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.hostSocketId !== socket.id || room.started) return;

    if (room.players.length >= 3) return;

    const slotId = getPlayerSlot(room.players);
    if (!slotId) return;

    const colors = getSlotColor(slotId);
    const botTemplate = HISTORICAL_BOTS[room.players.length % HISTORICAL_BOTS.length];

    const botPlayer = {
      socketId: null,
      id: slotId,
      name: botTemplate.name,
      color: colors.color,
      colorHex: colors.colorHex,
      isHost: false,
      isBot: true,
      isReady: true
    };

    room.players.push(botPlayer);
    io.to(room.code).emit('room_update', {
      players: room.players,
      hostSocketId: room.hostSocketId
    });
  });

  // 4. Játék elindítása a gazda által
  socket.on('start_game', () => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.hostSocketId !== socket.id) return;
    if (room.started) return;

    // Ha kevesebb mint 3 játékos van a szobában, a hiányzó helyeket automatikusan botokkal töltjük fel
    while (room.players.length < 3) {
      const slotId = getPlayerSlot(room.players);
      const colors = getSlotColor(slotId);
      const botTemplate = HISTORICAL_BOTS[(room.players.length - 1) % HISTORICAL_BOTS.length];
      room.players.push({
        socketId: null,
        id: slotId,
        name: botTemplate.name,
        color: colors.color,
        colorHex: colors.colorHex,
        isHost: false,
        isBot: true,
        isReady: true
      });
    }

    room.started = true;
    console.log(`[Játék Indul] Szoba: ${room.code}, Játékosok:`, room.players.map(p => `${p.name} (${p.id})`));

    // Mind a 3 kliens megkapja az indulási parancsot a végleges játékoslistával
    io.to(room.code).emit('game_started', {
      players: room.players
    });
  });

  // 5. Valós idejű játékos akciók továbbítása a szoba többi tagjának
  // (városválasztás, kérdésmegjelenítés, válaszleadás, segítségkérés)
  socket.on('game_action', (actionData) => {
    const roomCode = socket.roomCode;
    if (!roomCode || !rooms.has(roomCode)) return;

    // Továbbítjuk a szoba összes többi kliensének
    socket.to(roomCode).emit('remote_game_action', actionData);
  });

  // 6. Kapcsolat megszakadása
  socket.on('disconnect', () => {
    console.log(`[Socket] Kapcsolat lezárult: ${socket.id}`);
    const roomCode = socket.roomCode;
    if (!roomCode || !rooms.has(roomCode)) return;

    const room = rooms.get(roomCode);

    if (!room.started) {
      // Ha még a lobbyban voltak, kivesszük a játékost
      room.players = room.players.filter(p => p.socketId !== socket.id);

      if (room.players.length === 0) {
        rooms.delete(roomCode);
        console.log(`[Szoba Törölve] Üres szoba törölve: ${roomCode}`);
      } else {
        // Ha a gazda lépett ki, a következő játékos lesz az új gazda
        if (room.hostSocketId === socket.id) {
          const nextHost = room.players.find(p => !p.isBot);
          if (nextHost) {
            nextHost.isHost = true;
            room.hostSocketId = nextHost.socketId;
          }
        }
        io.to(roomCode).emit('room_update', {
          players: room.players,
          hostSocketId: room.hostSocketId
        });
      }
    } else {
      // Ha már játékban voltak: értesítjük a többieket és átadjuk a szobagazda szerepet ha a gazda lépett ki
      const leftPlayer = room.players.find(p => p.socketId === socket.id);
      if (leftPlayer) {
        leftPlayer.isBot = true;
        leftPlayer.socketId = null;
        console.log(`[Játékos Kilépett] ${leftPlayer.name} (${leftPlayer.id}) kilépett a játékból, helyét bot veszi át.`);

        let newHostPlayerId = null;
        if (room.hostSocketId === socket.id || leftPlayer.isHost) {
          const nextHost = room.players.find(p => !p.isBot && p.socketId);
          if (nextHost) {
            nextHost.isHost = true;
            room.hostSocketId = nextHost.socketId;
            newHostPlayerId = nextHost.id;
            console.log(`[Új Szobagazda Kijelölve] ${nextHost.name} (${nextHost.id}) lett az új szobagazda a(z) ${roomCode} szobában!`);
          } else {
            console.log(`[Szoba Lezárva] Minden élő játékos kilépett a játékból: ${roomCode}`);
            rooms.delete(roomCode);
            return;
          }
        }

        io.to(roomCode).emit('player_disconnected', {
          playerId: leftPlayer.id,
          playerName: leftPlayer.name,
          newHostPlayerId: newHostPlayerId
        });
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🏰 Szabolcsfoglaló szerver fut a http://localhost:${PORT} címen!`);
  console.log(`🌐 Render.com környezetben automatikusan készen áll a 3 fős multiplayer szobák kiszolgálására.`);
});
