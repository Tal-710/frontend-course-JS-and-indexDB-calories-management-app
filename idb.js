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
	// 1. initialize work with indexDB as the test tell to create idb object with openCaloriesDB nested sub class
	async openCaloriesDB(dbName, version) {
		// 1.1 dbOpenRequest <- ref to open connection to indexdb
		const dbOpenRequest = indexedDB.open(dbName, version);
		// 1.2 Create or upgrade the database schema if necessary
		dbOpenRequest.onupgradeneeded = (event) => {
			// 1.3 db <- ref the events that accrues in our dataBase
			const db = event.target.result;
			// 1.4 if no such dataBase -> create
			if (!db.objectStoreNames.contains('calories')) {
				db.createObjectStore('calories', { autoIncrement: true });
			}
		};
		// 1.5 end of initialization

		// 2. declare Promises for different actions
		return new Promise((resolve, reject) => {
			// 2.1: On error approaching IndexDB
			dbOpenRequest.onerror = () => reject('Failed to open db');
			// 2.2: On success -> ref the open access to dbName->'calories' database
			dbOpenRequest.onsuccess = () => {
				// 3. db <- Ref to db access
				const db = dbOpenRequest.result;
				// 4. attach the different functionality to db, when access to indexDB is success
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

							//1.4: run Transaction process
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

					// 2) API func: fetch all calorie entries. Optionally filters by month and year if provided.
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
									// 2.3 Check if entry.date exists and is a string before splitting
									if (typeof entry.date === 'string') {
										const [
											entryDay,
											entryMonth,
											entryYear,
										] = entry.date
											.split('/')
											.map((part) => parseInt(part, 10));

										// 2.4 Your existing logic to decide if the entry should be included
										if (
											!month ||
											!year ||
											(entryMonth === month &&
												entryYear === year)
										) {
											results.push(entry);
										}
									} else {
										console.warn(
											'Entry missing valid date:',
											entry
										);
										results.push(entry);
										// Optionally handle the case where the date is missing or invalid
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
