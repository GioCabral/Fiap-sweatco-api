import express from 'express'
import mongoConnect from './config/db.js'
const app = express();
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
const mongoConnection = mongoConnect();

// Configura o middleware do Express para receber JSON nas requisições
app.use(express.json());

// Habilita o CORS
app.use(cors());

app.use(async (req, res, next) => {
  req.connect = await mongoConnection;
  next();
})

app.use(function (req, res, next) {
  for (var key in req.query) {
    req.query[key.toLowerCase()] = req.query[key];
  };

  for (var key in req.headers) {
    req.headers[key.toLowerCase()] = req.headers[key];
  }
  next();
});

// Rota inicial
app.get('/', (req, res) => {
  res.send('API funcionando!');
});

// Rotas para usuários
import usersRoutes from './routes/users.js';
app.use('/api/users', usersRoutes);

// Rotas para esportes
import sportsRoutes from './routes/sports.js';
app.use('/api/sports', sportsRoutes);

// Rotas para atividades
import activitiesRoutes from './routes/activities.js';
app.use('/api/activities', activitiesRoutes);

import rankingRoutes from './routes/ranking.js';
app.use('/api/ranking', rankingRoutes);

// Inicia o servidor
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
