import { db } from '../lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

/**
 * Permanently purges all mock/demo documents from Firestore collections
 * so the platform is completely blank and ready for real production usage.
 */
export async function clearAllDemoDataFromFirestore(): Promise<void> {
  const collectionsToClear = [
    'coaches',
    'sessions',
    'bookings',
    'chatMessages',
    'customRequests',
    'waitlist',
    'reviews',
    'notifications'
  ];

  for (const colName of collectionsToClear) {
    try {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        console.log(`Clearing ${snapshot.docs.length} demo records from '${colName}'...`);
        const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, colName, d.id)));
        await Promise.all(deletePromises);
        console.log(`Successfully purged collection '${colName}'.`);
      }
    } catch (err) {
      console.warn(`Could not clear collection '${colName}':`, err);
    }
  }
}
