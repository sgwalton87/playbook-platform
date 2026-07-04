export type FinancialEntry = {
  id: string;
  type: "income" | "expense" | "saving" | "tax_reserve";
  amount: number;
  category: string;
};

export function summarizeAthleteFinances(
  entries: FinancialEntry[]
) {
  const total = (type: FinancialEntry["type"]) =>
    entries
      .filter((entry) => entry.type === type)
      .reduce((sum, entry) => sum + entry.amount, 0);

  const income = total("income");
  const expenses = total("expense");
  const saving = total("saving");
  const taxReserve = total("tax_reserve");

  return {
    income,
    expenses,
    saving,
    taxReserve,
    availableAfterTrackedAllocations:
      income - expenses - saving - taxReserve,
  };
}

export function getAthleteFinancialLearningPath(input: {
  hasIncome: boolean;
  hasContract: boolean;
  hasBudget: boolean;
  hasTaxReservePlan: boolean;
}) {
  const lessons: string[] = [];

  if (!input.hasBudget) lessons.push("Build Your NIL Budget");
  if (input.hasIncome) lessons.push("Understanding Earned Income");
  if (input.hasContract) lessons.push("Reading Compensation Terms");
  if (!input.hasTaxReservePlan) {
    lessons.push("Tax Planning Fundamentals");
  }

  lessons.push("Saving and Investing for Long-Term Goals");

  return lessons;
}
