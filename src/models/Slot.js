import mongoose from "mongoose";

const SlotSchema = new mongoose.Schema({
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  createdBy: { type: String, required: true },
});

export default mongoose.models.Slot || mongoose.model("Slot", SlotSchema);
