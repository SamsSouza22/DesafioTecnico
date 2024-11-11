import prismaClient from '../utils/prismaClient.mjs';
import { z } from 'zod';

const clubSchema = z.object({
    name: z.string().min(1, "O nome do clube é obrigatório"),
    description: z.string().optional(),
    creatorId: z.string(),
});

class ClubController {
    async createClub(req, res) {
        const clubData = clubSchema.parse(req.body);

        try {
            const newClub = await prismaClient.club.create({
                data: clubData,
            });
            res.status(201).send(newClub);
        } catch (error) {
            res.status(500).send({ message: "Erro ao criar clube" });
        }
    }
    async getClubs(req, res) {
        const { name, page = 1, pageSize = 5 } = req.query;

        if (!name) {
            return res.status(400).send({ message: "Por favor, insira um termo de pesquisa." });
        }

        try {
            const skip = (parseInt(page) - 1) * parseInt(pageSize);
            const take = parseInt(pageSize);

            const clubs = await prismaClient.club.findMany({
                where: {
                    name: { contains: name }
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    creatorId: true,
                    createdAt: true,
                },
                skip,
                take,
            });

            const totalClubs = await prismaClient.club.count({
                where: {
                    name: { contains: name }
                }
            });

            const totalPages = Math.ceil(totalClubs / take);

            res.send({
                clubs,
                currentPage: page,
                totalPages,
                pageSize: take,
                totalClubs,
            });
        } catch (error) {
            res.status(500).send({ message: "Erro ao listar clubes" });
        }
    }

    async getClubById(req, res) {
        const { id } = req.params;

        try {
            const club = await prismaClient.club.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    creatorId: true,
                    createdAt: true,
                },
            });

            if (!club) {
                return res.status(404).send({ message: "Clube não encontrado" });
            }
            res.send(club);
        } catch (error) {
            res.status(500).send({ message: "Erro ao buscar o clube" });
        }
    }
    async updateClub(req, res) {
        const { id } = req.params;
        const { creatorId } = req.body;

        try {
            const club = await prismaClient.club.findUnique({ where: { id } });

            if (!club) {
                return res.status(404).send({ message: "Clube não encontrado" });
            }

            if (club.creatorId !== creatorId) {
                return res.status(403).send({ message: "Acesso negado: somente o criador pode modificar o clube." });
            }

            const updatedData = clubSchema.parse(req.body);
            const updatedClub = await prismaClient.club.update({
                where: { id },
                data: updatedData,
            });

            res.send(updatedClub);
        } catch (error) {
            res.status(500).send({ message: "Erro ao atualizar clube" });
        }
    }

    async deleteClub(req, res) {
        const { id } = req.params;
        const { creatorId } = req.body;

        try {
            const club = await prismaClient.club.findUnique({ where: { id } });

            if (!club) {
                return res.status(404).send({ message: "Clube não encontrado" });
            }

            if (club.creatorId !== creatorId) {
                return res.status(403).send({ message: "Acesso negado: somente o criador pode excluir o clube." });
            }

            await prismaClient.club.delete({ where: { id } });
            res.send({ message: "Clube apagado com sucesso" });
        } catch (error) {
            res.status(500).send({ message: "Erro ao remover o clube" });
        }
    }
}

export default ClubController;