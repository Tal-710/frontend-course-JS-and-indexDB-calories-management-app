document.addEventListener('DOMContentLoaded', function () {
	// Reference to the modal save button and form elements
	const saveBtn = document.getElementById('saveRecordBtn');
	const dateInput = document.getElementById('date');
	const caloriesInput = document.getElementById('calories');
	const categorySelect = document.getElementById('category'); // Reference to category select
	const descriptionTextarea = document.getElementById('description'); // Reference to description textarea
	const reportArea = document.getElementById('reportArea');

	// Initialize the database
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

	// Save button click event
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

	// Function to display calorie report
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
						// Adjusted to display the description and calorie values correctly
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
});
