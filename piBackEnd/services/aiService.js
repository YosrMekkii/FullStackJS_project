import Proposal from '../models/proposal.js';

export const suggestProposalsForUser = async (user) => {
  const { offering, lookingFor } = user;

  const proposals = await Proposal.find().populate('user');

  const suggestions = proposals.filter(p => {
    return (
      p.user._id.toString() !== user._id.toString() && (
        (p.offering.toLowerCase().includes(lookingFor.toLowerCase()) &&
         p.lookingFor.toLowerCase().includes(offering.toLowerCase()))
      )
    );
  });

  return suggestions;
};
