export function createParty(state, { name, acronym, color = "#3978e8" }) {
  name = name.trim();
  acronym = acronym.trim().toUpperCase();

  if (!name || !acronym) {
    throw new Error("Nome e sigla são obrigatórios.");
  }

  if (state.parties.some(party => party.acronym.toUpperCase() === acronym)) {
    throw new Error("Sigla já cadastrada.");
  }

  const party = {
    id: crypto.randomUUID(),
    name,
    acronym,
    color
  };

  state.parties.push(party);
  return party;
}

export function deleteParty(state, id) {
  const hasCandidates = state.candidates.some(candidate => candidate.partyId === id);

  if (hasCandidates) {
    throw new Error("Remova os candidatos vinculados antes de excluir o partido.");
  }

  state.parties = state.parties.filter(party => party.id !== id);
}
