import cors from "cors";
import express from "express";
import env from "./config";
import { ProjectService } from "./services/ProjectService";

const api = express();
const { PORT } = env;

function start(port: number) {
  console.log(`API inicializada na porta ${port} 🚀`);
}

api.use(cors());

api.use(express.json());

api.get("/projects", async (req, res) => {
  const service: ProjectService = ProjectService.getInstance();
  const projects = await service.getAll();
  const { name } = req.body || req.query || req.params;

  if (name) {
    const project = projects.find((item) => item.url.includes(name));
    if (project) { return res.json(project); }
    return res.status(404).json({ message: "Project not found" });
  } else {
    res.status(200).json(projects);
  }
});

api.listen(PORT, () => start(PORT));

export default api;
