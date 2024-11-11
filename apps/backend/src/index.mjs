import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

import { privateRouter, publicRouter } from './routes/routers.mjs';
import './routes/user.router.mjs';
import './routes/club.router.mjs';

const server = express();
const accessLogStream = fs.createWriteStream(path.join(process.cwd(), 'logs', 'access.log'), { flags: 'a' });

server.use(helmet());
server.use(morgan('combined', { stream: accessLogStream }));
server.use(morgan('dev'));
server.use(express.json());
server.use(publicRouter);
server.use(privateRouter);

server.use('*', (req, res) => {
    res.status(404).send({ message: 'Rota não encontrada' });
});

server.listen(5000, () => {
    console.log("Estou rodando na porta 5000");
});