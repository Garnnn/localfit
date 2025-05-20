// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://localfit.store", // Only allow your production frontend
    methods: ["GET", "POST"]
  }
});

// Replace with your PHP API endpoint
const PHP_API_URL = 'https://api.localfit.store/ecomm_api/services/MessageService.php';

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // On connect, fetch messages from PHP API
  socket.on('fetch-messages', async (data) => {
    try {
      // data: { user1, user2 }
      const response = await axios.get(PHP_API_URL, {
        params: {
          user1: data.user1,
          user2: data.user2
        }
      });
      socket.emit('all-messages', response.data);
    } catch (err) {
      socket.emit('error', 'Failed to fetch messages');
    }
  });

  // Listen for new messages
  socket.on('send-message', async (msg) => {
    // Save message to PHP API
    try {
      await axios.post(PHP_API_URL, msg);
      io.emit('receive-message', msg); // Broadcast to all clients
    } catch (err) {
      socket.emit('error', 'Failed to save message');
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(3000, () => {
  console.log('Socket.IO server running on port 3000');
});