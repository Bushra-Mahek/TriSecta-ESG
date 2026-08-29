import { verificationService }
    from "../services/verificationService.js";


export const verifyDisclosure = async (
    req,
    res,
    next
) => {

    try {

        const result =
            await verificationService.verifyDisclosure(
                req.params.id,
                req.user,
                req.body.notes
            );

        return res.status(200).json({
            message:
                "Disclosure verified successfully",
            result
        });

    } catch (err) {

        next(err);

    }
};


export const rejectDisclosure = async (
    req,
    res,
    next
) => {

    try {

        const result =
            await verificationService.rejectDisclosure(
                req.params.id,
                req.user,
                req.body.notes
            );

        return res.status(200).json({
            message:
                "Disclosure rejected successfully",
            result
        });

    } catch (err) {

        next(err);

    }
};