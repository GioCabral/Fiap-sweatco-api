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

router.post("/activity", authMiddleware, async (req, res) => {
  try {
    const db = req.connect;
    const activityColl = db.collection("activities");
    const activities = await activityColl
      .find({ user: new ObjectId(req.userId) })
      .toArray();
    const sportsColl = db.collection("sports");
    const sports = await sportsColl
      .find({ _id: { $in: activities.map((activity) => activity.sport) } })
      .toArray();

    const act = activities.map((activity) => {
      const sport = sports.find((sport) => sport._id.equals(activity.sport));
      return {
        ...activity,
        name: sport.name,
        description: `Praticou ${sport.name} por ${(activity.time / 60).toFixed(2)} minutos`,
      };
    });

    res.status(200).send(act);
  } catch (err) {
    res.status(500).send({ message: err });
  }
});

export default router;
