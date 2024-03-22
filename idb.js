/*
    developers:
        1. developer
        first name: Amit, 
        last name": Pompas, 
        id: 315072397,
        2. developer
        first name: Lior, 
        last name": Bezalel, 
        id: 207015249,
        3. developer
        first name: Tal, 
        last name": Brachya, 
        id: 318660859,  
*/
//idb.js

// format date object into "dd/mm/yyyy" format
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

// Defines an 'idb' object for interacting with IndexedDB
const idb = {
	// 1. Initialize or open a database with a given name and version
	async openCaloriesDB(dbName, version) {
		// 1.1 dbOpenRequest <- ref to open connection to indexdb
		const dbOpenRequest = indexedDB.open(dbName, version);
		dbOpenRequest.onupgradeneeded = (event) => {
			// Handle database upgrades, including initial creation
			const db = event.target.result;
			if (!db.objectStoreNames.contains('calories')) {
				db.createObjectStore('calories', { autoIncrement: true });
			}
		};

		// 2. Return a promise that resolves with the database API on success
		return new Promise((resolve, reject) => {
			// 2.1: custom error:On error approaching IndexDB
			dbOpenRequest.onerror = () => reject('Failed to open db');
			// 2.2: On success -> ref the open access to dbName->'calories' database
			dbOpenRequest.onsuccess = () => {
				// 3. db <- Ref to db access
				const db = dbOpenRequest.result;
				// 4. attach functionality to db, when access to indexDB is success
				const dbAPI = {
					// 1) API func: add Item
					//(fills current date if not provided)
					async addCalories(calorieEntry) {
						return new Promise((resolve, reject) => {
							const currentDate = new Date();
							if (!calorieEntry.date) {
								calorieEntry.date = formatDate(currentDate);
							} else {
								calorieEntry.date = formatDate(
									new Date(calorieEntry.date)
								);
							}

							// run Transaction process
							const transaction = db.transaction(
								'calories',
								'readwrite'
							);
							const store = transaction.objectStore('calories');
							const request = store.add(calorieEntry);

							// 1.5: addCalories Transaction error
							request.onerror = () =>
								reject('Failed to add calorie entry');

							// 1.6: addCalories Transaction success
							request.onsuccess = () => resolve(true);
						});
					},

					// 2) API func: fetch all entries
					//(Optionally filters by month,year if provided)
					async getReport(month, year) {
						return new Promise((resolve, reject) => {
							// 2.1 set transaction process
							const transaction = db.transaction(
								'calories',
								'readonly'
							);
							const store = transaction.objectStore('calories');
							const request = store.openCursor();
							const results = [];
							// 2.2 getReport onerror
							request.onerror = () =>
								reject('Failed to fetch calorie entries');
							// 2.2 getReport onsuccess
							request.onsuccess = (event) => {
								const cursor = event.target.result;
								if (cursor) {
									const entry = cursor.value;
									// Parse the entry's date to extract month and year
									const [, entryMonth, entryYear] = entry.date
										.split('/')
										.map((part) => parseInt(part, 10));

									if (!month && !year) {
										// Case 1: Month, year not provided, push all entries
										results.push(entry);
									} else if (month && year) {
										// Case 2: Both month, year provided-> filter entries
										if (
											entryMonth === month &&
											entryYear === year
										) {
											results.push(entry);
										}
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
