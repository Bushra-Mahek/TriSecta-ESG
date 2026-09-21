import { dashboardService } from "../services/dashboardService.js";

export const dashboardController = {

    async getDashboard(req, res, next) {

        try {

            const dashboard =
                await dashboardService.getDashboard(req.user);

            return res.status(200).json({
                success: true,
                dashboard
            });

        } catch (error) {
            next(error);
        }
    }

};