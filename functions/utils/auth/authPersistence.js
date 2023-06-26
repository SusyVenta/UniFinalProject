import filesystem from 'fs';
import {
  inMemoryPersistence,
  updateCurrentUser
} from 'firebase/auth';
import { fileURLToPath } from 'url';
import path from "path";
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* 
https://stackoverflow.com/questions/55716608/persist-firebase-user-for-node-js-client-application
https://github.com/firebase/firebase-js-sdk/issues/1874 
*/

const authPersistenceFileName = path.join(__dirname, 'tmp', 'persistence.json');

export async function loadPersistence(auth) {

    console.log("|||||||||||||||| loadPersistence START");
    try {
        const persistence = JSON.parse( filesystem.readFileSync(authPersistenceFileName));

        // _initializeWithPersistence( persistenceHierarchy, popupRedirectResolver ) creates a `persistenceManager`
        await auth._initializeWithPersistence( inMemoryPersistence, null );
        // attach the persistence storage that we loaded from `persistence.json` 
        auth.persistenceManager.persistence.storage = persistence;
        // "sync" the authentication status across the whole auth module
        await updateCurrentUser(auth, await auth.persistenceManager.getCurrentUser());
        console.log("|||||||||||||||| loadPersistence DONE");
    } catch {
        return;
    }
    
    return;
}

export function savePersistence(auth) {
    console.log("|||||||||||||||| savePersistence start");
    filesystem.writeFileSync(authPersistenceFileName, 
                             JSON.stringify(auth.persistenceManager.persistence.storage));
    console.log("|||||||||||||||| savePersistence DONE");
}
