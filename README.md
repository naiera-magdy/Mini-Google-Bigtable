# Mini-Google-Bigtable

## To run this project

1. Install nodemon

```
npm i -g nodemon
```

2. type the following command

```
npm install
```

3. To Seed the data to the database run the following command in the dev-data directory

```
node import-dev-data.js --import
```

4. To drop the database run the following command in the dev-data directory

```
node import-dev-data.js --delete
```

5. To run the master set the environments variables in the config.env file EX:

```
MASTER_PORT=<PORT>
DATABASE=mongodb://localhost:27017/BigTableLocal
```

6. To run the Tablet server set the environments variables in the config.env file EX:

```
MASTER_URL=http://<IP_ADDRESS>:<PORT>
TABLET_URL=http://<IP_ADDRESS>:<PORT>
TABLET_PORT=<PORT>
DATABASE=mongodb://localhost:27017/BigTableLocal1
```

7. Type the following command to run Master

```
npm run start:master
```

8. Type the following command to run Tablet server

```
npm run start:tablet
```
