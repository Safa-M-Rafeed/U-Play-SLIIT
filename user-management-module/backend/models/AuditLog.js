const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  action:       { type: String, required: true },
  performedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  targetUser:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  details:      { type: String },
}, { timestamps: true });

module.exports = mongoose.model("AuditLog", auditLogSchema);
