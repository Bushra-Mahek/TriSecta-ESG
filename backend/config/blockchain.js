import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.ESG_ANCHOR_CONTRACT_ADDRESS;

if (!RPC_URL) {
    throw new Error("SEPOLIA_RPC_URL is not configured");
}

if (!PRIVATE_KEY) {
    throw new Error("BLOCKCHAIN_PRIVATE_KEY is not configured");
}

if (!CONTRACT_ADDRESS) {
    throw new Error(
        "ESG_ANCHOR_CONTRACT_ADDRESS is not configured"
    );
}

const provider = new ethers.JsonRpcProvider(RPC_URL);

const wallet = new ethers.Wallet(
    PRIVATE_KEY,
    provider
);

const ESG_ANCHOR_ABI = [
    "function anchorRoot(bytes32 merkleRoot) external",
    "function isRootAnchored(bytes32 merkleRoot) external view returns (bool)",
    "function anchoredRoots(bytes32 merkleRoot) external view returns (uint256)",
    "event RootAnchored(bytes32 indexed merkleRoot, uint256 timestamp)"
];

const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    ESG_ANCHOR_ABI,
    wallet
);

export {
    provider,
    wallet,
    contract,
    CONTRACT_ADDRESS
};