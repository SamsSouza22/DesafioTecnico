import UserController from "../controllers/user.controller.mjs";
import { publicRouter, privateRouter } from "./routers.mjs";

const userController = new UserController();

publicRouter.post('/api/auth', (req, res) =>
    userController.authUser(req, res)
);

privateRouter.get('/api/user', (req, res) =>
    userController.searchUsers(req, res)
);

privateRouter.get('/api/user/:id', (req, res) =>
    userController.getOneUser(req, res)
);

publicRouter.post('/api/user', (req, res) =>
    userController.createUser(req, res)
);

privateRouter.put('/api/user/:id', (req, res) =>
    userController.updateUser(req, res)
);

privateRouter.delete('/api/user/:id', (req, res) =>
    userController.deleteUser(req, res)
);