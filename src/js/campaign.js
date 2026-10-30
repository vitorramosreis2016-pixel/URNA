export function applyCampaignEvent(candidate, { impact = 1 } = {}) {
  return {
    ...candidate,
    campaignMomentum: (candidate.campaignMomentum || 0) + impact
  };
}

export function campaignEffect(candidate) {
  return Math.max(0, candidate.campaignMomentum || 0);
}
