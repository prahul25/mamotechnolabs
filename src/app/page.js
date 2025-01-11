"use client";

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import "react-calendar/dist/Calendar.css";
import "./globals.css";

const startOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

// Snackbar Component
const Snackbar = ({ message, type, onClose }) => {
  return (
    <div
      className={`fixed bottom-4 left-4 px-6 py-3 rounded-md shadow-lg text-white text-sm transition duration-300 ease-in-out ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
      role="alert"
    >
      {message}
      <button
        className="ml-4 text-white font-bold underline"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
};

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [calendarData, setCalendarData] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ isVisible: false, message: "", type: "" });

  useEffect(() => {
    setIsLoading(true);
    fetchBookedSlots(selectedDate.toISOString());
    fetchCalendarData();
    generateTimeSlots();
    setIsLoading(false);
  }, [selectedDate]);

  const fetchBookedSlots = async (date) => {
    try {
      const { data } = await axios.get(`/api/slots?date=${date}`);
      const parsedSlots = data.map((slot) => ({
        ...slot,
        startTime: new Date(slot.startTime),
        endTime: new Date(slot.endTime),
      }));
      setBookedSlots(parsedSlots);
    } catch (error) {
      showSnackbar("Error fetching booked slots", "error");
    }
  };

  const fetchCalendarData = async () => {
    try {
      const { data } = await axios.get("/api/slots");
      const slotCount = {};

      data.forEach((slot) => {
        const date = startOfDay(new Date(slot.startTime))
          .toISOString()
          .split("T")[0];
        slotCount[date] = (slotCount[date] || 0) + 1;
      });

      setCalendarData(slotCount);
    } catch (error) {
      showSnackbar("Error fetching calendar data", "error");
    }
  };

  const generateTimeSlots = () => {
    const startHour = 12; // 12 PM
    const endHour = 17; // 5 PM
    const slots = [];

    const baseDate = startOfDay(selectedDate);

    for (let hour = startHour; hour < endHour; hour++) {
      const start = new Date(baseDate);
      start.setHours(hour, 0, 0, 0);

      const end = new Date(baseDate);
      end.setHours(hour + 1, 0, 0, 0);

      slots.push({ startTime: start, endTime: end });
    }

    setTimeSlots(slots);
  };

  const showSnackbar = (message, type) => {
    setSnackbar({ isVisible: true, message, type });
    setTimeout(() => setSnackbar({ isVisible: false, message: "", type: "" }), 3000);
  };

  const bookSlot = async (slot) => {
    try {
      await axios.post("/api/slots", {
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        createdBy: "User", // Replace with authenticated user
      });

      showSnackbar("Slot booked successfully!", "success");
      fetchBookedSlots(selectedDate.toISOString());
      fetchCalendarData();
    } catch (error) {
      showSnackbar("Error booking slot", "error");
    }
  };

  const deleteSlot = async (slotId) => {
    try {
      await axios.delete(`/api/slots?id=${slotId}`);
      showSnackbar("Slot deleted successfully!", "success");
      fetchBookedSlots(selectedDate.toISOString());
      fetchCalendarData();
    } catch (error) {
      showSnackbar("Error deleting slot", "error");
    }
  };

  const updateSlot = async (slotId, newSlot) => {
    try {
      await axios.put(`/api/slots?id=${slotId}`, {
        startTime: newSlot.startTime.toISOString(),
        endTime: newSlot.endTime.toISOString(),
      });

      showSnackbar("Slot updated successfully!", "success");
      fetchBookedSlots(selectedDate.toISOString());
      fetchCalendarData();
      setSelectedSlot(null);
    } catch (error) {
      showSnackbar("Error updating slot", "error");
    }
  };

  const handleUpdateSlot = (newSlot) => {
    if (!selectedSlot) {
      showSnackbar("Please select a slot to update.", "error");
      return;
    }

    // Ensure the new slot is not already booked
    const isBooked = bookedSlots.some(
      (bookedSlot) =>
        bookedSlot.startTime.getTime() === newSlot.startTime.getTime()
    );

    if (isBooked) {
      showSnackbar("Cannot update to a booked slot.", "error");
      return;
    }

    const updatedSlot = {
      ...selectedSlot,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
    };

    updateSlot(selectedSlot._id, updatedSlot);
  };

  const getTileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateKey = startOfDay(date).toISOString().split("T")[0];
      const slotCount = calendarData[dateKey] || 0;

      if (slotCount === 0) return "bg-red-600 text-white";
      if (slotCount === 1) return "bg-orange-500 text-white";
      if (slotCount >= 2 && slotCount <= 4) return "bg-yellow-400 text-black";
      if (slotCount === 5) return "bg-green-500 text-white";
    }
    return "";
  };

  const handleSlotSelect = (slot) => {
    const updatedSlot = {
      ...slot,
      startTime: new Date(slot.startTime),
      endTime: new Date(slot.endTime),
    };
    setSelectedSlot(updatedSlot);
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 rounded-xl shadow-lg">
      <h1 className="text-4xl font-bold text-center text-indigo-700 mb-8">
        Time Slot Scheduler
      </h1>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Calendar Section */}
        <div className="w-full md:w-2/3 bg-white p-4 rounded-lg shadow-lg">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={getTileClassName}
            minDate={new Date()}
          />
        </div>

        {/* Time Slots Section */}
        <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-indigo-600 mb-4">
            {selectedDate.toDateString()} - Time Slots
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {timeSlots.map((slot, index) => {
              const isBooked = bookedSlots.some(
                (bookedSlot) =>
                  bookedSlot.startTime.getTime() === slot.startTime.getTime()
              );

              const isSelected =
                selectedSlot?.startTime?.getTime() ===
                slot.startTime.getTime();

              return (
                <button
                  key={index}
                  disabled={isBooked}
                  className={`p-4 border rounded-lg text-lg font-medium transition duration-300 ease-in-out ${
                    isBooked
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-indigo-500 text-white hover:bg-indigo-700"
                  } ${isSelected ? "bg-green-600" : ""}`}
                  onClick={() => {
                    if (selectedSlot) {
                      handleUpdateSlot(slot);
                      setSelectedSlot(null);
                    } else if (!isBooked) {
                      bookSlot(slot);
                    }
                  }}
                >
                  {slot.startTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {slot.endTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {isBooked && (
                    <span className="ml-2 text-sm text-red-500">
                      (Booked)
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <h2 className="text-xl font-bold text-indigo-600 mt-6">
            Booked Slots
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {bookedSlots.map((slot) => (
              <div
                key={slot._id}
                className="flex justify-between items-center p-4 border rounded-lg bg-gray-200"
              >
                <span>
                  {slot.startTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {slot.endTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <div className="flex gap-2">
                  <button
                    className={`p-2 text-white rounded-lg ${
                      selectedSlot?._id === slot._id
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {selectedSlot?._id === slot._id ? "Cancel" : "Update"}
                  </button>
                  <button
                    className="p-2 bg-red-600 text-white rounded-lg"
                    onClick={() => deleteSlot(slot._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Snackbar */}
      {snackbar.isVisible && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar({ isVisible: false, message: "", type: "" })}
        />
      )}
    </div>
  );
};

export default Dashboard;
