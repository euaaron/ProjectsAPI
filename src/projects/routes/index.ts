import express, { Router } from 'express';
import { ProjectService } from '../service';

export function ProjectsRouter(router: Router = express.Router()): Router {
  /**
   * @openapi
   * /projects:
   *   get:
   *     summary: Get all projects or a specific project
   *     tags:
   *       - ProjectService
   *     parameters:
   *       - name: name
   *         in: body
   *         description: Name of the project to get
   *         required: false
   *         default: ""
   *     responses:
   *       404:
   *         description: Could not find a project with the provided name
   *         content:
   *           application/json:
   *              schema:
   *                $ref: '#/components/schemas/ApiError'
   *              example:
   *                message: Could not find any GIF
   *                status: error
   *       200:
   *         description: Returns an array of Projects or a specif one
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                  $ref: '#/components/schemas/Gif'
   */
  router.get('/', async (req, res) => {
    const service = ProjectService.getInstance();
    const projects = await service.getAll();
    const { name } = req.query || req.body || req.params;    

    if (name) {
      const project = projects.find((item) => item.url.includes(String(name)));
      if (project) {
        return res.status(200).json(project);
      }
      return res.status(404).json({ message: "Project not found" });
    } else {
      res.status(200).json(projects);
    }
  });

  return router;
}
