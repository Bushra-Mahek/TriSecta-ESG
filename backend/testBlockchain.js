import { blockchainService } from "./services/blockchainService.js";

const result =
    await blockchainService.isMerkleRootAnchored(
        "0x1111111111111111111111111111111111111111111111111111111111111111"
    );

console.log("Blockchain connection:", result);