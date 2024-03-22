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
		bindUIElements(); //line 28
		initializeDatabaseAndDisplayReports(); //line 45
		setupEventListeners(); //line 54
	}

	// Reference to the modal save button and form elements
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
			.then(getAllReports) // line 145
			.catch((error) =>
				console.error('Database initialization failed:', error)
			);
	}

	// 2. Set up Listeners to UI objects and bind them with their corresponding handler functions
	function setupEventListeners() {
		ui.saveBtn.addEventListener('click', handleSaveButtonClick); //line 67
		ui.toggleReportType.addEventListener(
			'change',
			handleToggleReportTypeChange //line 110
		);
		ui.monthSelector.addEventListener('change', getReportByMonthAndYear); //line 153
		ui.yearSelector.addEventListener('change', getReportByMonthAndYear); //line  153
		fillYearDropdown();
	}

	// 3. Save button click event = add new Item
	function handleSaveButtonClick() {
		// 3.1
		const dateValue = ui.dateInput.value
			? new Date(ui.dateInput.value)
			: new Date();
		const caloriesValue = parseInt(ui.caloriesInput.value, 10);
		const categoryValue = ui.categorySelect.value; // Get the selected category value
		const descriptionValue = ui.descriptionTextarea.value; // Get the description text value
		// 3.2
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
					handleClearFormInputs(); // Clears form inputs after adding an entry -> line 100
					$('#addRecordModal').modal('hide'); // Using jQuery to hide the modal
				});
			})
			.catch((error) =>
				console.error('Failed to add calorie entry:', error)
			);
	}

	// 4. clear form inputs after saving a record
	function handleClearFormInputs() {
		ui.dateInput.value = '';
		ui.caloriesInput.value = '';
		ui.categorySelect.value = 'BREAKFAST'; // Reset to default or another desired value
		ui.descriptionTextarea.value = '';
	}

	// 5. set up index.html -> getting calories by month and year
	// 5.1 toggleReportType
	function handleToggleReportTypeChange() {
		ui.dateSelectors.style.display = this.checked ? 'block' : 'none';
		getReportByMonthAndYear(); // line 152
	}

	// 5.2 dynamic 10 years dropdown filler
	function fillYearDropdown() {
		const currentYear = new Date().getFullYear();
		for (let year = currentYear; year >= currentYear - 10; year--) {
			const option = document.createElement('option');
			option.value = year;
			option.textContent = year;
			ui.yearSelector.appendChild(option);
		}
	}

	// 6. Function to render entries to be use in 6.1 and 6.2
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

	// 6.1 display All calorie items from database
	function getAllReports(db) {
		db.getReport()
			.then(renderEntries) //line 127
			.catch((error) =>
				console.error('Failed to fetch calorie entries:', error)
			);
	}
	// 6.2 display Specific calorie items, based on selections
	function getReportByMonthAndYear() {
		const month = toggleReportType.checked
			? parseInt(ui.monthSelector.value, 10)
			: undefined;
		const year = toggleReportType.checked
			? parseInt(ui.yearSelector.value, 10)
			: undefined;

		window.idb
			.openCaloriesDB('caloriesdb', 1)
			.then((db) => db.getReport(month, year))
			.then(renderEntries)
			.catch((error) => console.error('Failed to fetch reports:', error));
	}
});
