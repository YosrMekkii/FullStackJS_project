import {
    createProposal as createProposalService,
    getAllProposals as fetchAllProposals
  } from '../services/proposalService.js';
  
  export const createProposal = async (req, res) => {
    try {
      const { offering, lookingFor } = req.body;
      const userId = req.user.id;
      const proposal = await createProposalService(userId, offering, lookingFor);
      res.status(201).json(proposal);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  export const getAllProposals = async (req, res) => {
    try {
      const proposals = await fetchAllProposals(); // ✅ plus de conflit
      res.status(200).json(proposals);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  