import { Request, Response, NextFunction } from 'express';
import { eventService } from '../services/event.service';

function combineDateTime(date: string, time: string) {
  const timePart = time.includes('T') ? time.split('T')[1] : time;
  return new Date(`${date}T${timePart}:00`);
}

export class EventController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await eventService.findAll(req.query as any);
      res.json(result);
    } catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await eventService.findById(req.params.id);
      res.json(event);
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body, createdById: req.user!.userId };
      if (typeof data.latitude === 'string') data.latitude = data.latitude ? Number(data.latitude) : undefined;
      if (typeof data.longitude === 'string') data.longitude = data.longitude ? Number(data.longitude) : undefined;
      if (typeof data.capacity === 'string') data.capacity = Number(data.capacity);
      if (typeof data.date === 'string') data.date = new Date(data.date);
      if (data.date && data.startTime) data.startTime = combineDateTime(data.date.toISOString().split('T')[0], data.startTime);
      if (data.date && data.endTime) data.endTime = combineDateTime(data.date.toISOString().split('T')[0], data.endTime);
      const event = await eventService.create(data);
      res.status(201).json(event);
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body };
      if (data.latitude !== undefined) data.latitude = data.latitude ? Number(data.latitude) : null;
      if (data.longitude !== undefined) data.longitude = data.longitude ? Number(data.longitude) : null;
      if (data.capacity !== undefined) data.capacity = Number(data.capacity);
      if (data.date) data.date = new Date(data.date);
      if (data.date && data.startTime) data.startTime = combineDateTime(data.date.toISOString().split('T')[0], data.startTime);
      if (data.date && data.endTime) data.endTime = combineDateTime(data.date.toISOString().split('T')[0], data.endTime);
      const event = await eventService.update(req.params.id, data);
      res.json(event);
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await eventService.delete(req.params.id);
      res.json({ message: 'Event deleted successfully' });
    } catch (error) { next(error); }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await eventService.getStats();
      res.json(stats);
    } catch (error) { next(error); }
  }

  async getUpcoming(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await eventService.getUpcoming();
      res.json(events);
    } catch (error) { next(error); }
  }
}

export const eventController = new EventController();
