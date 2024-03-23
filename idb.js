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

// Utility function to format a date object into "dd/mm/yyyy" format.
function formatDate(date) {
	let day = date.getDate().toString().padStart(2, '0'); // Ensures two digits
	let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Accounts for zero-based indexing
	let year = date.getFullYear();

	return `${day}/${month}/${year}`;
}

// Object encapsulating operations for interacting with IndexedDB
const idb = {
	// Asynchronously opens (and initializes if necessary) a database with the specified name and version.
	async openCaloriesDB(dbName, version) {
		const dbOpenRequest = indexedDB.open(dbName, version);

		// Sets up the database structure on initial creation or when upgrading.
		dbOpenRequest.onupgradeneeded = (event) => {
			const db = event.target.result;
			if (!db.objectStoreNames.contains('calories')) {
				db.createObjectStore('calories', { autoIncrement: true });
			}
		};

		return new Promise((resolve, reject) => {
			dbOpenRequest.onerror = () => reject('Failed to open db');

			dbOpenRequest.onsuccess = () => {
				const db = dbOpenRequest.result;
				resolve({
					// Adds a calorie entry to the store. Current date is used if none provided.
					async addCalories(calorieEntry) {
						if (!calorieEntry.date) {
							calorieEntry.date = formatDate(new Date());
						} else {
							calorieEntry.date = formatDate(
								new Date(calorieEntry.date)
							);
						}

						const transaction = db.transaction(
							'calories',
							'readwrite'
						);
						const store = transaction.objectStore('calories');
						const request = store.add(calorieEntry);

						return new Promise((resolve, reject) => {
							request.onerror = () =>
								reject('Failed to add calorie entry');
							request.onsuccess = () => resolve(true);
						});
					},

					// Fetches calorie entries from the store, optionally filtering by month and year.
					async getReport(month, year) {
						return new Promise((resolve, reject) => {
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
									const [, entryMonth, entryYear] = entry.date
										.split('/')
										.map(Number);

									if (
										(!month && !year) ||
										(entryMonth === month &&
											entryYear === year)
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
				});
			};
		});
	},
};

// Exposes the 'idb' object globally for use in other scripts.
window.idb = idb;
