# Setting up the project 

[Firebase docs](https://firebase.google.com/docs/web/setup)

1) Create project in Firebase console. 
  - https://console.firebase.google.com/ 
  - project created at https://console.firebase.google.com/project/grouptripper-3c7f1/overview
  - create firestore database, region EU from console
    - created DB: https://console.firebase.google.com/project/grouptripper-3c7f1/firestore/data/
    - For now, DB allows access from anyone. TODO: [define security rules](https://firebase.google.com/docs/rules/get-started?hl=en)
      ```
      rules_version = '2';

        service cloud.firestore {
            match /databases/{database}/documents {
                match /{document=**} {
                allow read, write: if true;
                }
            }
        }
      ```
      set to false to allow no access
      - https://firebase.google.com/docs/rules/basics#content-owner_only_access
      - https://firebase.google.com/docs/rules/insecure-rules#closed_access
  - set Default GCP resource location to eur3 from https://console.firebase.google.com/project/grouptripper-3c7f1/settings/general
  - click on <> from project console overview to set up hosting. App nickname: 'grouptripper'. Keep firebaseConfig on the side (A)
  - https://grouptripper-3c7f1.web.app/
2) Create node project 
  - `cd "C:\Users\ventafri\Desktop\Uni\year 3\UniFinalProject"`
  - `npm init`
  - Install packages for the first time and update dependencies in package.json
    - `npm install firebase firebase-tools express ejs moment --save`
    - `npm install -g firebase-tools`
    - Development dependency: `npm install webpack webpack-cli --save -D`
3) Set up firebase functions and emulators
   - `cd "C:\Users\ventafri\Desktop\Uni\year 3\UniFinalProject"`
   - `firebase login:ci` (https://firebase.google.com/docs/cli#sign-in-test-cli)
     - Success! Use this token to login on a CI server: '1//09I3knoa81iJFCgYIARAAGAkSNwF-L9Ir0HFPAA71Zn_4cWn8q1EZtvcbMOrEVo-yiFswFVdbpDVEzwyvERE8q0pHI1SqpSHK6q8' Example: firebase deploy --token "$FIREBASE_TOKEN"
     - `firebase projects:list --token "1//09I3knoa81iJFCgYIARAAGAkSNwF-L9Ir0HFPAA71Zn_4cWn8q1EZtvcbMOrEVo-yiFswFVdbpDVEzwyvERE8q0pHI1SqpSHK6q8"`
   - `firebase init --token "1//09I3knoa81iJFCgYIARAAGAkSNwF-L9Ir0HFPAA71Zn_4cWn8q1EZtvcbMOrEVo-yiFswFVdbpDVEzwyvERE8q0pHI1SqpSHK6q8"`
     - select functions and emulator
4) create /functions/index.js and paste content gotten from Firebase console. It's safe to have on client side: https://www.youtube.com/watch?v=rQvOAnNvcNQ&t=97s min 2:20. Need to use these 2 to secure app:
   - https://firebase.google.com/docs/rules
   - https://firebase.google.com/docs/app-check/web/recaptcha-provider 

5) start emulator and test locally
    ```
    cd "C:\Users\ventafri\Desktop\Uni\year 3\UniFinalProject"
    firebase emulators:start --only firestore,functions,hosting   <-- otherwise there are auth problems in verifying tokens
    http://localhost:5004/home
    ```
5) if you need to clone repo and reinstall dependencies:
   ```
   cd "C:\Users\ventafri\Desktop\Uni\year 3\UniFinalProject"
   npm install --save 
   cd "C:\Users\ventafri\Desktop\Uni\year 3\UniFinalProject\functions"
   npm install --save 
   ```

6) Deploying site
   - firebase login 
   - firebase deploy -m "Deploying the best new feature ever."
   - view site at https://grouptripper-3c7f1.web.app

7) create budget alerts:
   - https://firebase.google.com/docs/projects/billing/avoid-surprise-bills#set-up-budget-alert-emails 
   - https://cloud.google.com/billing/docs/how-to/budgets?hl=it
   - create budget: 'budget_grouptripper'
   - amount: specified amount 10 euros
   - alerts via email billing owners when: 
     - forecasted expense = 5 euros
     - actual expense is 5 euros
     - actual expense is 10 euros
   - all budgets: https://console.cloud.google.com/billing/010523-E34926-64B7B7/budgets?hl=it&organizationId=0

8) Enable authentication with email and password:
   - https://firebase.google.com/docs/auth/web/password-auth
   - enabled email and password from console
9) Use Firebase Admin SDK for backend
    - https://console.firebase.google.com/project/grouptripper-3c7f1/settings/serviceaccounts/adminsdk
    - 

# useful links: 

- for firebase.json config: 
  - https://firebase.google.com/docs/hosting/full-config 
  - https://lucidar.me/en/firebase/express-web-server-on-firebase/ 

- Test, preview, deploy: https://firebase.google.com/docs/hosting/test-preview-deploy 
- Roll back deployment: https://firebase.google.com/docs/cli#roll_back_deploys and other CLi commands
- https://cloud.google.com/billing/docs/how-to/budgets-programmatic-notifications?hl=it
- implementing content in multiple languages: https://developers.google.com/search/blog/2010/09/unifying-content-under-multilingual
- svg to ico: https://redketchup.io/icon-editor









