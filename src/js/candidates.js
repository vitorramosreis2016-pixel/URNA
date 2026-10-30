export const OFFICES = [
  { id: "president", label: "Presidente", level: "national", rounds: 2 },
  { id: "governor", label: "Governador", level: "state", rounds: 2 },
  { id: "senator", label: "Senador", level: "state", rounds: 1 },
  { id: "federalDeputy", label: "Deputado federal", level: "state", rounds: 1 },
  { id: "stateDeputy", label: "Deputado estadual", level: "state", rounds: 1 },
  { id: "mayor", label: "Prefeito", level: "municipal", rounds: 2 },
  { id: "councilor", label: "Vereador", level: "municipal", rounds: 1 }
];

export function createCandidate(state, data) {
  if (!data.name?.trim() || !data.partyId || !OFFICES.some(office => office.id === data.office)) {
    throw new Error("Nome, partido e cargo são obrigatórios.");
  }

  if (data.office !== "president" && !data.region?.trim()) {
    throw new Error("Informe o estado ou município da disputa.");
  }

  const candidate = {
    id: crypto.randomUUID(),
    name: data.name.trim(),
    partyId: data.partyId,
    office: data.office,
    region: data.office === "president" ? "Brasil" : data.region.trim(),
    platform: data.platform?.trim() || "Sem propostas cadastradas."
  };

  state.candidates.push(candidate);
  return candidate;
}

export function candidatesFor(state, office, region) {
  return state.candidates.filter(candidate => {
    const sameOffice = candidate.office === office;
    const sameRegion = office === "president" ||
      candidate.region.toLocaleLowerCase("pt-BR") === region.toLocaleLowerCase("pt-BR");

    return sameOffice && sameRegion;
  });
}
