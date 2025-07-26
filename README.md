# 🔥 FireWeb

Servidor híbrido que une **sinalização WebRTC** com **notificações push via Firebase**, ideal para aplicações em tempo real como chamadas de vídeo e alertas personalizados.

---

## 🚀 Visão Geral

FireWeb combina dois sistemas:

- **WebRTC Sinalizador**: conecta usuários via WebSocket para troca de ofertas, respostas e candidatos ICE.
- **Firebase Notificador**: envia notificações push para dispositivos registrados usando Firebase Cloud Messaging (FCM).

Tudo isso rodando em um único servidor Express com Socket.IO e Firebase Admin SDK.

---

## 🧩 Funcionalidades

### 🔹 WebRTC (Socket.IO)
- `register`: registra o usuário com UUID
- `call`: envia oferta de chamada
- `answer`: envia resposta da chamada
- `ice-candidate`: troca candidatos ICE
- `disconnect`: remove usuário do mapa

### 🔹 Firebase (REST API)
- `POST /register-token`: registra token FCM para um ID
- `POST /notify-id`: envia notificação para o ID registrado

---

## 🛠️ Instalação

```bash
git clone https://github.com/seu-usuario/FireWeb.git
cd FireWeb
npm install
