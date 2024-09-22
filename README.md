# Periodic Element Table Application: Angular + TypeScript + SCSS + Angular Material + RxAngular

## Live Demo

### A live version of the application is available at: [Demo Link](https://olafchuszno.github.io/elements-demo/)

### To start the application locally on your machine:
* Open Terminal or Command Prompt.
* Clone the repository: run this command git clone https://github.com/olafchuszno/elements-demo.git in your terminal.
* Navigate to your project directory: cd your-repo.
* Install dependencies: run this command npm install.
* Start the app: run this command npm start.
* Stop the server when done with (Ctrl + C).

## Key Features
* Data Editing: Users can edit any element's properties using a popup with input fields for changes. The table updates dynamically without mutating the original data.
* Dynamic Filtering: A filter input allows users to filter results across all columns, applying the filter after a 2-second debounce to enhance performance.

## Technologies Used
* Angular 18.2.2: For building the user interface and handling application logic.
* TypeScript: For static type-checking, ensuring code reliability and maintainability.
* SCSS: For modular and maintainable styling.
* Angular Material: For pre-built UI components and a modern design.
* RxAngular: For application state management.

## External Libraries
Angular Material: Used to implement UI components and ensure a consistent look and feel.
RxJS: For reactive programming and handling asynchronous operations.
RxAngular: For application state management.

## Overview The application simulates data retrieval of chemical elements using an initial dataset and displays it in a structured table format with the following columns:

* Number
* Name
* Weight
* Symbol

## App Features
* Element Data Retrieval: Simulates fetching element data at application startup.
* Editable Table Rows: Each row in the table can be edited through a popup, allowing users to change values without altering the original data set.
* Debounced Filtering: The application includes a filter input that allows users to filter results across all fields, with a delay of 2 seconds to enhance user experience and performance.
