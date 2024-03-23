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
	//------------1 build page---------------
	initializeApp();
	function initializeApp() {
		bindUIElements();
		setupEventListeners();
		initializeDatabaseAndDisplayReports();
	}
	// use the global object to bind UI elements
	function bindUIElements() {
		window.ui = {
			saveBtn: document.getElementById('saveRecordBtn'),
			dateInput: document.getElementById('date'),
			caloriesInput: document.getElementById('calories'),
			categorySelect: document.getElementById('category'),
			descriptionTextarea: document.getElementById('description'),
			reportArea: document.getElementById('reportArea'),
			toggleReportType: document.getElementById('toggleReportType'),
			dateSelectors: document.getElementById('dateSelectors'),
			monthSelector: document.getElementById('monthSelector'),
			yearSelector: document.getElementById('yearSelector'),
		};
	}
	// Set up Listeners to UI objects and bind them with their handler functions
	function setupEventListeners() {
		ui.saveBtn.addEventListener('click', handleSaveButtonClick);
		ui.toggleReportType.addEventListener(
			'change',
			handleToggleReportTypeChange
		);
		ui.monthSelector.addEventListener('change', getReportByMonthAndYear);
		ui.yearSelector.addEventListener('change', getReportByMonthAndYear);
		fillYearDropdown();
		setupModalBehavior();
	}
	// when entering Modal = reportArea to show all reports
	function setupModalBehavior() {
		$('#addRecordModal').on('show.bs.modal', function () {
			if (ui.toggleReportType.checked) {
				ui.toggleReportType.checked = false;
				handleToggleReportTypeChange.call(ui.toggleReportType);
			}
		});
	}
	// change state when entering monthly report
	function handleToggleReportTypeChange() {
		ui.dateSelectors.style.display = this.checked ? 'block' : 'none';
		getReportByMonthAndYear();
	}
	// dynamic 10 years dropdown filler
	function fillYearDropdown() {
		const currentYear = new Date().getFullYear();
		for (let year = currentYear; year >= currentYear - 10; year--) {
			const option = document.createElement('option');
			option.value = year;
			option.textContent = year;
			ui.yearSelector.appendChild(option);
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
		return ui.dateInput.value ? new Date(ui.dateInput.value) : new Date();
	}
	// Validation function
	function validateInputs() {
		const dateInput = ui.dateInput.value;
		const caloriesInput = ui.caloriesInput.value;
		const categorySelect = ui.categorySelect.value;
		const descriptionTextarea = ui.descriptionTextarea.value;

		// Date validation (simple check if the input is not empty and is a valid date)
		if (!dateInput || isNaN(new Date(dateInput).getTime())) {
			alert('Please enter a valid date.');
			return false;
		}

		// Calories validation (must be a positive number)
		if (
			!caloriesInput ||
			isNaN(caloriesInput) ||
			parseInt(caloriesInput, 10) <= 0
		) {
			alert('Please enter a valid calorie amount.');
			return false;
		}

		// Category validation (should not be empty)
		if (!categorySelect) {
			alert('Please select a category.');
			return false;
		}

		// Description validation (should not be empty)
		if (!descriptionTextarea.trim()) {
			alert('Please enter a description.');
			return false;
		}

		return true; // Passes all validations
	}
	//---------------------------------------------

	//------------3 add item process---------------
	// Save button click event = add new Item
	function handleSaveButtonClick() {
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
			calorie: parseInt(ui.caloriesInput.value, 10),
			category: ui.categorySelect.value,
			description: ui.descriptionTextarea.value.trim(),
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
						handleClearFormInputs();
						$('#addRecordModal').modal('hide');
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
		ui.dateInput.value = '';
		ui.caloriesInput.value = '';
		ui.categorySelect.value = 'BREAKFAST'; // Reset to default
		ui.descriptionTextarea.value = '';
	}
	//---------------------------------------------

	//------------4 print reports---------------
	// Function to render entries to be use in 4.1 and 4.2
	function renderEntries(entries) {
		ui.reportArea.innerHTML = '';
		if (entries.length > 0) {
			const list = document.createElement('ul');
			list.className = 'list-group';
			entries.forEach((entry) => {
				const listItem = document.createElement('li');
				listItem.className = 'list-group-item';
				listItem.textContent = `Description: ${entry.description}, Calories: ${entry.calorie}, Category: ${entry.category}, Date: ${entry.date}`;
				list.appendChild(listItem);
			});
			ui.reportArea.appendChild(list);
		} else {
			ui.reportArea.textContent = 'No records found.';
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
		const month = ui.toggleReportType.checked
			? parseInt(ui.monthSelector.value, 10)
			: undefined;
		const year = ui.toggleReportType.checked
			? parseInt(ui.yearSelector.value, 10)
			: undefined;

		window.idb
			.openCaloriesDB('caloriesdb', 1)
			.then((db) => db.getReport(month, year))
			.then(renderEntries)
			.catch((error) => console.error('Failed to fetch reports:', error));
	}
});
