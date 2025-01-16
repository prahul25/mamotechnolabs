"use client";

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import axios from "axios";

const startOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const Snackbar = ({ message, type, onClose }) => (
  <div
    className={`fixed bottom-4 left-4 px-6 py-3 rounded-md shadow-lg text-white text-sm transition duration-300 ease-in-out ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    }`}
    role="alert"
  >
    {message}
    <button className="ml-4 text-white font-bold underline" onClick={onClose}>
      Close
    </button>
  </div>
);

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState([]);
  const [calendarData, setCalendarData] = useState({});
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [editMode, setEditMode] = useState(null);
  const [snackbar, setSnackbar] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  useEffect(() => {
    fetchBookedSlots(selectedDate.toISOString());
    fetchCalendarData();
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

  const showSnackbar = (message, type) => {
    setSnackbar({ isVisible: true, message, type });
    setTimeout(
      () => setSnackbar({ isVisible: false, message: "", type: "" }),
      3000
    );
  };

  const bookSlot = async () => {
    if (!startTime || !endTime) {
      showSnackbar("Please select both start and end times", "error");
      return;
    }

    const start = new Date(selectedDate.getTime());
    const end = new Date(selectedDate.getTime());

    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    start.setHours(startHours, startMinutes, 0, 0);
    end.setHours(endHours, endMinutes, 0, 0);

    if (start >= end) {
      showSnackbar("End time must be after start time", "error");
      return;
    }

    const isOverlapping = bookedSlots.some(
      (slot) =>
        (start >= slot.startTime && start < slot.endTime) ||
        (end > slot.startTime && end <= slot.endTime) ||
        (start <= slot.startTime && end >= slot.endTime)
    );

    if (isOverlapping) {
      showSnackbar("Selected time overlaps with an existing booking", "error");
      return;
    }

    try {
      if (editMode) {
        await axios.put(`/api/slots?id=${editMode._id}`, {
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        });
        showSnackbar("Slot updated successfully!", "success");
      } else {
        await axios.post("/api/slots", {
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          createdBy: "User",
        });
        showSnackbar("Slot booked successfully!", "success");
      }

      setStartTime("");
      setEndTime("");
      setEditMode(null);
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

  const handleEdit = (slot) => {
    setStartTime(slot.startTime.toTimeString().slice(0, 5));
    setEndTime(slot.endTime.toTimeString().slice(0, 5));
    setEditMode(slot);
  };

  const getTileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateKey = startOfDay(date).toISOString().split("T")[0];
      const slotCount = calendarData[dateKey] || 0;
console.log(dateKey,slotCount,"ss")
      if (slotCount === 0) return "react-calendar__tile--empty";
      if (slotCount === 1) return "react-calendar__tile--few-slots";
      if (slotCount >= 2 && slotCount <= 4)
        return "react-calendar__tile--some-slots";
      if (slotCount >= 5) return "react-calendar__tile--fully-booked";
    }
    return "";
  };

  return (
    <div className="flex flex-wrap bg-gradient-to-r from-blue-50 to-indigo-100 pt-6 px-6 min-h-screen gap-4">
      {/* calendar section */}
      <div className="flex-grow bg-white px-6 py-2 shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold text-blue-800 mb-2">
          Select a Date
        </h2>
        <h3 className="text-lg font-medium text-gray-700">
          Selected Date: {selectedDate.toDateString()}
        </h3>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileClassName={getTileClassName}
          minDate={new Date()}
          className="react-calendar"
        />

        <div className="mt-4 w-full">
          <h3 className="text-lg font-medium mb-2">Legend:</h3>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded-full mr-2"></div>
              No Slots
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-300 rounded-full mr-2"></div>
              Few Slots
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-300 rounded-full mr-2"></div>
              Some Slots
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-400 rounded-full mr-2"></div>
              Fully Booked
            </div>
          </div>
        </div>
      </div>

      {/* update slot section */}
      <div className="flex-grow bg-white p-4 shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">
          Book/Update Slot
        </h2>

        <div className="flex gap-4 items-center mb-6">
          <label className="flex-grow">
            <span>Start Time:</span>
            <input
              type="time"
              className="block w-full p-2 border rounded-md"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </label>
          <label className="flex-grow">
            <span>End Time:</span>
            <input
              type="time"
              className="block w-full p-2 border rounded-md"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </label>
          <button
            className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-700"
            onClick={bookSlot}
          >
            {editMode ? "Update Slot" : "Book Slot"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {bookedSlots.length > 0 ? (
            bookedSlots.map((slot) => (
              <div
                key={slot._id}
                className="p-4 border rounded-lg shadow-sm bg-gray-100 flex flex-col justify-between"
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
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-700"
                    onClick={() => handleEdit(slot)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-700"
                    onClick={() => deleteSlot(slot._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center">No slots booked yet.</p>
          )}
        </div>
      </div>

      {snackbar.isVisible && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() =>
            setSnackbar({ isVisible: false, message: "", type: "" })
          }
        />
      )}
    </div>
  );
};

export default Dashboard;
