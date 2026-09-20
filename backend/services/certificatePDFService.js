import PDFDocument from "pdfkit";

export function generateCertificatePdf(data) {
    return new Promise((resolve, reject) => {

        const doc = new PDFDocument({
            size: "A4",
            margin: 50
        });

        const chunks = [];

        doc.on("data", chunk => chunks.push(chunk));

        doc.on("end", () => {
            resolve(Buffer.concat(chunks));
        });

        doc.on("error", reject);

        doc
            .fontSize(26)
            .text("VERITAS ESG", { align: "center" });

        doc.moveDown();

        doc
            .fontSize(20)
            .text("ESG VERIFICATION CERTIFICATE", {
                align: "center"
            });

        doc.moveDown(2);

        doc
            .fontSize(13)
            .text(`Certificate Number: ${data.certificateNumber}`);

        doc.moveDown();

        doc.text(`Company: ${data.companyName}`);
        doc.text(`Reporting Year: ${data.reportingYear}`);
        doc.text(`Status: VERIFIED`);

        doc.moveDown();

        doc.text(`Verified At: ${data.verifiedAt}`);

        doc.moveDown(2);

        doc
            .fontSize(14)
            .text("Blockchain Verification");

        doc.moveDown();

        doc.fontSize(11);

        doc.text(`Network: Ethereum Sepolia`);
        doc.text(`Merkle Root: ${data.merkleRoot}`);
        doc.text(`Transaction Hash: ${data.transactionHash}`);
        doc.text(`Block Number: ${data.blockNumber}`);

        doc.moveDown(2);

        doc
            .fontSize(10)
            .text(
                "This certificate certifies that the referenced ESG disclosure "
                + "was verified through the VeritasESG audit workflow and its "
                + "integrity proof was anchored on the Ethereum Sepolia network."
            );

        doc.end();
    });
}