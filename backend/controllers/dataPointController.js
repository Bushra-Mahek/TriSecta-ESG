import { dataPointService } from "../services/dataPointService.js";

export const createDataPoint = async (req, res, next) => {
    try {
        const result =
            await dataPointService.createDataPoint(
                req.body,
                req.user,
                req.ip
            );

        return res.status(201).json({
            message: "Data point created successfully",
            dataPoint: result
        });
    }
    catch (err) {
        next(err);
    }
};

export const getDataPoint = async (req,res,next) =>{
    try{
        const id = req.params.id;
        const result = await dataPointService.getDataPoint(id,req.user);
        
        return res.status(200).json({
            dataPoint: result
        });
    }

    catch(err){
        next(err);
    }
}

export const getDataPointsByDisclosure = async (req, res, next) => {
    try {
        const result =
            await dataPointService.getDataPointsByDisclosure(
                req.params.disclosureId,
                req.user
            );

        return res.status(200).json({
            dataPoints: result
        });
    }
    catch (err) {
        next(err);
    }
};

export const updateDataPoint = async (req, res, next) => {
    try {

        const result =
            await dataPointService.updateDataPoint(
                req.params.id,
                req.body,
                req.user,
                req.ip
            );

        return res.status(200).json({
            message: "Data point updated successfully",
            dataPoint: result
        });

    } catch (err) {
        next(err);
    }
};