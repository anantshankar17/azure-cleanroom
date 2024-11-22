// From https://github.com/microsoft/CCF/blob/a4666e003e6cf2142db0d413082839501b4cca6f/tests/npm-app/src/endpoints/snp_attestation.ts
import { Base64 } from "js-base64";
import * as ccfapp from "@microsoft/ccf-app";
import { getCleanRoomPolicyProps, hex } from "../utils/utils";
import { SnpAttestationClaims } from "./SnpAttestationClaims";

export interface SnpEvidence {
  evidence: string;
  endorsements: string;
  uvm_endorsements: string;
  endorsed_tcb?: string;
}

export interface TcbVersion {
  boot_loader: number;
  tee: number;
  snp: number;
  microcode: number;
}

export interface SnpAttestationResult {
  attestation: {
    version: number;
    guest_svn: number;
    policy: {
      abi_minor: number;
      abi_major: number;
      smt: number;
      migrate_ma: number;
      debug: number;
      single_socket: number;
    };
    family_id: string;
    image_id: string;
    vmpl: number;
    signature_algo: number;
    platform_version: TcbVersion;
    platform_info: {
      smt_en: number;
      tsme_en: number;
    };
    flags: {
      author_key_en: number;
      mask_chip_key: number;
      signing_key: number;
    };
    report_data: string;
    measurement: string;
    host_data: string;
    id_key_digest: string;
    author_key_digest: string;
    report_id: string;
    report_id_ma: string;
    reported_tcb: TcbVersion;
    chip_id: string;
    committed_tcb: TcbVersion;
    current_minor: number;
    current_build: number;
    current_major: number;
    committed_build: number;
    committed_minor: number;
    committed_major: number;
    launch_tcb: TcbVersion;
    signature: {
      r: string;
      s: string;
    };
  };
  uvm_endorsements?: {
    did: string;
    feed: string;
    svn: string;
  };
}

export function verifySnpAttestation(
  contractId: string,
  attestation: SnpEvidence
): SnpAttestationResult {
  if (isSnpAttestationValidationSupported()) {
    return verifySnpAttestationV5(contractId, attestation);
  } else {
    return verifySnpAttestationV4(contractId, attestation);
  }
}

function verifySnpAttestationV5(
  contractId: string,
  attestation: SnpEvidence
): SnpAttestationResult {
  const evidence = ccfapp
    .typedArray(Uint8Array)
    .encode(Base64.toUint8Array(attestation.evidence));
  const endorsements = ccfapp
    .typedArray(Uint8Array)
    .encode(Base64.toUint8Array(attestation.endorsements));
  const uvm_endorsements =
    attestation.uvm_endorsements !== undefined
      ? ccfapp
          .typedArray(Uint8Array)
          .encode(Base64.toUint8Array(attestation.uvm_endorsements))
      : undefined;

  // TODO (gsinha):Bring below logic back once mCCF moves to 5.0 release.
  // import * as ccfsnp from "@microsoft/ccf-app/snp_attestation";
  //  const r = ccfsnp.verifySnpAttestation(
  //   evidence,
  //   endorsements,
  //   uvm_endorsements,
  //   attestation.endorsed_tcb,
  // );
  const r = globalThis.snp_attestation.verifySnpAttestation(
    evidence,
    endorsements,
    uvm_endorsements,
    attestation.endorsed_tcb
  ) as import("@microsoft/ccf-app/global").SnpAttestationResult;

  const claimsProvider = new SnpAttestationClaims(r);
  const attestationClaims = claimsProvider.getClaims();

  // Get the clean room policy.
  const cleanroomPolicy = getCleanRoomPolicyProps(contractId);
  console.log(
    `Clean room policy: ${JSON.stringify(cleanroomPolicy)}, keys: ${Object.keys(
      cleanroomPolicy
    )}, keys: ${Object.keys(cleanroomPolicy).length}`
  );

  if (Object.keys(cleanroomPolicy).length === 0) {
    throw Error(
      "The clean room policy is missing. Please propose a new clean room policy."
    );
  }

  for (let inx = 0; inx < Object.keys(cleanroomPolicy).length; inx++) {
    const key = Object.keys(cleanroomPolicy)[inx];

    // check if key is in attestation
    const attestationValue = attestationClaims[key];
    const policyValue = cleanroomPolicy[key];
    const isUndefined = typeof attestationValue === "undefined";
    console.log(
      `Checking key ${key}, typeof attestationValue: ${typeof attestationValue}, ` +
        `isUndefined: ${isUndefined}, attestation value: ${attestationValue}, policyValue: ${policyValue}`
    );
    if (isUndefined) {
      console.log(`Policy claim ${key} is missing from attestation`);
      throw Error(`Missing claim in attestation: ${key}`);
    }
    if (
      policyValue.filter((p) => {
        console.log(`Check if policy value ${p} === ${attestationValue}`);
        return p === attestationValue;
      }).length === 0
    ) {
      throw Error(
        `Attestation claim ${key}, value ${attestationValue} does not match policy values: ${policyValue}`
      );
    }
  }

  return {
    attestation: {
      ...r.attestation,
      family_id: hex(r.attestation.family_id),
      image_id: hex(r.attestation.image_id),
      report_data: hex(r.attestation.report_data),
      measurement: hex(r.attestation.measurement),
      host_data: hex(r.attestation.host_data),
      id_key_digest: hex(r.attestation.id_key_digest),
      author_key_digest: hex(r.attestation.author_key_digest),
      report_id: hex(r.attestation.report_id),
      report_id_ma: hex(r.attestation.report_id_ma),
      chip_id: hex(r.attestation.chip_id),
      signature: {
        r: hex(r.attestation.signature.r),
        s: hex(r.attestation.signature.s)
      }
    },
    uvm_endorsements: r.uvm_endorsements
  };
}

