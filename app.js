document.addEventListener('DOMContentLoaded', function () {
	// Reference to the modal save button and form elements
	const saveBtn = document.getElementById('saveRecordBtn');
	const dateInput = document.getElementById('date');
	const caloriesInput = document.getElementById('calories');
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
		const date = new Date(dateInput.value);
		const month = date.getMonth() + 1; // JS months are 0-indexed
		const year = date.getFullYear();
		const calories = parseInt(caloriesInput.value, 10);

		const calorieEntry = {
			date: date.toISOString(),
			month,
			year,
			calories,
		};

		// Add calorie record to the database
		window.idb.openCaloriesDB('caloriesdb', 1).then((db) => {
			db.addCalories(calorieEntry)
				.then(() => {
					console.log('Calorie entry added');
					// Clear form inputs
					dateInput.value = '';
					caloriesInput.value = '';
					// Display the updated report
					displayReport(db);
					// Hide the modal
					$('#addRecordModal').modal('hide');
				})
				.catch((error) =>
					console.error('Failed to add calorie entry:', error)
				);
		});
	});

	// Function to display calorie report
	function displayReport(db) {
		const currentDate = new Date();
		const currentMonth = currentDate.getMonth() + 1; // JS months are 0-indexed
		const currentYear = currentDate.getFullYear();

		db.getReport(currentMonth, currentYear)
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
						listItem.textContent = `Description: ${entry.description}, Calories: ${entry.calorie}, Category: ${entry.category}`;
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
