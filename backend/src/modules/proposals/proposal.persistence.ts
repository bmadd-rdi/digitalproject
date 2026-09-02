import { eq, inArray } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import {
  proposalBudgets,
  proposalRelatedProjects,
  proposalManpower,
  proposalExistingEquipments,
  proposalHardwareCosts,
  proposalSoftwareCosts,
  proposalPersonnelCosts,
  proposalPersonnelResponsibilities,
  proposalTrainings,
  proposalTrainingSpeakerCosts,
  proposalTrainingFoodCosts,
  proposalOtherCosts,
  proposalIctPersonnel,
  proposalCloudRequests,
  proposalCloudVms,
} from "../../db/schema/proposals";

type Transaction = any;
type ProposalPayload = Record<string, any>;

const hasOwn = (payload: ProposalPayload, key: string) =>
  Object.prototype.hasOwnProperty.call(payload, key);

/**
 * Replaces the child rows for one proposal collection while preserving the
 * IDs supplied by the client. This helper intentionally runs inside the
 * caller's transaction.
 */
async function syncSubTable(
  tx: Transaction,
  table: any,
  parentIdColumn: any,
  parentIdValue: string,
  idColumn: any,
  payloadArray: any[],
  mapInsert: (item: any) => any,
  mapUpdate: (item: any) => any,
) {
  const existingRecords = await tx
    .select({ id: idColumn })
    .from(table)
    .where(eq(parentIdColumn, parentIdValue));
  const existingIds = new Set(existingRecords.map((row: any) => row.id));
  const payloadIds = new Set(payloadArray.filter((row) => row.id).map((row) => row.id));

  const toDelete = [...existingIds].filter((id) => !payloadIds.has(id));
  // A restored draft may contain UUIDs from the deleted submitted proposal.
  // Treat unknown IDs as new rows instead of silently dropping them.
  const toInsert = payloadArray.filter((row) => !row.id || !existingIds.has(row.id));
  const toUpdate = payloadArray.filter(
    (row) => row.id && existingIds.has(row.id),
  );

  const operations: Promise<any>[] = [];
  if (toDelete.length > 0) {
    operations.push(tx.delete(table).where(inArray(idColumn, toDelete)));
  }
  if (toInsert.length > 0) {
    operations.push(tx.insert(table).values(toInsert.map(mapInsert)));
  }
  operations.push(
    ...toUpdate.map((row) =>
      tx.update(table).set(mapUpdate(row)).where(eq(idColumn, row.id)),
    ),
  );

  await Promise.all(operations);
}

function providedRows(payload: ProposalPayload, ...keys: string[]) {
  const key = keys.find(
    (candidate) => hasOwn(payload, candidate) && payload[candidate] !== undefined,
  );
  if (!key) return { provided: false, rows: [] as any[] };
  return {
    provided: true,
    rows: Array.isArray(payload[key]) ? payload[key] : [],
  };
}

function asString(value: unknown) {
  return value === null || value === undefined || value === ""
    ? null
    : String(value);
}

