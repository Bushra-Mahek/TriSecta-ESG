export const disclosureTransitions = {
    DRAFT: ["UNDER_REVIEW"],

    UNDER_REVIEW: [
        "VERIFIED",
        "REJECTED"
    ],

    REJECTED: ["DRAFT"],

    VERIFIED: []
};

export const canTransition = (currentStatus, newStatus) => {

    const allowedTransitions =
        disclosureTransitions[currentStatus];

    if (!allowedTransitions) {
        return false;
    }

    return allowedTransitions.includes(newStatus);
};