# Time Slot Scheduler

This is a **Time Slot Scheduler** application built with **Next.js**, **React.js**, and **MongoDB**. The app allows users to select, book, update, and delete time slots for a particular date. The calendar view displays available and booked slots with a clear visual representation of availability.

## Features

### Calendar View
- **Visual Calendar**: Displays a calendar where each date can have slots that are either:
  - **No Slots** (Gray)
  - **Few Slots** (Green)
  - **Some Slots** (Yellow)
  - **Fully Booked** (Red)
- **Dynamic Date Selection**: Users can select a date, and the available time slots for that date are displayed.

### Time Slot Management
- **Time Slots**: Displays available time slots between 12 PM and 5 PM for the selected date.
- **Booking**: Users can book available time slots. A visual cue (color change) indicates the booked slots.
- **Update**: Users can update an existing slot, ensuring it doesn't conflict with other bookings.
- **Delete**: Users can delete booked slots, freeing them up for other users.

### Snackbar Notifications
- Displays **success** and **error** messages to provide feedback on actions such as booking, updating, or deleting slots.

### Responsive Design
- The UI is fully responsive, ensuring a smooth experience on both mobile and desktop devices.

## Tech Stack

- **Frontend**: Next.js (React.js)
- **Backend**: API routes in Next.js
- **Database**: MongoDB for storing slot data
- **Styling**: Tailwind CSS for responsive and modern UI
- **Calendar**: React-Calendar for the calendar view

## Video Demonstration

You can watch a demo of the application here:

[Time Slot Scheduler Demo](https://youtu.be/r7pRZ_Fg8Sk)

## Deployed Link

You can access the deployed version of the app here:

[Time Slot Scheduler - Live](https://mamotechnolabs-qkrk.vercel.app)

## How to Run Locally

### Prerequisites

1. Node.js installed on your machine
2. MongoDB database set up locally or via a cloud service like MongoDB Atlas
3. Clone the repository:

```bash
git clone https://github.com/yourusername/timeslot-scheduler.git
```
4. Navigate to the project directory:
```bash
cd timeslot-scheduler
```
5. Install dependencies:
 ```bash
npm install
```
6. Set up MongoDB connection:
```bash
MONGODB_URI=your_mongodb_connection_string
```
7. Run the development server:
```bash
npm run dev
```
