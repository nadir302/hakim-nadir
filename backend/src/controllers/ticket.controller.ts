import { Request, Response, NextFunction } from 'express';
import { ticketService } from '../services/ticket.service';

export class TicketController {
  async getTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const reservationId = req.params.id;
      const userId = req.user!.userId;
      const role = req.user!.role;
      const ticket = await ticketService.getTicket(reservationId, userId, role);
      res.json(ticket);
    } catch (error) { next(error); }
  }
}

export const ticketController = new TicketController();