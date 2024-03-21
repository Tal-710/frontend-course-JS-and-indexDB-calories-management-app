//----------------- ADDED FUNCTION FOR DATE formatting-----------------
function formatDate(date) {
	let day = date.getDate();
	let month = date.getMonth() + 1; // Months are zero-based
	let year = date.getFullYear();

	// Pad the day and month with a leading zero if they are less than 10
	day = day < 10 ? '0' + day : day;
	month = month < 10 ? '0' + month : month;

	// Return the formatted date string
	return day + '/' + month + '/' + year;
}
//-----------------------END DATA FORMATTER---------------------------------------

// It assumes the existence of an 'idb' global object that facilitates working with IndexedDB.
const idb = {
	// 1. initialize work with indexDB
	async openCaloriesDB(dbName, version) {
		const dbOpenRequest = indexedDB.open(dbName, version);
		// 2. Create or upgrade the database schema if necessary
		dbOpenRequest.onupgradeneeded = (event) => {
			const db = event.target.result;
			if (!db.objectStoreNames.contains('calories')) {
				db.createObjectStore('calories', { autoIncrement: true });
			}
		};
		// 3. On accessing Index db
		return new Promise((resolve, reject) => {
			// 3.1: On error -> approaching IndexDB
			dbOpenRequest.onerror = () => reject('Failed to open db');
			// 3.2: On success -> ref the indexDB access to "db"
			dbOpenRequest.onsuccess = () => {
				// 4
				const db = dbOpenRequest.result;
				// 5. attach the different functionality to db, when access to indexDB is success
				const dbAPI = {
					// 1) API func: add Item
					async addCalories(calorieEntry) {
						return new Promise((resolve, reject) => {
							// 1.1: in case user not provide date
							const currentDate = new Date();
							if (!calorieEntry.date) {
								// 1.2: "date" not provided-> format and use current date
								calorieEntry.date = formatDate(currentDate);
							} else {
								// 1.3: "date" is provided-> format it and add it
								calorieEntry.date = formatDate(
									new Date(calorieEntry.date)
								);
							}

							//2: run Transaction process
							const transaction = db.transaction(
								'calories',
								'readwrite'
							);
							const store = transaction.objectStore('calories');
							const request = store.add(calorieEntry);
							//--

							// 2.1: Transaction error
							request.onerror = () =>
								reject('Failed to add calorie entry');
							//--

							// 2.2: Transaction success 
							request.onsuccess = () => resolve(true);
						});
					},

					// 2) API func: fetch all calorie entries. Optionally filters by month and year if provided.
					async getReport(month, year) {
						return new Promise((resolve, reject) => {
							// Checks if both month and year are provided for filtering
							const filterByDate =
								month !== undefined && year !== undefined;

							const transaction = db.transaction(
								'calories',
								'readonly'
							);
							const store = transaction.objectStore('calories');
							const request = store.openCursor();
							const results = [];

							request.onerror = () =>
								reject('Failed to fetch calorie entries');
							request.onsuccess = (event) => {
								const cursor = event.target.result;
								if (cursor) {
									const entry = cursor.value;
									if (
										!filterByDate ||
										(entry.month === month &&
											entry.year === year)
									) {
										results.push(entry);
									}
									cursor.continue();
								} else {
									resolve(results);
								}
							};
						});
					},
				};
				resolve(dbAPI);
			};
		});
	},
};

// Expose 'idb' to the global scope to make it accessible in the HTML script
window.idb = idb;
