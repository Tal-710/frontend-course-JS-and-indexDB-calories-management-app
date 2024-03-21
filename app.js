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

document.addEventListener('DOMContentLoaded', function () {
	// Reference to the modal save button and form elements
	const saveBtn = document.getElementById('saveRecordBtn');
	const dateInput = document.getElementById('date');
	const caloriesInput = document.getElementById('calories');
	const categorySelect = document.getElementById('category'); // Reference to category select
	const descriptionTextarea = document.getElementById('description'); // Reference to description textarea
	const reportArea = document.getElementById('reportArea');
	//---------------------------/
	const toggleReportType = document.getElementById('toggleReportType');
	const dateSelectors = document.getElementById('dateSelectors');
	const monthSelector = document.getElementById('monthSelector');
	const yearSelector = document.getElementById('yearSelector');
	const currentYear = new Date().getFullYear();
	//---------------------------/

	// 1. Initialize the database
	window.idb
		.openCaloriesDB('caloriesdb', 1)
		.then(function (db) {
			console.log('Database initialized');
			// Load and display the report for the current month
			displayReport(db);
		})
		.catch((error) =>
			console.error('Database initialization failed:', error)
		);

	// 2. Save button click event
	saveBtn.addEventListener('click', function () {
		const dateValue = dateInput.value
			? new Date(dateInput.value)
			: new Date();
		const caloriesValue = parseInt(caloriesInput.value, 10);
		const categoryValue = categorySelect.value; // Get the selected category value
		const descriptionValue = descriptionTextarea.value; // Get the description text value

		const calorieEntry = {
			date: dateValue.toISOString(),
			month: dateValue.getMonth() + 1, // JS months are 0-indexed
			year: dateValue.getFullYear(),
			calorie: caloriesValue,
			category: categoryValue, // Use the value from the category select
			description: descriptionValue, // Use the value from the description textarea
		};

		// 1) API func: add Item
		window.idb
			.openCaloriesDB('caloriesdb', 1)
			.then((db) => {
				return db.addCalories(calorieEntry);
			})
			.then(() => {
				console.log('Calorie entry added');
				// Clear form inputs
				dateInput.value = '';
				caloriesInput.value = '';
				categorySelect.value = 'BREAKFAST';
				descriptionTextarea.value = '';
				// Display the updated report
				return window.idb.openCaloriesDB('caloriesdb', 1);
			})
			.then((db) => {
				displayReport(db);
				// Hide the modal
				$('#addRecordModal').modal('hide');
			})
			.catch((error) =>
				console.error('Failed to add calorie entry:', error)
			);
	});

	// 3. display calorie report
	function displayReport(db) {
		const currentDate = new Date();
		const currentMonth = currentDate.getMonth() + 1; // JS months are 0-indexed
		const currentYear = currentDate.getFullYear();

		db.getReport()
			.then((results) => {
				// Clear previous report
				reportArea.innerHTML = '';
				if (results.length > 0) {
					const list = document.createElement('ul');
					list.className = 'list-group';
					results.forEach((entry) => {
						const listItem = document.createElement('li');
						listItem.className = 'list-group-item';
						listItem.textContent = `Description: ${entry.description}, Calories: ${entry.calorie}, Category: ${entry.category}, Date: ${entry.date}`;
						list.appendChild(listItem);
					});
					reportArea.appendChild(list);
				} else {
					reportArea.textContent =
						'No records found for the current month.';
				}
			})
			.catch((error) =>
				console.error('Failed to fetch calorie entries:', error)
			);
	}

	// 4.display calorie By month and year
	//toggleReportType
	toggleReportType.addEventListener('change', function () {
		if (this.checked) {
			// Show month and year selectors
			dateSelectors.style.display = 'block';
			fetchAndDisplayReport();
		} else {
			// Hide month and year selectors and show all reports
			dateSelectors.style.display = 'none';
			fetchAndDisplayReport(); // Call without parameters to fetch all
		}
	});
	// 4.2 dynamic 10 years dropdown filler
	for (let year = currentYear; year >= currentYear - 10; year--) {
		const option = document.createElement('option');
		option.value = year;
		option.textContent = year;
		yearSelector.appendChild(option);
	}

	// 4.3 Fetch and display report based on selections
	function fetchAndDisplayReport() {
		const month = toggleReportType.checked
			? parseInt(monthSelector.value, 10)
			: undefined;
		const year = toggleReportType.checked
			? parseInt(yearSelector.value, 10)
			: undefined;

		window.idb
			.openCaloriesDB('caloriesdb', 1)
			.then((db) => {
				if (typeof month === 'number' && typeof year === 'number') {
					return db.getReport(month, year); // Fetch filtered report
				} else {
					return db.getReport(); // Fetch all reports
				}
			})
			.then((results) => {
				reportArea.innerHTML = '';
				if (results.length > 0) {
					const list = document.createElement('ul');
					list.className = 'list-group';
					results.forEach((entry) => {
						const listItem = document.createElement('li');
						listItem.className = 'list-group-item';
						// Here you need to adjust the display according to your entry structure
						listItem.textContent = `Description: ${entry.description}, Calories: ${entry.calorie}, Category: ${entry.category}, Date: ${entry.date}`;
						list.appendChild(listItem);
					});
					reportArea.appendChild(list);
				} else {
					reportArea.textContent = 'No records found.';
				}
			})
			.catch((error) => console.error('Failed to fetch reports:', error));
	}

	// Attach event listeners to month and year selectors to fetch report on change
	monthSelector.addEventListener('change', fetchAndDisplayReport);
	yearSelector.addEventListener('change', fetchAndDisplayReport);
});
