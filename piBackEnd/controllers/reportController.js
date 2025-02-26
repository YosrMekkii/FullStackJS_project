import * as reportService from "../services/reportService.js";

export const createReport = async (req, res) => {
  try {
    const report = await reportService.createReport(req.body);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const reports = await reportService.getAllReports();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await reportService.getReportById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const report = await reportService.updateReportStatus(req.params.id, req.body.status);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const report = await reportService.deleteReport(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
