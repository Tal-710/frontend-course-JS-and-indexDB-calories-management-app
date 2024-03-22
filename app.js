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
	//---------------- Page Set Up and Declarations
	initializeApp();

	function initializeApp() {
		bindUIElements(); //line 27
		initializeDatabaseAndDisplayReports(); //line 56
		setupEventListeners(); //line 66
	}

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
	//---------------------------/

	
	
	
	
	
	
	
	
	
	
	
	// 1. Initialize the database
	function initializeDatabaseAndDisplayReports() {
		window.idb
			.openCaloriesDB('caloriesdb', 1)
			.then(getAllReports) // line 196
			.catch((error) =>
				console.error('Database initialization failed:', error)
			);
	}

	// 2. Set up Listeners to UI objects and bind them with their handler functions
	function setupEventListeners() {
		ui.saveBtn.addEventListener('click', handleSaveButtonClick); //line 111
		ui.toggleReportType.addEventListener(
			'change',
			handleToggleReportTypeChange //line 154
		);
		ui.monthSelector.addEventListener('change', getReportByMonthAndYear); //line 204
		ui.yearSelector.addEventListener('change', getReportByMonthAndYear); //line  204
		fillYearDropdown(); //line 166

		// When adding new item - > reportArea to show all reports
		$('#addRecordModal').on('show.bs.modal', function () {
			// Check if the toggleReportType is on, if yes, switch it off
			if (ui.toggleReportType.checked) {
				ui.toggleReportType.checked = false;
				// Optionally, call the handler to adjust UI accordingly if needed
				handleToggleReportTypeChange.call(ui.toggleReportType); //line 158
			}
		});
	}

























	// 3. Save button click event = add new Item
	function handleSaveButtonClick() {
		// 3.1 Get values from html
		const dateValue = ui.dateInput.value
			? new Date(ui.dateInput.value)
			: new Date();
		const caloriesValue = parseInt(ui.caloriesInput.value, 10);
		const categoryValue = ui.categorySelect.value; // Get selected category value
		const descriptionValue = ui.descriptionTextarea.value; // Get description text value
		// 3.2 construct an object
		const calorieEntry = {
			date: dateValue.toISOString(),
			month: dateValue.getMonth() + 1, // JS months are 0-indexed
			year: dateValue.getFullYear(),
			calorie: caloriesValue,
			category: categoryValue, // Use the value from the category select
			description: descriptionValue, // Use the value from the description textarea
		};

		// 3.3 idb.js API func: add Item
		window.idb
			.openCaloriesDB('caloriesdb', 1)
			.then((db) => {
				return db.addCalories(calorieEntry).then(() => {
					console.log('Calorie entry added');
					handleClearFormInputs(); // Clears form inputs after adding an entry
					// - line 149
					$('#addRecordModal').modal('hide'); // Using jQuery to hide the modal

					// After adding a new entry, fetch and display all entries
					getAllReports(db); // Pass the db instance to getAllReports - line 196
				});
			})
			.catch((error) =>
				console.error('Failed to add calorie entry:', error)
			);
	}

	// 3.4 clear form inputs after saving a record
	function handleClearFormInputs() {
		ui.dateInput.value = '';
		ui.caloriesInput.value = '';
		ui.categorySelect.value = 'BREAKFAST'; // Reset to default
		ui.descriptionTextarea.value = '';
	}

	// 4. set up index.html -> getting calories by month and year
	// 4.1 toggleReportType
	function handleToggleReportTypeChange() {
		ui.dateSelectors.style.display = this.checked ? 'block' : 'none';
		getReportByMonthAndYear(); // line 205
	}




	// 4.2 dynamic 10 years dropdown filler
	function fillYearDropdown() {
		const currentYear = new Date().getFullYear();
		for (let year = currentYear; year >= currentYear - 10; year--) {
			const option = document.createElement('option');
			option.value = year;
			option.textContent = year;
			ui.yearSelector.appendChild(option);
		}
	}

	// 5. Function to render entries to be use in 5.1 and 5.2
	function renderEntries(entries) {
		ui.reportArea.innerHTML = ''; // Clear previous report
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

	// 5.1 display All calorie items from database
	function getAllReports(db) {
		// idb.js API func: add Item
		db.getReport()
			.then(renderEntries) //line 178
			.catch((error) =>
				console.error('Failed to fetch calorie entries:', error)
			);
	}
	// 5.2 display Specific calorie items, based on selections
	function getReportByMonthAndYear() {
		const month = toggleReportType.checked
			? parseInt(ui.monthSelector.value, 10)
			: undefined;
		const year = toggleReportType.checked
			? parseInt(ui.yearSelector.value, 10)
			: undefined;

		window.idb
			.openCaloriesDB('caloriesdb', 1)
			.then((db) => db.getReport(month, year)) // idb.js API func: 
			// get by month and year
			.then(renderEntries) //line 178
			.catch((error) => console.error('Failed to fetch reports:', error));
	}
});