// This is a placeholder logic to support some basic interpretation of the attestation report
// without any actual verification of the attestation report being signed by AMD PSP.
// Remove this method once mCCF moves to 5.0 release of CCF.
function verifySnpAttestationV4(
  contractId: string,
  attestation: SnpEvidence
): SnpAttestationResult {
  console.log(
    "Running on v4 CCF. Not doing AMD attestation report verification and only extracting data out of it."
  );
  const evidence = ccfapp
    .typedArray(Uint8Array)
    .encode(Base64.toUint8Array(attestation.evidence));

  // Per Table 22 of https://www.amd.com/content/dam/amd/en/documents/epyc-technical-docs/specifications/56860.pdf
  const hostData = new Uint8Array(evidence, 192, 32);
  const reportData = new Uint8Array(evidence, 80, 64);
  const policy = new Uint8Array(evidence, 8, 8);
  const is_bit_set = (value: number, bitindex: number) => {
    return (value & (1 << bitindex)) != 0;
  };

  // Per Table 9 of https://www.amd.com/content/dam/amd/en/documents/epyc-technical-docs/specifications/56860.pdf
  // Bit 19 in the 8 bytes policy structure.
  const debuggable = is_bit_set(policy[3], 3);

  const r: import("@microsoft/ccf-app/global").SnpAttestationResult = {
    attestation: {
      host_data: hostData,
      report_data: reportData,
      // Note (gsinha): Most the the properties are not extracted below.
      // Only extracted what is needed bare minimum to support scenario on v4 CCF clusters.
      version: 0,
      guest_svn: 0,
      policy: {
        abi_minor: 0,
        abi_major: 0,
        smt: 0,
        migrate_ma: 0,
        debug: debuggable ? 1 : 0,
        single_socket: 0
      },
      family_id: undefined,
      image_id: undefined,
      vmpl: 0,
      signature_algo: 0,
      platform_version: undefined,
      platform_info: {
        smt_en: 0,
        tsme_en: 0
      },
      flags: {
        author_key_en: 0,
        mask_chip_key: 0,
        signing_key: 0
      },
      measurement: undefined,
      id_key_digest: undefined,
      author_key_digest: undefined,
      report_id: undefined,
      report_id_ma: undefined,
      reported_tcb: undefined,
      chip_id: undefined,
      committed_tcb: undefined,
      current_minor: 0,
      current_build: 0,
      current_major: 0,
      committed_build: 0,
      committed_minor: 0,
      committed_major: 0,
      launch_tcb: undefined,
      signature: {
        r: undefined,
        s: undefined
      }
    }
  };

  const claimsProvider = new SnpAttestationClaims(r);
  const attestationClaims = claimsProvider.getClaims();

  // Get the clean room policy.
  const cleanroomPolicy = getCleanRoomPolicyProps(contractId);
  console.log(
    `Clean room policy: ${JSON.stringify(cleanroomPolicy)}, keys: ${Object.keys(
      cleanroomPolicy
    )}, keys: ${Object.keys(cleanroomPolicy).length}`
  );

  if (Object.keys(cleanroomPolicy).length === 0) {
    throw Error(
      "The clean room policy is missing. Please propose a new clean room policy."
    );
  }

  for (let inx = 0; inx < Object.keys(cleanroomPolicy).length; inx++) {
    const key = Object.keys(cleanroomPolicy)[inx];

    // check if key is in attestation
    const attestationValue = attestationClaims[key];
    const policyValue = cleanroomPolicy[key];
    const isUndefined = typeof attestationValue === "undefined";
    console.log(
      `Checking key ${key}, typeof attestationValue: ${typeof attestationValue}, ` +
        `isUndefined: ${isUndefined}, attestation value: ${attestationValue}, policyValue: ${policyValue}`
    );
    if (isUndefined) {
      console.log(`Policy claim ${key} is missing from attestation`);
      throw Error(`Missing claim in attestation: ${key}`);
    }
    if (
      policyValue.filter((p) => {
        console.log(`Check if policy value ${p} === ${attestationValue}`);
        return p === attestationValue;
      }).length === 0
    ) {
      throw Error(
        `Attestation claim ${key}, value ${attestationValue} does not match policy values: ${policyValue}`
      );
    }
  }

  return {
    attestation: {
      ...r.attestation,
      family_id: hex(r.attestation.family_id),
      image_id: hex(r.attestation.image_id),
      report_data: hex(r.attestation.report_data),
      measurement: hex(r.attestation.measurement),
      host_data: hex(r.attestation.host_data),
      id_key_digest: hex(r.attestation.id_key_digest),
      author_key_digest: hex(r.attestation.author_key_digest),
      report_id: hex(r.attestation.report_id),
      report_id_ma: hex(r.attestation.report_id_ma),
      chip_id: hex(r.attestation.chip_id),
      signature: {
        r: hex(r.attestation.signature.r),
        s: hex(r.attestation.signature.s)
      }
    },
    uvm_endorsements: r.uvm_endorsements
  };
}

function isSnpAttestationValidationSupported(): boolean {
  // The use of globalThis to determine whether we are running on 4.0 release is hacky workaround
  // as we are not able to do dynamic import in the CCF environment.
  // On 4.0 release globalThis.snp_attestation would not set.
  // https://github.com/microsoft/CCF/blob/327be2d61d09df9ddab1489859b134f96aeeccfd/js/ccf-app/src/global.ts#L817
  return globalThis.snp_attestation !== undefined;
}