async function syncSimpleCollections(
  tx: Transaction,
  proposalId: string,
  payload: ProposalPayload,
) {
  const operations: Promise<void>[] = [];
  const counts: Record<string, number> = {};

  const sync = (
    name: string,
    keys: string[],
    table: any,
    mapInsert: (row: any) => any,
    mapUpdate: (row: any) => any,
  ) => {
    const selection = providedRows(payload, ...keys);
    if (!selection.provided) return;
    counts[name] = selection.rows.length;
    operations.push(
      syncSubTable(
        tx,
        table,
        table.proposalId,
        proposalId,
        table.id,
        selection.rows,
        mapInsert,
        mapUpdate,
      ),
    );
  };

  // budgetsByYear is the canonical request name. budgets remains a
  // compatibility alias for older clients and retained draft payloads.
  sync(
    "budgets",
    ["budgetsByYear", "budgets"],
    proposalBudgets,
    (row) => ({
      id: uuidv7(),
      proposalId,
      year: row.year,
      amount: asString(row.amount),
      budgetType: row.budgetType,
    }),
    (row) => ({
      year: row.year,
      amount: asString(row.amount),
      budgetType: row.budgetType,
    }),
  );

  sync(
    "relatedProjects",
    ["relatedProjects"],
    proposalRelatedProjects,
    (row) => ({
      id: uuidv7(),
      proposalId,
      projectName: row.projectName,
      agency: row.agency,
      fiscalYear: row.fiscalYear,
      relationType: row.relationType,
      remark: row.remark,
    }),
    (row) => ({
      projectName: row.projectName,
      agency: row.agency,
      fiscalYear: row.fiscalYear,
      relationType: row.relationType,
      remark: row.remark,
    }),
  );

  sync(
    "manpower",
    ["manpower"],
    proposalManpower,
    (row) => ({
      id: uuidv7(),
      proposalId,
      agencyPart: row.agencyPart,
      positionLimit: row.positionLimit,
      occupied: row.occupied,
      vacant: row.vacant,
    }),
    (row) => ({
      agencyPart: row.agencyPart,
      positionLimit: row.positionLimit,
      occupied: row.occupied,
      vacant: row.vacant,
    }),
  );

  sync(
    "existingEquipment",
    ["existingEquipment", "existingEquipments"],
    proposalExistingEquipments,
    (row) => ({
      id: uuidv7(),
      proposalId,
      itemName: row.itemName,
      ageYears: asString(row.ageYears),
      quantity: row.quantity,
      user: row.user,
      location: row.location,
      remark: row.remark,
    }),
    (row) => ({
      itemName: row.itemName,
      ageYears: asString(row.ageYears),
      quantity: row.quantity,
      user: row.user,
      location: row.location,
      remark: row.remark,
    }),
  );

  const costFields = [
    "referenceType",
    "mdesMonth",
    "mdesYear",
    "mdesItemNo",
    "marketCount",
    "marketCompany",
    "prevProject",
    "prevYear",
    "otherDetail",
  ] as const;
  const mapCost = (row: any, includeCostType = false) => ({
    itemName: row.itemName,
    quantity: row.quantity,
    unitPrice: asString(row.unitPrice),
    ...(includeCostType ? { costType: row.costType } : {}),
    ...Object.fromEntries(costFields.map((field) => [field, row[field]])),
  });

  sync(
    "hardwareCosts",
    ["hardwareCosts"],
    proposalHardwareCosts,
    (row) => ({ id: uuidv7(), proposalId, ...mapCost(row) }),
    (row) => mapCost(row),
  );
  sync(
    "softwareCosts",
    ["softwareCosts"],
    proposalSoftwareCosts,
    (row) => ({ id: uuidv7(), proposalId, ...mapCost(row) }),
    (row) => mapCost(row),
  );

  sync(
    "personnelResponsibilities",
    ["personnelResponsibilities"],
    proposalPersonnelResponsibilities,
    (row) => ({
      id: uuidv7(),
      proposalId,
      position: row.position,
      responsibility: row.responsibility,
    }),
    (row) => ({ position: row.position, responsibility: row.responsibility }),
  );

  sync(
    "otherCosts",
    ["otherCosts"],
    proposalOtherCosts,
    (row) => ({
      id: uuidv7(),
      proposalId,
      itemName: row.itemName,
      quantity: row.quantity,
      unitPrice: asString(row.unitPrice),
      remark: row.remark,
      costType: row.costType,
    }),
    (row) => ({
      itemName: row.itemName,
      quantity: row.quantity,
      unitPrice: asString(row.unitPrice),
      remark: row.remark,
      costType: row.costType,
    }),
  );

  sync(
    "ictPersonnel",
    ["ictPersonnel"],
    proposalIctPersonnel,
    (row) => ({
      id: uuidv7(),
      proposalId,
      position: row.position,
      level: row.level,
      count: row.count,
    }),
    (row) => ({ position: row.position, level: row.level, count: row.count }),
  );

  await Promise.all(operations);
  return counts;
}

