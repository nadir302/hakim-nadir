import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/report.service';

export class ReportController {
  async getDaily(req: Request, res: Response, next: NextFunction) {
    try { const report = await reportService.getDailyReport(req.query.date as string); res.json(report); }
    catch (error) { next(error); }
  }

  async getWeekly(req: Request, res: Response, next: NextFunction) {
    try { const report = await reportService.getWeeklyReport(); res.json(report); }
    catch (error) { next(error); }
  }

  async getMonthly(req: Request, res: Response, next: NextFunction) {
    try { const report = await reportService.getMonthlyReport(); res.json(report); }
    catch (error) { next(error); }
  }

  async getRouteAnalytics(req: Request, res: Response, next: NextFunction) {
    try { const analytics = await reportService.getRouteAnalytics(); res.json(analytics); }
    catch (error) { next(error); }
  }

  async getTripsPerDay(req: Request, res: Response, next: NextFunction) {
    try { const data = await reportService.getTripsPerDay(Number(req.query.days) || 30); res.json(data); }
    catch (error) { next(error); }
  }

  async getDriverPerformance(req: Request, res: Response, next: NextFunction) {
    try { const data = await reportService.getDriverPerformance(); res.json(data); }
    catch (error) { next(error); }
  }

  async getVehicleUsage(req: Request, res: Response, next: NextFunction) {
    try { const data = await reportService.getVehicleUsage(); res.json(data); }
    catch (error) { next(error); }
  }

  async getOccupancyStats(req: Request, res: Response, next: NextFunction) {
    try { const data = await reportService.getOccupancyStats(); res.json(data); }
    catch (error) { next(error); }
  }
}

export const reportController = new ReportController();
