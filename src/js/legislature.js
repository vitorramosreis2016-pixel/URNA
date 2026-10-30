export const LEGISLATIVE_OFFICES = [
  "senator",
  "federalDeputy",
  "stateDeputy",
  "councilor"
];

export function seatsFor(office, {
  federalDeputies = 10,
  stateDeputies = 20,
  councilors = 9,
  senators = 1
} = {}) {
  const seatsByOffice = {
    senator: senators,
    federalDeputy: federalDeputies,
    stateDeputy: stateDeputies,
    councilor: councilors
  };

  return seatsByOffice[office] || 0;
}

export function allocateSeats(parties, seats) {
  const totalVotes = parties.reduce((sum, party) => sum + party.votes, 0);

  if (!totalVotes || seats <= 0) {
    return parties.map(party => ({ ...party, seats: 0 }));
  }

  const results = parties.map(party => {
    const quota = party.votes / totalVotes * seats;
    const assignedSeats = Math.floor(quota);

    return {
      ...party,
      seats: assignedSeats,
      remainder: quota - assignedSeats
    };
  });

  let remainingSeats = seats - results.reduce((sum, party) => sum + party.seats, 0);
  results.sort((a, b) => b.remainder - a.remainder);

  for (let index = 0; index < remainingSeats; index++) {
    results[index].seats++;
  }

  return results;
}