async function syncPersonnelCosts(
  tx: Transaction,
  proposalId: string,
  payload: ProposalPayload,
) {
  const explicit = [
    ["personnelCoreCosts", "CORE"],
    ["personnelAsstCosts", "ASST"],
    ["personnelSuppCosts", "SUPP"],
  ] as const;
  const hasGrouped = explicit.some(([key]) => hasOwn(payload, key));
  const hasCombined = hasOwn(payload, "personnelCosts");
  if (!hasGrouped && !hasCombined) return null;

  let rows: any[];
  if (hasCombined) {
    rows = Array.isArray(payload.personnelCosts) ? payload.personnelCosts : [];
  } else {
    const suppliedTypes = new Set(
      explicit.filter(([key]) => hasOwn(payload, key)).map(([, type]) => type),
    );
    const existing = await tx
      .select()
      .from(proposalPersonnelCosts)
      .where(eq(proposalPersonnelCosts.proposalId, proposalId));
    const preserved = existing.filter(
      (row: any) => !suppliedTypes.has(row.personnelType),
    );
    const grouped = explicit.flatMap(([key, personnelType]) =>
      hasOwn(payload, key) && Array.isArray(payload[key])
        ? payload[key].map((row: any) => ({ ...row, personnelType }))
        : [],
    );
    rows = [...preserved, ...grouped];
  }

  await syncSubTable(
    tx,
    proposalPersonnelCosts,
    proposalPersonnelCosts.proposalId,
    proposalId,
    proposalPersonnelCosts.id,
    rows,
    (row) => ({
      id: uuidv7(),
      proposalId,
      personnelType: row.personnelType,
      position: row.position,
      degree: row.degree,
      fieldOfStudy: row.fieldOfStudy,
      experienceYears: asString(row.experienceYears),
      baseSalary: asString(row.baseSalary),
      multiplier: asString(row.multiplier),
      personCount: row.personCount,
      durationMonths: row.durationMonths,
    }),
    (row) => ({
      personnelType: row.personnelType,
      position: row.position,
      degree: row.degree,
      fieldOfStudy: row.fieldOfStudy,
      experienceYears: asString(row.experienceYears),
      baseSalary: asString(row.baseSalary),
      multiplier: asString(row.multiplier),
      personCount: row.personCount,
      durationMonths: row.durationMonths,
    }),
  );

  return rows.length;
}

async function syncTrainings(
  tx: Transaction,
  proposalId: string,
  payload: ProposalPayload,
) {
  const selection = providedRows(payload, "trainingCourses", "trainings");
  if (!selection.provided) return null;

  const existing = await tx
    .select({ id: proposalTrainings.id })
    .from(proposalTrainings)
    .where(eq(proposalTrainings.proposalId, proposalId));
  const existingIds = new Set<string>(existing.map((row: any) => row.id));
  const rows = selection.rows;
  const rowIds = new Set<string>(rows.filter((row) => row.id).map((row) => row.id));
  const removed = [...existingIds].filter((id) => !rowIds.has(id));
  if (removed.length > 0) {
    await tx.delete(proposalTrainings).where(inArray(proposalTrainings.id, removed));
  }

  for (const row of rows) {
    let trainingId = row.id;
    const values = {
      courseName: row.courseName,
      trainingMethod: row.trainingMethod,
      locationType: row.locationType,
      hasSpeakerCost: row.hasSpeakerCost,
      speakerReason: row.speakerReason,
    };
    if (!trainingId || !existingIds.has(trainingId)) {
      trainingId = uuidv7();
      await tx.insert(proposalTrainings).values({ id: trainingId, proposalId, ...values });
    } else {
      await tx.update(proposalTrainings).set(values).where(eq(proposalTrainings.id, trainingId));
    }

    if (hasOwn(row, "speakerCosts")) {
      const speakerRows = Array.isArray(row.speakerCosts) ? row.speakerCosts : [];
      await syncSubTable(
        tx,
        proposalTrainingSpeakerCosts,
        proposalTrainingSpeakerCosts.trainingId,
        trainingId,
        proposalTrainingSpeakerCosts.id,
        speakerRows,
        (item) => ({
          id: uuidv7(),
          trainingId,
          itemName: item.itemName,
          hours: item.hours,
          ratePerHour: asString(item.ratePerHour),
          days: item.days,
        }),
        (item) => ({
          itemName: item.itemName,
          hours: item.hours,
          ratePerHour: asString(item.ratePerHour),
          days: item.days,
        }),
      );
    }
    if (hasOwn(row, "foodCosts")) {
      const foodRows = Array.isArray(row.foodCosts) ? row.foodCosts : [];
      await syncSubTable(
        tx,
        proposalTrainingFoodCosts,
        proposalTrainingFoodCosts.trainingId,
        trainingId,
        proposalTrainingFoodCosts.id,
        foodRows,
        (item) => ({
          id: uuidv7(),
          trainingId,
          itemName: item.itemName,
          mealsCount: item.mealsCount,
          ratePerMeal: asString(item.ratePerMeal),
          traineesCount: item.traineesCount,
          days: item.days,
        }),
        (item) => ({
          itemName: item.itemName,
          mealsCount: item.mealsCount,
          ratePerMeal: asString(item.ratePerMeal),
          traineesCount: item.traineesCount,
          days: item.days,
        }),
      );
    }
  }

  return rows.length;
}

