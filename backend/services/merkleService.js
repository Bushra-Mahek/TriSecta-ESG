import crypto from "crypto";


function sha256(value) {

    return crypto
        .createHash("sha256")
        .update(value)
        .digest("hex");
}


function hashRecord(record) {

    const canonicalRecord = JSON.stringify({
        disclosureId: record.disclosureId,
        metricId: record.metricId,
        value: record.value,
        unit: record.unit,
        periodStart: record.periodStart,
        periodEnd: record.periodEnd,
        enteredBy: record.enteredBy
    });

    return sha256(canonicalRecord);
}


function hashPair(left, right) {

    return sha256(
        left + right
    );
}


function buildMerkleRoot(hashes) {

    if (!hashes || hashes.length === 0) {
        throw new Error(
            "Cannot build Merkle tree from empty dataset"
        );
    }

    let level = [...hashes];

    while (level.length > 1) {

        const nextLevel = [];

        for (
            let i = 0;
            i < level.length;
            i += 2
        ) {

            const left = level[i];

            const right =
                level[i + 1] ?? left;

            nextLevel.push(
                hashPair(left, right)
            );
        }

        level = nextLevel;
    }

    return level[0];
}


function getMerkleProof(hashes, index) {

    if (
        !Array.isArray(hashes) ||
        hashes.length === 0
    ) {
        throw new Error("Hashes are required");
    }

    if (
        index < 0 ||
        index >= hashes.length
    ) {
        throw new Error("Invalid leaf index");
    }

    const proof = [];

    let level = [...hashes];

    let currentIndex = index;

    while (level.length > 1) {

        const isRightNode =
            currentIndex % 2 === 1;

        const siblingIndex =
            isRightNode
                ? currentIndex - 1
                : currentIndex + 1;

        const sibling =
            level[siblingIndex] ??
            level[currentIndex];

        proof.push({
            hash: sibling,
            position:
                isRightNode
                    ? "left"
                    : "right"
        });

        const nextLevel = [];

        for (
            let i = 0;
            i < level.length;
            i += 2
        ) {

            const left = level[i];

            const right =
                level[i + 1] ?? left;

            nextLevel.push(
                hashPair(left, right)
            );
        }

        currentIndex =
            Math.floor(currentIndex / 2);

        level = nextLevel;
    }

    return proof;
}


function verifyMerkleProof(
    record,
    proof,
    root
) {

    let currentHash =
        hashRecord(record);

    for (const step of proof) {

        if (step.position === "left") {

            currentHash =
                hashPair(
                    step.hash,
                    currentHash
                );

        } else {

            currentHash =
                hashPair(
                    currentHash,
                    step.hash
                );
        }
    }

    return currentHash === root;
}


export const merkleService = {

    hashRecord,

    buildMerkleRoot,

    getMerkleProof,

    verifyMerkleProof,

    buildTree(records) {

        if (
            !Array.isArray(records) ||
            records.length === 0
        ) {
            throw new Error(
                "Records are required"
            );
        }

        const leafHashes =
            records.map(hashRecord);

        const root =
            buildMerkleRoot(
                leafHashes
            );

        return {
            leafHashes,
            root
        };
    }

};