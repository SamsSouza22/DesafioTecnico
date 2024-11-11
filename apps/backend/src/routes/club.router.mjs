import ClubController from "../controllers/club.controller.mjs";
import { privateRouter } from "./routers.mjs";

const clubController = new ClubController();

privateRouter.post('/api/club', (req, res) =>
    clubController.createClub(req, res)
);

privateRouter.get('/api/club', (req, res) =>
    clubController.getClubs(req, res)
);

privateRouter.get('/api/club/:id', (req, res) =>
    clubController.getClubById(req, res)
);

privateRouter.put('/api/club/:id', (req, res) =>
    clubController.updateClub(req, res)
);

privateRouter.delete('/api/club/:id', (req, res) =>
    clubController.deleteClub(req, res)
);
