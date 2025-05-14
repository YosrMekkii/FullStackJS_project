import Report from "../models/report.js";

export const createReport = async (reportData) => {
  try {
    const report = new Report(reportData);
    return await report.save();
  } catch (error) {
    throw new Error("Error creating report: " + error.message);
  }
};

export const getAllReports = async () => {
  try {
    return await Report.find().populate("reporter reportedUser");
  } catch (error) {
    throw new Error("Error fetching reports: " + error.message);
  }
};



export const getReportById = async (id) => {
  try {
    return await Report.findById(id).populate("reporter reportedUser");
  } catch (error) {
    throw new Error("Error fetching report: " + error.message);
  }
};



export const deleteReport = async (id) => {
  try {
    return await Report.findByIdAndDelete(id);
  } catch (error) {
    throw new Error("Error deleting report: " + error.message);
  }
};

export const getTotalReports = async () => {
  try {
    const totalReports = await Report.countDocuments();
    return totalReports;
  } catch (error) {
    throw new Error("Erreur lors du comptage des rapports: " + error.message);
  }
};

export const updateReportStatus = async (reportId, status) => {
  return await Report.findByIdAndUpdate(
    reportId,
    { status },
    { new: true }
  );
};
