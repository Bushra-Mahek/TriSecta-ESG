import { merkleService } from "./services/merkleService.js";
import { blockchainService } from "./services/blockchainService.js";

async function main() {

    console.log("\n==============================");
    console.log("BLOCKCHAIN + MERKLE TEST");
    console.log("==============================\n");

    // Controlled ESG records for testing
    const records = [
        {
            metric: "electricity_consumption",
            value: 12500,
            unit: "kWh",
            reportingYear: 2025
        },
        {
            metric: "water_consumption",
            value: 8400,
            unit: "m3",
            reportingYear: 2025
        },
        {
            metric: "carbon_emissions",
            value: 4200,
            unit: "tCO2e",
            reportingYear: 2025
        }
    ];

    console.log("1. ESG Records:");
    console.log(records);

    // Build Merkle tree
    const tree = merkleService.buildTree(records);

    console.log("\n2. Leaf Hashes:");
    console.log(tree.leafHashes);

    console.log("\n3. Merkle Root:");
    console.log(tree.root);

    console.log("\n4. Checking blockchain...");

    const alreadyAnchored =
        await blockchainService.isMerkleRootAnchored(tree.root);

    console.log(
        "Already anchored:",
        alreadyAnchored
    );

    if (alreadyAnchored) {

        console.log(
            "\nThis Merkle root is already on Sepolia."
        );

        const timestamp =
            await blockchainService.getAnchorTimestamp(
                tree.root
            );

        console.log(
            "Anchor timestamp:",
            timestamp
        );

        return;
    }

    console.log(
        "\n5. Anchoring Merkle root on Sepolia..."
    );

    const result =
        await blockchainService.anchorMerkleRoot(
            tree.root
        );

    console.log("\n6. Blockchain Result:");
    console.log(result);

    console.log("\n==============================");
    console.log("SUCCESS");
    console.log("==============================\n");
}

main().catch((error) => {

    console.error("\n❌ TEST FAILED\n");

    console.error(error);

    process.exit(1);
});