async function syncCloudRequests(
  tx: Transaction,
  proposalId: string,
  payload: ProposalPayload,
) {
  const selection = providedRows(payload, "cloudRequests");
  if (!selection.provided) return null;

  const existing = await tx
    .select({ id: proposalCloudRequests.id })
    .from(proposalCloudRequests)
    .where(eq(proposalCloudRequests.proposalId, proposalId));
  const existingIds = new Set<string>(existing.map((row: any) => row.id));
  const rows = selection.rows;
  const rowIds = new Set<string>(rows.filter((row) => row.id).map((row) => row.id));
  const removed = [...existingIds].filter((id) => !rowIds.has(id));
  if (removed.length > 0) {
    await tx.delete(proposalCloudRequests).where(inArray(proposalCloudRequests.id, removed));
  }

  for (const row of rows) {
    let cloudRequestId = row.id;
    const values = {
      systemName: row.systemName,
      requestedServiceDate: row.requestedServiceDate ? new Date(row.requestedServiceDate) : null,
      recordedRequestDate: row.recordedRequestDate ? new Date(row.recordedRequestDate) : null,
    };
    if (!cloudRequestId || !existingIds.has(cloudRequestId)) {
      cloudRequestId = uuidv7();
      await tx.insert(proposalCloudRequests).values({ id: cloudRequestId, proposalId, ...values });
    } else {
      await tx.update(proposalCloudRequests).set(values).where(eq(proposalCloudRequests.id, cloudRequestId));
    }

    if (hasOwn(row, "vms")) {
      const vmRows = Array.isArray(row.vms) ? row.vms : [];
      await syncSubTable(
        tx,
        proposalCloudVms,
        proposalCloudVms.cloudRequestId,
        cloudRequestId,
        proposalCloudVms.id,
        vmRows,
        (vm) => ({
          id: uuidv7(),
          cloudRequestId,
          vmDescription: vm.vmDescription,
          osDatabase: vm.osDatabase,
          vcpu: vm.vcpu,
          ramGb: vm.ramGb,
          gpuGb: vm.gpuGb,
          storageGb: vm.storageGb,
          price: asString(vm.price) ?? "0",
        }),
        (vm) => ({
          vmDescription: vm.vmDescription,
          osDatabase: vm.osDatabase,
          vcpu: vm.vcpu,
          ramGb: vm.ramGb,
          gpuGb: vm.gpuGb,
          storageGb: vm.storageGb,
          price: asString(vm.price) ?? "0",
        }),
      );
    }
  }

  return rows.length;
}

/**
 * Persists every nested proposal collection using the canonical request
 * names while preserving compatibility aliases. The function is intentionally
 * shared by final submission and submitted-proposal PATCH operations.
 */
export async function syncProposalCollections(
  tx: Transaction,
  proposalId: string,
  payload: ProposalPayload,
) {
  const [simpleCounts, personnelCount, trainingCount, cloudCount] = await Promise.all([
    syncSimpleCollections(tx, proposalId, payload),
    syncPersonnelCosts(tx, proposalId, payload),
    syncTrainings(tx, proposalId, payload),
    syncCloudRequests(tx, proposalId, payload),
  ]);

  if (process.env.NODE_ENV !== "production") {
    console.debug("[proposals] nested collections persisted", {
      proposalId,
      collections: {
        ...simpleCounts,
        personnelCosts: personnelCount,
        trainings: trainingCount,
        cloudRequests: cloudCount,
      },
    });
  }
}
