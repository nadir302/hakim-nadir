import { Request, Response, NextFunction } from 'express';
import { tripService } from '../services/trip.service';

export class TripController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try { const result = await tripService.findAll(req.query as any); res.json(result); }
    catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try { const trip = await tripService.findById(req.params.id); res.json(trip); }
    catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body };
      if (typeof data.date === 'string') data.date = new Date(data.date);
      if (data.date && typeof data.departureTime === 'string') {
        data.departureTime = new Date(`${data.date.toISOString().split('T')[0]}T${data.departureTime}:00`);
      }
      const trip = await tripService.create(data);
      res.status(201).json(trip);
    }
    catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body };
      if (typeof data.date === 'string') data.date = new Date(data.date);
      if (data.date && typeof data.departureTime === 'string') {
        data.departureTime = new Date(`${data.date.toISOString().split('T')[0]}T${data.departureTime}:00`);
      }
      const trip = await tripService.update(req.params.id, data);
      res.json(trip);
    }
    catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try { await tripService.delete(req.params.id); res.json({ message: 'Trip deleted successfully' }); }
    catch (error) { next(error); }
  }

  async startTrip(req: Request, res: Response, next: NextFunction) {
    try { const trip = await tripService.startTrip(req.params.id); res.json(trip); }
    catch (error) { next(error); }
  }

  async completeTrip(req: Request, res: Response, next: NextFunction) {
    try { const trip = await tripService.completeTrip(req.params.id); res.json(trip); }
    catch (error) { next(error); }
  }

  async delayTrip(req: Request, res: Response, next: NextFunction) {
    try { const result = await tripService.delayTrip(req.params.id, req.body.delayMinutes); res.json(result); }
    catch (error) { next(error); }
  }

  async getActiveTrips(req: Request, res: Response, next: NextFunction) {
    try { const trips = await tripService.getActiveTrips(); res.json(trips); }
    catch (error) { next(error); }
  }
}

export const tripController = new TripController();
