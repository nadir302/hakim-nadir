import { Request, Response, NextFunction } from 'express';
import { vehicleService } from '../services/vehicle.service';

export class VehicleController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try { const result = await vehicleService.findAll(req.query as any); res.json(result); }
    catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try { const vehicle = await vehicleService.findById(req.params.id); res.json(vehicle); }
    catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try { const vehicle = await vehicleService.create(req.body); res.status(201).json(vehicle); }
    catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try { const vehicle = await vehicleService.update(req.params.id, req.body); res.json(vehicle); }
    catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try { await vehicleService.delete(req.params.id); res.json({ message: 'Vehicle deleted successfully' }); }
    catch (error) { next(error); }
  }

  async getAvailable(req: Request, res: Response, next: NextFunction) {
    try { const vehicles = await vehicleService.getAvailable(); res.json(vehicles); }
    catch (error) { next(error); }
  }
}

export const vehicleController = new VehicleController();
