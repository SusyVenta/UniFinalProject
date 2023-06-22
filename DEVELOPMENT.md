# Setting up the project 

[Firebase docs](https://firebase.google.com/docs/web/setup)

1) Create project in Firebase console. https://console.firebase.google.com/ 
  - project created at https://console.firebase.google.com/project/grouptripper-8c189/overview
2) click on <> to set up hosting. App nickname: 'grouptripper'
3) Go to root of the project: `cd "C:\Users\ventafri\Desktop\Uni\year 3\UniFinalProject"`
4) `npm init`
5) Install packages for the first time and update dependencies in package.json
   - `npm install firebase firebase-tools express ejs moment --save`
   - Development dependency: `npm install webpack webpack-cli --save -D`
   - `npm install --global serve` then `serve dist/` to see static file
6) create /src/index.js and paste content gotten from Firebase console. It's safe to have on client side: https://www.youtube.com/watch?v=rQvOAnNvcNQ&t=97s min 2:20. Need to use these 2 to secure app:
   - https://firebase.google.com/docs/rules
   - https://firebase.google.com/docs/app-check/web/recaptcha-provider 
7) Follow instructions to use webpack https://firebase.google.com/docs/web/module-bundling#using_firebase_with_webpack in order to minimize packages used
   `npm run build`

7) Deploy firebase hosting
   - firebase login
   - firebase init
   - firebase deploy
   - view site at https://grouptripper-8c189.web.app/




