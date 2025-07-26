const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
const server = http.createServer(app);

// 🔐 Inicializa Firebase Admin com variável de ambiente
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 🔧 Configurações gerais
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🔹 Firebase: armazenamento simples de tokens
const tokenMap = {}; // { id: token }

app.post('/register-token', (req, res) => {
  const { id, token } = req.body;
  if (!id || !token) {
    return res.status(400).json({ error: 'ID e token são obrigatórios' });
  }
  tokenMap[id] = token;
  console.log(`✅ Token registrado para ID ${id}: ${token}`);
  res.json({ success: true });
});

app.post('/notify-id', async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'ID do dispositivo não fornecido' });
  }

  const token = tokenMap[id];
  if (!token) {
    return res.status(404).json({ error: 'Token não encontrado para este ID' });
  }

  const message = {
    token: token,
    notification: {
      title: 'Lemur Notificador',
      body: '⏰ Hora de despertar!'
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('📨 Mensagem enviada:', response);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao enviar:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🔹 WebRTC: sinalização via Socket.IO
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const clients = {}; // { uuid: socket.id }

io.on('connection', socket => {
  console.log(`🟢 Novo socket conectado: ${socket.id}`);

  socket.on('register', uuid => {
    clients[uuid] = socket.id;
    socket.uuid = uuid;
    console.log(`🔖 Registrado: ${uuid} -> ${socket.id}`);
  });

  socket.on('call', ({ to, offer }) => {
    const targetSocketId = clients[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('incomingCall', {
        from: socket.uuid,
        offer
      });
      console.log(`📞 Chamada de ${socket.uuid} para ${to}`);
    } else {
      console.log(`❌ Destinatário ${to} não encontrado`);
    }
  });

  socket.on('answer', ({ to, answer }) => {
    const targetSocketId = clients[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('acceptAnswer', { answer });
      console.log(`✅ Resposta de ${socket.uuid} para ${to}`);
    }
  });

  socket.on('ice-candidate', ({ to, candidate }) => {
    const targetSocketId = clients[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('ice-candidate', candidate);
      console.log(`🧊 ICE candidate de ${socket.uuid} para ${to}`);
    }
  });

  socket.on('disconnect', () => {
    if (socket.uuid) {
      delete clients[socket.uuid];
      console.log(`🔴 Desconectado: ${socket.uuid}`);
    }
  });
});

// ✅ Escuta de porta compatível com Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor FireWeb rodando na porta ${PORT}`);
});
