import prismaClient from '../utils/prismaClient.mjs';
import { z } from 'zod';

const clubSchema = z.object({
    name: z.string().min(1, "O nome do clube é obrigatório"),
    description: z.string().optional(),
    creatorId: z.string(),
});

const bookSchema = z.object({
    title: z.string().min(1, { message: "Título é obrigatório" }),
    autor: z.string().min(1, { message: "Autor é obrigatório" }),
    yearPublication: z.number().optional(),
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

    // Funções para gerenciamento dos livros de um clube
    async addBookToClub(req, res) {
        const { id } = req.params;
        const { creatorId, title, autor, yearPublication } = req.body;

        try {
            const club = await prismaClient.club.findUnique({ where: { id: id } });
            if (!club) {
                return res.status(404).send({ message: "Clube não encontrado." });
            }

            if (club.creatorId !== creatorId) {
                return res.status(403).send({ message: "Apenas o criador do clube pode adicionar livros." });
            }

            const validatedBook = bookSchema.parse({ title, autor, yearPublication });

            // Verifica se um livro com mesmo título já existe na tabela book
            let book = await prismaClient.book.findFirst({
                where: { title: validatedBook.title, autor: validatedBook.autor }
            });
            if (!book) {
                // Se o livro não existir, cria um novo livro
                book = await prismaClient.book.create({
                    data: {
                        title: validatedBook.title,
                        autor: validatedBook.autor,
                        yearPublication: validatedBook.yearPublication,
                    },
                });
            }

            // Verifica se o livro já está no clube
            const existingAssociation = await prismaClient.clubBook.findUnique({
                where: {
                    clubId_bookId: {
                        clubId: id,
                        bookId: book.id,
                    }
                },
            });

            if (existingAssociation) {
                return res.status(400).send({ message: "O livro já está adicionado ao clube." });
            }

            // Adiciona o livro ao clube (usando tabela intermediária ClubBook)
            await prismaClient.clubBook.create({
                data: {
                    clubId: id,
                    bookId: book.id  // Garante que o livro seja associado ao clube
                }
            });

            // Retorna todos os dados dos livros associados ao clube
            const books = await prismaClient.clubBook.findMany({
                where: { clubId: id },
                select: {
                    book: true,
                },
            });

            res.send({ message: "Livro adicionado ao clube.", books });
        } catch (error) {
            res.status(500).send({ message: "Erro ao adicionar livro ao clube." });
        }
    }

    async updateBookInClub(req, res) {
        const { clubId, bookId } = req.params; 
        const { creatorId, title, autor, yearPublication } = req.body; 
    
        try {
            // Verifica se o clube existe
            const club = await prismaClient.club.findUnique({ where: { id: clubId } });
            if (!club) {
                return res.status(404).send({ message: "Clube não encontrado." });
            }
    
            // Verifica se o usuário é o criador do clube
            if (club.creatorId !== creatorId) {
                return res.status(403).send({ message: "Apenas o criador do clube pode atualizar os livros." });
            }
    
            // Verifica se o livro está associado ao clube
            const clubBook = await prismaClient.clubBook.findUnique({
                where: {
                    clubId_bookId: {
                        clubId: clubId,
                        bookId: bookId,
                    }
                },
            });
            if (!clubBook) {
                return res.status(404).send({ message: "Livro não encontrado no clube." });
            }
    
            // Valida e atualiza os dados do livro
            const validatedBook = bookSchema.parse({ title, autor, yearPublication });
            const updatedBook = await prismaClient.book.update({
                where: { id: bookId },
                data: {
                    title: validatedBook.title,
                    autor: validatedBook.autor,
                    yearPublication: validatedBook.yearPublication,
                }
            });
    
            res.send({ message: "Livro atualizado com sucesso.", updatedBook });
        } catch (error) {
            res.status(500).send({ message: "Erro ao atualizar o livro no clube." });
        }
    }

    async removeBookFromClub(req, res) {
        const { clubId, bookId } = req.params;
        const { creatorId } = req.body; 
    
        try {
            // Verifica se o clube existe
            const club = await prismaClient.club.findUnique({ where: { id: clubId } });
            if (!club) {
                return res.status(404).send({ message: "Clube não encontrado." });
            }
    
            // Verifica se o usuário é o criador do clube
            if (club.creatorId !== creatorId) {
                return res.status(403).send({ message: "Apenas o criador do clube pode remover livros." });
            }
    
            // Verifica se a associação entre o livro e o clube existe
            const existingAssociation = await prismaClient.clubBook.findUnique({
                where: {
                    clubId_bookId: {
                        clubId,
                        bookId,
                    }
                },
            });
    
            if (!existingAssociation) {
                return res.status(404).send({ message: "Livro não encontrado na lista do clube." });
            }
    
            // Remove o livro do clube
            await prismaClient.clubBook.delete({
                where: {
                    clubId_bookId: {
                        clubId,
                        bookId,
                    }
                }
            });
    
            res.send({ message: "Livro removido do clube com sucesso." });
        } catch (error) {
            res.status(500).send({ message: "Erro ao remover livro do clube." });
        }
    }

    // Funções para avaliações de livros do clube
    async addOrUpdateOpinion(req, res) {
        const { clubId, bookId } = req.params;
        const { userId, text, rating } = req.body;
    
        try {
            // Verifica se já existe uma avaliação para o livro e clube do usuário
            let opinion = await prismaClient.opinion.findUnique({
                where: {
                    userId_clubId_bookId: {
                        userId,
                        clubId,
                        bookId
                    }
                }
            });
    
            if (opinion) {
                // Se a avaliação já existir, atualiza os dados
                opinion = await prismaClient.opinion.update({
                    where: {
                        id: opinion.id
                    },
                    data: {
                        text,
                        rating
                    }
                });
                res.send({ message: "Avaliação atualizada.", opinion });
            } else {
                // Se a avaliação não existir, cria uma nova
                opinion = await prismaClient.opinion.create({
                    data: {
                        userId,
                        clubId,
                        bookId,
                        text,
                        rating
                    }
                });
                res.send({ message: "Avaliação adicionada.", opinion });
            }
        } catch (error) {
            res.status(500).send({ message: "Erro ao adicionar ou atualizar avaliação." });
        }
    }

    async deleteOpinion(req, res) {
        const { clubId, bookId } = req.params;
        const { userId } = req.body;
        try {
            // Verifica se a avaliação existe
            const opinion = await prismaClient.opinion.findUnique({
                where: {
                    userId_clubId_bookId: {
                        userId,
                        clubId,
                        bookId
                    }
                }
            });
    
            // Se a avaliação não existir, retorna erro
            if (!opinion) {
                return res.status(404).send({ message: "Avaliação não encontrada." });
            }
    
            // Verifica se o usuário tem permissão para excluir a avaliação 
            // (usuário que fez a opinião ou criador do clube)
            const club = await prismaClient.club.findUnique({ where: { id: clubId } });
            if (club.creatorId !== userId && opinion.userId !== userId) {
                return res.status(403).send({ message: "Você não tem permissão para excluir esta avaliação." });
            }
    
            // Exclui a avaliação
            await prismaClient.opinion.delete({
                where: {
                    id: opinion.id
                }
            });
    
            res.send({ message: "Avaliação excluída com sucesso." });
        } catch (error) {
            res.status(500).send({ message: "Erro ao excluir avaliação." });
        }
    }

}

export default ClubController;