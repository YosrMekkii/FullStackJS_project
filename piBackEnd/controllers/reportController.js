import * as reportService from "../services/reportService.js";
import Report from "../models/report.js";


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
    const reports = await Report.find()
      .populate("reporter", "username email firstName lastName profileImagePath")
      .populate("reportedUser", "username email firstName lastName profileImagePath"); // optionnel

    res.status(200).json(reports);
  } catch (error) {
    console.error("❌ Erreur dans getAllReports :", error);  // Ajoute ceci
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

export const getTotalReports = async (req, res) => {
  try {
    const totalReports = await reportService.getTotalReports();
    res.status(200).json({ totalReports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

