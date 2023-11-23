import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (db, email, password) => {
  let userColl = db.collection("users");
    const user = await userColl.findOne({ email });
    if (!user) throw "Email ou senha incorretos";

    // Verifica se a senha está correta
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );
    if (!passwordMatch) throw "Email ou senha incorretos";

    // Gera um token JWT para o usuário
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    return { userToken: token, ...user };
}
