import Proposal from '../models/proposal.js';

export const createProposal = async (userId, offering, lookingFor) => {
  const proposal = new Proposal({ user: userId, offering, lookingFor });
  return await proposal.save();
};

export const getAllProposals = async () => {
  return await Proposal.find().populate('user', 'name location');
};

export const getProposalById = async (id) => {
  return await Proposal.findById(id).populate('user');
};

export const deleteProposal = async (id) => {
  return await Proposal.findByIdAndDelete(id);
};
