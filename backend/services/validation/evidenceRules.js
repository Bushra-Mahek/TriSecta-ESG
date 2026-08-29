export const evidenceRules = {

    validateDocuments(
        disclosure,
        documents
    ) {

        const results = [];

        if (!documents || documents.length === 0) {

            return [{
                ruleCode: "DOCUMENT_EVIDENCE",
                category: "EVIDENCE",
                severity: "WARNING",
                status: "WARNING",
                message:
                    "No supporting evidence is attached to the disclosure.",
                expected: "Supporting evidence",
                actual: "No documents"
            }];
        }

        for (const document of documents) {

            if (
                document.disclosure_id !== disclosure.id
            ) {

                results.push({
                    ruleCode: "DOCUMENT_OWNERSHIP",
                    category: "EVIDENCE",
                    severity: "FAIL",
                    status: "FAILED",
                    message:
                        "Document does not belong to the disclosure.",
                    expected: disclosure.id,
                    actual: document.disclosure_id
                });
            }
        }

        if (results.length === 0) {

            results.push({
                ruleCode: "DOCUMENT_OWNERSHIP",
                category: "EVIDENCE",
                severity: "PASS",
                status: "PASSED",
                message:
                    "All supporting documents belong to the disclosure.",
                expected: disclosure.id,
                actual: null
            });
        }

        return results;
    }

};