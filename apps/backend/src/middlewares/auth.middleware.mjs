import jsonwebtoken from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
    const { permission } = req.headers;
    if (!permission) {
        return res.status(401).send({ message: "Token não encontrado" });
    }

    const [, token] = permission.split(' ');

    try {
        const jwt = jsonwebtoken.verify(token, process.env.JWT_SECRET);

        req.logged_user = jwt;

        next();
    } catch (error) {
        // console.log(error)
        return res.status(404).send({ message: "Token inválido" });
    }
}