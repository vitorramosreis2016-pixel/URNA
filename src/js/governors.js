const STATE_OFFICES = [
  "governor",
  "senator",
  "federalDeputy",
  "stateDeputy"
];

export function candidatesForGovernor(state, office, stateName) {
  if (!STATE_OFFICES.includes(office)) {
    return [];
  }

  return state.candidates.filter(candidate =>
    candidate.office === office &&
    candidate.region.toLocaleLowerCase("pt-BR") === stateName.toLocaleLowerCase("pt-BR")
  );
}

export { STATE_OFFICES };
