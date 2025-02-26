import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true },
  details: { type: String },
  date: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ["RESOLVED", "PENDING", "DENIED"], 
    default: "PENDING" 
  }
});

const Report = mongoose.model("Report", reportSchema);
export default Report;
