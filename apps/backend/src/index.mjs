import express from 'express'

const server = express();

server.use(helmet());
server.use(morgan('dev'));
server.use(express.json());
server.listen(5000, () => {
    console.log("Estou rodando na porta 5000");
});