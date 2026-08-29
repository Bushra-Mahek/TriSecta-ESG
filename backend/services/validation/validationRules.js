import { completenessRules }
    from "./completenessRules.js";

import { numericRules }
    from "./numericRules.js";

import { unitRules }
    from "./unitRules.js";

import { calculationRules }
    from "./calculationRules.js";

import { consistencyRules }
    from "./consistencyRules.js";

import { evidenceRules }
    from "./evidenceRules.js";

import { periodRules }
    from "./periodRules.js";

import { anomalyRules }
    from "./anomalyRules.js";


export const validationRules = {

    completeness: completenessRules,

    numeric: numericRules,

    units: unitRules,

    calculations: calculationRules,

    consistency: consistencyRules,

    evidence: evidenceRules,

    period: periodRules,

    anomaly: anomalyRules

};