// This is a simplified version focusing on the specific test provided.
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
			dbOpenRequest.onerror = () => reject('Failed to open db');
			dbOpenRequest.onsuccess = () => {
				const db = dbOpenRequest.result;
				const dbAPI = {
					async addCalories(calorieEntry) {
						return new Promise((resolve, reject) => {
							const transaction = db.transaction(
								'calories',
								'readwrite'
							);
							const store = transaction.objectStore('calories');
							const request = store.add(calorieEntry);

							request.onerror = () =>
								reject('Failed to add calorie entry');
							request.onsuccess = () => resolve(true);
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
