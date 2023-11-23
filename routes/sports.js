import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";
dotenv.config();

// Middleware para verificar o token JWT nas rotas protegidas
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.usertoken;
    if (!authHeader) throw "Token não encontrado";
    const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).send({ message: err });
  }
};

// Rota para listar todos os esportes
router.post("/", authMiddleware, async (req, res) => {
  try {
    const db = req.connect;
    const sports = await db.collection("sports").find().toArray();
    res.send(sports);
  } catch (err) {
    res.status(500).send({ message: err });
  }
});


router.post("/activity", authMiddleware, async (req, res) => {
  try {
    const {id, time} = req.body;
    const db = req.connect;
    const userColl = db.collection("users");
    const activityColl = db.collection("activities");
    const user = await userColl.findOne({ _id: new ObjectId(req.userId) });
    const sport = await db.collection("sports").findOne({_id: new ObjectId(id)});
    let score = sport.score * time;
    await activityColl.insertOne({sport: new ObjectId(id), score: score, user: user._id, time});
    res.status(201).send('Pontuação adicionada com sucesso!');
  } catch (err) {
    res.status(500).send({ message: err });
  }
});



export default router;
