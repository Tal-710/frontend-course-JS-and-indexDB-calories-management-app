/*
    developers:
        1. developer
        first name: Amit, 
        last name": Pompas, 
        id:315072397,
        2. developer
        first name: Lior, 
        last name": Bezalel, 
        id:207015249,
        3. developer
        first name: Tal, 
        last name": Brachya, 
        id:318660859,  
*/
// app.js
document.addEventListener('DOMContentLoaded', function () {
	//------------1 bd page---------------
	let saveBtn = document.getElementById('saveRecordBtn');
	let dateInput = document.getElementById('date');
	let caloriesInput = document.getElementById('calories');
	let categorySelect = document.getElementById('category');
	let descriptionTextarea = document.getElementById('description');
	let reportArea = document.getElementById('reportArea');
	let monthlyReportBtn = document.getElementById('monthlyReportBtn');
	let allReportBtn = document.getElementById('allReportBtn');
	let dateSelectors = document.getElementById('dateSelectors');
	let monthSelector = document.getElementById('monthSelector');
	let yearSelector = document.getElementById('yearSelector');
	let isMonthlyReport = false;

	function initializeApp() {
		setupEventListeners();
		initializeDatabaseAndDisplayReports();
	}
	initializeApp();

	// Set up Listeners to ui objects and bind them with their handler functions
	function setupEventListeners() {
		saveBtn.addEventListener('click', handleSaveButtonClick);
		monthlyReportBtn.addEventListener('click', function () {
			isMonthlyReport = true; // Set the flag to indicate monthly report is being requested
			dateSelectors.style.display = 'block'; // Show the selectors for monthly report
			getReportByMonthAndYear(); // Fetch and display the monthly report
		});

		// Listener for all reports button
		allReportBtn.addEventListener('click', function () {
			isMonthlyReport = false; // Reset the flag as we are requesting all reports
			dateSelectors.style.display = 'none'; // Hide the selectors for monthly report
			getAllReports(); // Fetch and display all reports
		});

		monthSelector.addEventListener('change', getReportByMonthAndYear);
		yearSelector.addEventListener('change', getReportByMonthAndYear);
		fillYearDropdown();
	}

	// dynamic 10 years dropdown filler
	function fillYearDropdown() {
		const currentYear = new Date().getFullYear();
		for (let year = currentYear; year >= currentYear - 10; year--) {
			const option = document.createElement('option');
			option.value = year;
			option.textContent = year;
			yearSelector.appendChild(option);
		}
	}

	// API func: Initialize the database
	function initializeDatabaseAndDisplayReports() {
		window.idb
			.openCaloriesDB('caloriesdb', 1)
			.then(getAllReports)
			.catch((error) =>
				console.error('Database initialization failed:', error)
			);
	}
	//---------------------------------------------

	//------------2 input validation---------------
	function getDateInputValue() {
		return dateInput.value ? new Date(dateInput.value) : new Date();
	}
	// Validation function
	function validateInputs() {
		// Date validation (simple check if the input is not empty and is a valid date)
		if (!dateInput.value || isNaN(new Date(dateInput.value).getTime())) {
			alert('Please enter a valid date.');
			return false;
		}

		// Calories validation (must be a positive number)
		if (
			!caloriesInput.value ||
			isNaN(caloriesInput.value) ||
			parseInt(caloriesInput.value, 10) <= 0
		) {
			alert('Please enter a valid calorie amount.');
			return false;
		}

		// Category validation (should not be empty)
		if (!categorySelect.value) {
			alert('Please select a category.');
			return false;
		}

		// Description validation (should not be empty)
		if (!descriptionTextarea.value.trim()) {
			alert('Please enter a description.');
			return false;
		}

		return true; // Passes all validations
	}
	//---------------------------------------------

	//------------3 add item process---------------
	// Save button click event = add new Item
	function handleSaveButtonClick() {
		resetReportView();
		if (!validateInputs()) {
			console.error(
				'Validation failed. Please correct the input fields.'
			);
			return;
		}
		const calorieEntry = {
			date: getDateInputValue(),
			month: getDateInputValue().getMonth() + 1,
			year: getDateInputValue().getFullYear(),
			calorie: parseInt(caloriesInput.value, 10),
			category: categorySelect.value,
			description: descriptionTextarea.value.trim(),
		};
		addCalorieEntry(calorieEntry);
	}

	// API func: add new Item
	function addCalorieEntry(calorieEntry) {
		window.idb
			.openCaloriesDB('caloriesdb', 1)
			.then((db) => {
				db.addCalories(calorieEntry)
					.then(() => {
						console.log('Calorie entry added');
						$('#addRecordModal').modal('hide');
						handleClearFormInputs();
						getAllReports();
					})
					.catch((error) => {
						console.error('Failed to add calorie entry:', error);
					});
			})
			.catch((error) => {
				console.error('Database operation failed:', error);
			});
	}

	// clear form inputs after saving a record
	function handleClearFormInputs() {
		dateInput.value = '';
		caloriesInput.value = '';
		categorySelect.value = 'BREAKFAST'; // Reset to default
		descriptionTextarea.value = '';
	}

	function resetReportView() {
		isMonthlyReport = false;
		dateSelectors.style.display = 'none';
	}
	//---------------------------------------------

	//------------4 print reports---------------
	// Function to render entries to be use in 4.1 and 4.2
	function renderEntries(entries) {
		reportArea.innerHTML = '';
		if (entries.length > 0) {
			const list = document.createElement('ul');
			list.className = 'list-group';
			entries.forEach((entry) => {
				const listItem = document.createElement('li');
				listItem.className = 'list-group-item';
				listItem.textContent = `Description: ${entry.description}, Calories: ${entry.calorie}, Category: ${entry.category}, Date: ${entry.date}`;
				list.appendChild(listItem);
			});
			reportArea.appendChild(list);
		} else {
			reportArea.textContent = 'No records found.';
		}
	}

	// display All calorie items from database
	function getAllReports() {
		window.idb
			.openCaloriesDB('caloriesdb', 1)
			.then((db) => db.getReport())
			.then(renderEntries)
			.catch((error) => console.error('Failed to fetch reports:', error));
	}
	// display Specific calorie items, based on selections
	function getReportByMonthAndYear() {
		const shouldGetMonthlyReport = dateSelectors.style.display === 'block';

		const month = isMonthlyReport
			? parseInt(monthSelector.value, 10)
			: undefined;
		const year = isMonthlyReport
			? parseInt(yearSelector.value, 10)
			: undefined;

		window.idb
			.openCaloriesDB('caloriesdb', 1)
			.then((db) => db.getReport(month, year))
			.then(renderEntries)
			.catch((error) => console.error('Failed to fetch reports:', error));
	}
});
