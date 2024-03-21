// It assumes the existence of an 'idb' global object that facilitates working with IndexedDB.

const idb = {
	async openCaloriesDB(dbName, version) {
		const dbOpenRequest = indexedDB.open(dbName, version);

		// Create or upgrade the database schema if necessary
		dbOpenRequest.onupgradeneeded = (event) => {
			const db = event.target.result;
			if (!db.objectStoreNames.contains('calories')) {
				db.createObjectStore('calories', { autoIncrement: true });
			}
		};

		return new Promise((resolve, reject) => {
			// error -> approaching IndexDB
			dbOpenRequest.onerror = () => reject('Failed to open db');
			//--

			// success -> ref the indexDB access to "db"
			dbOpenRequest.onsuccess = () => {
				const db = dbOpenRequest.result;
				// attach the different functionality to db, when access to indexDB is success
				const dbAPI = {
					//
					async addCalories(calorieEntry) {
						return new Promise((resolve, reject) => {
							// added logic - check if month & year provided, if not = assign it with current data
							const currentDate = new Date();
							calorieEntry.month =
								calorieEntry.month ||
								currentDate.getMonth() + 1; // JS months are 0-indexed
							calorieEntry.year =
								calorieEntry.year || currentDate.getFullYear();
							//---

							//--execute Transaction process
							const transaction = db.transaction(
								'calories',
								'readwrite'
							);
							const store = transaction.objectStore('calories');
							const request = store.add(calorieEntry);
							//--

							// error -> approaching IndexDB
							request.onerror = () =>
								reject('Failed to add calorie entry');
							//--

							// success -> resolve(true)
							request.onsuccess = () => resolve(true);
						});
					},

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
									if (
										entry.month === month &&
										entry.year === year
									) {
										results.push(entry);
									}
									cursor.continue();
								} else {
									// Resolved with all fetched entries
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
