import jsonwebtoken from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).send({ message: "Token não encontrado" });
    }

    const [, token] = authorization.split(' ');

    try {
        const jwt = jsonwebtoken.verify(token, process.env.JWT_SECRET);

        req.logged_user = jwt;

        next();
    } catch (error) {
        return res.status(404).send({ message: "Token inválido" });
    }
}