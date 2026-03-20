// Shared Patient logic
export const patients = {
  createCase: async (data: any) => ({ id: "case_123" }),
  getMyCases: async (userId: string) => [{ id: "case_123", title: "Example" }],
};
