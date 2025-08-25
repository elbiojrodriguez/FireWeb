const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 🔐 Inicializa o Firebase com chave vinda de variável de ambiente
const firebaseKey = process.env.FIREBASE_KEY_JSON;

if (!firebaseKey) {
  console.error('❌ Variável FIREBASE_KEY_JSON não definida.');
  process.exit(1);
}

const serviceAccount = JSON.parse(firebaseKey);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 🚨 Rota padrão para notificação
app.post('/notify', async (req, res) => {
  const { token, nome } = req.body;

  if (!token || !nome) {
    return res.status(400).json({ error: 'Token e nome são obrigatórios' });
  }

  const message = {
    token: token,
    notification: {
      title: 'Lemur Notificador',
      body: `🔔 ${nome} está chamando você!`
    },
    data: {
      nome: nome
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log(`📨 Notificação enviada para ${nome}:`, response);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao enviar notificação:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🚀 Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
