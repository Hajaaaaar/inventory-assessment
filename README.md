# Inventory Management Challenge

This repository contains my submission for a coding assessment. It is a full-stack application designed to manage and view product inventory with a focus on performance and user experience.

##  Key Features

* **View Modes:** Toggle between a detailed List view and a responsive Grid view.
* **Performance:** Implemented `react-window` for virtualization, allowing the app to render thousands of items smoothly without lagging.
* **Smart Search:** Includes a debounced search input to minimize unnecessary API calls.
* **URL Synchronization:** State (page, search query, view mode) is synced with the URL, so users can bookmark or share exact states.
* **Responsive Design:** The Grid view dynamically calculates column counts based on the screen width.

## Tech Stack

* **Frontend:** React, React Router v6, React Window (Virtualization)
* **State Management:** Context API + Custom Hooks
* **Backend:** Node.js / Express (Mock API)
* **Testing:** Jest & React Testing Library

## How to Run

1.  **Backend:** `cd backend && npm install && npm start` (Runs on port 5000)
2.  **Frontend:** `cd frontend && npm install && npm start` (Runs on port 3000)
3.  **Tests:** Run `npm test` in either directory.

## Screenshots

<img width="1208" height="681" alt="ItemsList" src="https://github.com/user-attachments/assets/83f91b0c-b41f-4037-a9fd-136cb274201e" />
<img width="1388" height="681" alt="ItemsGrid" src="https://github.com/user-attachments/assets/59bd1714-a1a6-473a-aa6a-7b8c4e30249b" />
<img width="892" height="511" alt="ItemsDetail" src="https://github.com/user-attachments/assets/9cf7aa29-db53-4a06-ac96-63d6dea925f3" />


