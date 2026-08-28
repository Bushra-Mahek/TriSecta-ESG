import { ethers } from "ethers";

import {
    contract,
    CONTRACT_ADDRESS
} from "../config/blockchain.js";


export const blockchainService = {

    async anchorMerkleRoot(merkleRoot) {

        if (!merkleRoot) {
            throw new Error(
                "Merkle root is required"
            );
        }

        if (!ethers.isHexString(merkleRoot, 32)) {
            throw new Error(
                "Merkle root must be a valid bytes32 value"
            );
        }

        const alreadyAnchored =
            await contract.isRootAnchored(
                merkleRoot
            );

        if (alreadyAnchored) {

            const timestamp =
                await contract.anchoredRoots(
                    merkleRoot
                );

            return {
                alreadyAnchored: true,
                merkleRoot,
                contractAddress: CONTRACT_ADDRESS,
                transactionHash: null,
                blockNumber: null,
                gasUsed: null,
                timestamp: timestamp.toString()
            };
        }

        const transaction =
            await contract.anchorRoot(
                merkleRoot
            );

        const receipt =
            await transaction.wait();

        return {
            alreadyAnchored: false,
            merkleRoot,
            contractAddress: CONTRACT_ADDRESS,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        };
    },


    async isMerkleRootAnchored(merkleRoot) {

        if (!merkleRoot) {
            throw new Error(
                "Merkle root is required"
            );
        }

        if (!ethers.isHexString(merkleRoot, 32)) {
            throw new Error(
                "Merkle root must be a valid bytes32 value"
            );
        }

        return await contract.isRootAnchored(
            merkleRoot
        );
    },


    async getAnchorTimestamp(merkleRoot) {

        const timestamp =
            await contract.anchoredRoots(
                merkleRoot
            );

        return timestamp.toString();
    }

};