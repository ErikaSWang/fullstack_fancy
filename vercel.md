# Instructions for deploying on Vercel

## 3 Key modifications

1. vite.config.js
- need to add a 'build' to scripts
    (the npm install is for the client folder dependencies)

2. EITHER:

a) server.js
- guess production versions need to 'build' the app (or the react part)?
- NEED TO EITHER:
    i. Point to the vite default build folder, which is client/dist, AND
        Then, on Vercel need to add the following to override the vite default:
            - npm run build (the default)
            - client/dist (NOT the vercel default)
            - npm install (this is the root version, also the default)
    
    ii. Point to the vercel default build folder, which is public, AND
        Then in vite.config.js, add:
            - the 'outDir' to override the vite default

b) vercel.json
- need to create a new file
    (which has a lot of JSON have never seen before)



## VERCEL IS 1-CLICK!

## With Supabase & Redis - MUST ATTACH .env FILE!!