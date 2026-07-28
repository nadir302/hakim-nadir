import { Request, Response, NextFunction } from 'express';
import { routeService } from '../services/route.service';

export class RouteController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try { const result = await routeService.findAll(req.query as any); res.json(result); }
    catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try { const route = await routeService.findById(req.params.id); res.json(route); }
    catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try { const route = await routeService.create(req.body); res.status(201).json(route); }
    catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try { const route = await routeService.update(req.params.id, req.body); res.json(route); }
    catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try { await routeService.delete(req.params.id); res.json({ message: 'Route deleted successfully' }); }
    catch (error) { next(error); }
  }
}

export const routeController = new RouteController();
