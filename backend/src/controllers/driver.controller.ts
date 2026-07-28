import { Request, Response, NextFunction } from 'express';
import { driverService } from '../services/driver.service';

export class DriverController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try { const result = await driverService.findAll(req.query as any); res.json(result); }
    catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try { const driver = await driverService.findById(req.params.id); res.json(driver); }
    catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try { const driver = await driverService.create(req.body); res.status(201).json(driver); }
    catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try { const driver = await driverService.update(req.params.id, req.body); res.json(driver); }
    catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try { await driverService.delete(req.params.id); res.json({ message: 'Driver deleted successfully' }); }
    catch (error) { next(error); }
  }

  async getTodayTrips(req: Request, res: Response, next: NextFunction) {
    try { const trips = await driverService.getTodayTrips(req.params.id); res.json(trips); }
    catch (error) { next(error); }
  }
}

export const driverController = new DriverController();
