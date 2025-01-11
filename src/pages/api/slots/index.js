import connectMongo from "@/lib/mongodb";
import Slot from "@/models/Slot";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  const { method } = req;

  await connectMongo();

  try {
    switch (method) {
      // READ: Get all slots or slots for a specific date
      case "GET": {
        const { date } = req.query;

        if (date) {
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);

          const slots = await Slot.find({
            startTime: { $gte: startOfDay, $lte: endOfDay },
          });
          res.status(200).json(slots);
        } else {
          const slots = await Slot.find(); // Fetch all slots
          res.status(200).json(slots);
        }
        break;
      }

      // CREATE: Add a new time slot
      case "POST": {
        const { startTime, endTime, createdBy } = req.body;

        // Check if the slot is already booked
        const existingSlot = await Slot.findOne({
          startTime: { $lt: endTime, $gte: startTime },
        });

        if (existingSlot) {
          return res.status(400).json({ message: "Time slot already booked!" });
        }

        const newSlot = await Slot.create({ startTime, endTime, createdBy });
        res.status(201).json(newSlot);
        break;
      }

      // UPDATE: Modify an existing slot
      case "PUT": {
        const { id } = req.query; // Slot ID to update
        const { startTime, endTime } = req.body;

        const updatedSlot = await Slot.findByIdAndUpdate(
          id,
          { startTime, endTime },
          { new: true } // Return the updated document
        );

        if (!updatedSlot) {
          return res.status(404).json({ message: "Slot not found!" });
        }

        res.status(200).json(updatedSlot);
        break;
      }

      // DELETE: Remove a slot
      case "DELETE": {
        const { id } = req.query; // Slot ID to delete

        const deletedSlot = await Slot.findByIdAndDelete(id);

        if (!deletedSlot) {
          return res.status(404).json({ message: "Slot not found!" });
        }

        res.status(200).json({ message: "Slot deleted successfully!" });
        break;
      }

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        res.status(405).end(`Method ${method} Not Allowed`);
        break;
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
