const MUNICIPAL_OFFICES = ["mayor", "councilor"];

export function candidatesForMunicipality(state, office, municipality) {
  if (!MUNICIPAL_OFFICES.includes(office)) {
    return [];
  }

  return state.candidates.filter(candidate =>
    candidate.office === office &&
    candidate.region.toLocaleLowerCase("pt-BR") === municipality.toLocaleLowerCase("pt-BR")
  );
}

export { MUNICIPAL_OFFICES };
