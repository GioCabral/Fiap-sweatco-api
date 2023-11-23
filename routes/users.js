import express from "express";
const router = express.Router();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";
import { login } from "../utils/login.js";
dotenv.config();

// Rota para criar um novo usuário
router.post("/", async (req, res) => {
  try {
    // Verifica se já existe um usuário com o mesmo email
    let db = req.connect;
    let userColl = db.collection("users");
    const existingUser = await userColl.findOne({ email: req.body.email });
    if (existingUser) throw "Email já cadastrado";
    if (!req.body.email.match(/[^\s@]+@[^\s@]+\.[^\s@]+/gi))
      throw "Email inválido";
    if (req.body.password.length < 6)
      throw "Senha deve ter no mínimo 6 caracteres";
    if (!req.body.name || req.body.name < 3) throw "Você precisa informar um nome válido";
    // Criptografa a senha do usuário
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Cria um novo usuário no banco de dados
    const user = {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    };
    await userColl.insertOne(user);

    let logged = await login(db, req.body.email, req.body.password);

    res.status(201).send(logged);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Rota para fazer login
router.post("/login", async (req, res) => {
  try {
    // Procura o usuário no banco de dados pelo email
    let db = req.connect;
    let userColl = db.collection("users");
    const user = await userColl.findOne({ email: req.body.email });
    if (!user) throw "Email ou senha incorretos";

    // Verifica se a senha está correta
    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!passwordMatch) throw "Email ou senha incorretos";

    // Gera um token JWT para o usuário
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).send({ userToken: token, ...user });
  } catch (err) {
    res.status(500).send({ message: err });
  }
});

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

router.post("/session", authMiddleware, async (req, res) => {
  try {
    let db = req.connect;
    let userColl = db.collection("users");
    const user = await userColl.findOne({ _id: new ObjectId(req.userId) });
    res.status(200).send({ userToken: req.headers.usertoken, ...user });
  } catch (err) {
    res.status(500).send({ message: err });
  }
})

router.get("/user", authMiddleware ,async (req, res) => {
  try {
    // Procura o usuário pelo ID armazenado no token JWT
    let db = req.connect;
    let userColl = db.collection("users");

    const user = await userColl.findOne({ _id: new ObjectId(req.userId) });

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});



// Rota protegida
router.get("/protected", authMiddleware, (req, res) => {
  res.send({ message: "Rota protegida acessada com sucesso" });
});

export default router;
