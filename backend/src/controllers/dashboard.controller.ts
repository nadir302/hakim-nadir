import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';

export class DashboardController {
  async getAdminStats(req: Request, res: Response, next: NextFunction) {
    try { const stats = await dashboardService.getAdminStats(); res.json(stats); }
    catch (error) { next(error); }
  }

  async getDriverStats(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await (await import('../config/database')).default.driver.findUnique({ where: { userId: req.user!.userId } });
      if (!driver) return res.status(404).json({ message: 'Driver profile not found' });
      const stats = await dashboardService.getDriverStats(driver.id);
      res.json(stats);
    } catch (error) { next(error); }
  }

  async getParticipantStats(req: Request, res: Response, next: NextFunction) {
    try { const stats = await dashboardService.getParticipantStats(req.user!.userId); res.json(stats); }
    catch (error) { next(error); }
  }
}

export const dashboardController = new DashboardController();
