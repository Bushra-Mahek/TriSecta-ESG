import { disclosureModel } from "../models/disclosureModel.js";
export const disclosureService = {
    async createDisclosure(reportingYear, user) {

    const companyId = user.company_id;
    const submittedBy = user.id;
    const status = "DRAFT";

    return await disclosureModel.createDisclosure(
        companyId,
        reportingYear,
        status,
        submittedBy
    );
    },

    async getDisclosure(id,user){
        const disclosure = await disclosureModel.getDisclosure(id);
        if(!disclosure){
            throw new Error("disclosure not found");
        }

        if(user.role === "COMPANY_USER" && disclosure.company_id  !== user.company_id){
            throw new Error("access denied");
        }
        
        return disclosure;
    },

    async getDisclosures(){
        const ds = await disclosureModel.getDisclosures();
        return ds;
    },

    async updateDisclosure(id,data,user){
         // FIRST fetch the existing disclosure
        const disclosure = await disclosureModel.getDisclosure(id);

        if (!disclosure) {
            throw new Error("Disclosure not found");
        }

        // Company user can only modify their own company's disclosure
        if (
            user.role === "COMPANY_USER" &&
            disclosure.company_id !== user.company_id
        ) {
            throw new Error("Access denied");
        }

        // Only DRAFT can be edited
        if (disclosure.status !== "DRAFT") {
            throw new Error(
                "Only draft disclosures can be updated"
            );
        }

        // NOW perform the update
        const result =
            await disclosureModel.updateDisclosure(id, data);

        return result;

    },

    async deleteDisclosure(id,user){
        
        // FIRST fetch
        const disclosure = await disclosureModel.getDisclosure(id);

        if (!disclosure) {
            throw new Error("Disclosure not found");
        }

        // Ownership check
        if (
            user.role === "COMPANY_USER" &&
            disclosure.company_id !== user.company_id
        ) {
            throw new Error("Access denied");
        }

        // Only draft can be deleted
        if (disclosure.status !== "DRAFT") {
            throw new Error(
                "Only draft disclosures can be deleted"
            );
        }

        // NOW delete
        return await disclosureModel.deleteDisclosure(id);
    },


    async reviseDisclosure(id, user) {

    const disclosure = await disclosureModel.getDisclosure(id);


    if (!disclosure) {
        throw new Error("Disclosure not found");
    }

    if (user.role !== "COMPANY_USER") {
        throw new Error("Access denied");
    }


    if (disclosure.company_id !== user.company_id) {
        throw new Error("Access denied");
    }

    if (disclosure.status !== "REJECTED") {
        throw new Error("Only rejected disclosures can be revised");
    }

    return await disclosureModel.updateStatus(id, "DRAFT");

},

async submitDisclosure(id, user) {

    const disclosure = await disclosureModel.getDisclosure(id);

    if (!disclosure) {
        throw new Error("Disclosure not found");
    }

    if (disclosure.company_id !== user.company_id) {
        throw new Error("Access denied");
    }

    if (disclosure.status !== "DRAFT") {
        throw new Error(
            "Only draft disclosures can be submitted"
        );
    }

    return await disclosureModel.updateStatus(
        id,
        "UNDER_REVIEW"
    );
},

async verifyDisclosure(id, user) {

    const disclosure = await disclosureModel.getDisclosure(id);

    if (!disclosure) {
        throw new Error("Disclosure not found");
    }

    // Only Auditor can verify
    if (user.role !== "AUDITOR") {
        throw new Error("Access denied");
    }

    // Only disclosures under review can be verified
    if (disclosure.status !== "UNDER_REVIEW") {
        throw new Error(
            "Only disclosures under review can be verified"
        );
    }

    return await disclosureModel.updateStatus(
        id,
        "VERIFIED"
    );
},

async rejectDisclosure(id, user) {

    const disclosure = await disclosureModel.getDisclosure(id);

    if (!disclosure) {
        throw new Error("Disclosure not found");
    }

    // Only Auditor can reject
    if (user.role !== "AUDITOR") {
        throw new Error("Access denied");
    }

    // Only disclosures under review can be rejected
    if (disclosure.status !== "UNDER_REVIEW") {
        throw new Error(
            "Only disclosures under review can be rejected"
        );
    }

    return await disclosureModel.updateStatus(
        id,
        "REJECTED"
    );
},



};