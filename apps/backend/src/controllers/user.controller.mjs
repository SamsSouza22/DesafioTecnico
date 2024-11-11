import { z } from 'zod';
import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import prismaClient from '../utils/prismaClient.mjs';

const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const userSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(1),
});

class UserController {

    async deleteUser(req, res) {
        const { id } = req.params;

        try {
            await prismaClient.user.delete({ where: { id } });
            res.send({ message: "Usário removido" });
        } catch (error) {
            res.status(404).send({ message: "Usuário inexistente" });
        }
    }

    async getOneUser(req, res) {
        const { id } = req.params;

        const user = await prismaClient.user.findUnique({ where: { id } });

        if (!user) {
            return res.status(404).send({ message: "Usuário não encontrado" });
        }
        delete user.password;
        res.send(user);
    }

    async searchUsers(req, res) {
        const { name, page = 1, pageSize = 5 } = req.query;
        console.log(name);

        if (!name) {
            return res.status(400).send({ message: "Por favor, insira um termo de pesquisa." });
        }

        try {
            const skip = (parseInt(page) - 1) * parseInt(pageSize);
            const take = parseInt(pageSize);

            const users = await prismaClient.user.findMany({
                where: {
                    name: { contains: name }
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                },
                skip,
                take,
            });

            const totalUsers = await prismaClient.user.count({
                where: {
                    name: { contains: name }
                }
            });

            const totalPages = Math.ceil(totalUsers / take);

            res.send({
                users,
                currentPage: page,
                totalPages,
                pageSize: take,
                totalUsers,
            });
        } catch (error) {
            res.status(500).send({ message: "Erro ao buscar usuários" });
        }
    }

    async createUser(req, res) {
        const { email } = req.body;

        const user = userSchema.parse(req.body);

        const userExist = await prismaClient.user.findUnique({ where: { email } });

        if (userExist) {
            return res.status(400).send({ message: "Email já registrado." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);

        const newUser = await prismaClient.user.create({
            data: { ...user, password: hashedPassword },
        });

        delete newUser.password;

        res.send(newUser);
    }

    async updateUser(req, res) {
        const { id } = req.params;

        let user = await prismaClient.user.findUnique({ where: { id } });

        if (!user) {
            return res.status(404).send({ message: "Usuário não encontrado" });
        }
        user = await prismaClient.user.update({
            data: req.body,
            where: { id },
        });
        delete user.password;
        res.send(user);
    }

    async authUser(req, res) {
        const { email, password } = req.body;

        authSchema.parse({ email, password });

        const user = await prismaClient.user.findFirst({ where: { email } });

        if (!user) {
            return res.status(404).send({ message: "Usuário não encontrado" });
        }

        const passwordValid = await bcrypt.compare(password, user.password);

        if (!passwordValid) {
            return res.status(401).send({ message: "Senha incorreta" });
        }

        delete user.password;

        const token = jsonwebtoken.sign(user, process.env.JWT_SECRET);

        res.send({ token });
    }
}

export default UserController;
