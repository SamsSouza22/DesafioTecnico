import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { privateRouter, publicRouter } from './routes/routers.mjs';
import './routes/user.router.mjs';

const server = express();

server.use(helmet());
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