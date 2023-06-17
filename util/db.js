// Proper way to initialize and share the Database object

// Loading and initializing the library:
const pgp = require("pg-promise")({
  // Initialization Options
});

// Preparing the connection details:
// const cn = "postgres://tcs_admin:root@localhost:5432/tcs_ion";
// const cn = `postgres://${process.env.username}:${process.env.password}@dpg-ci6okh18g3nfucc60460-a.singapore-postgres.render.com/hotel_booking_jlj4`;
// const cn = `postgres://yuvraj:cY9lu2pEceLj1r0U1odwgXDeEVVVD3Ng@dpg-ci6okh18g3nfucc60460-a.singapore-postgres.render.com/hotel_booking_jlj4?ssl=true`;
const cn = `postgres://yuvraj:cY9lu2pEceLj1r0U1odwgXDeEVVVD3Ng@dpg-ci6okh18g3nfucc60460-a/hotel_booking_jlj4?ssl=true`;

// Creating a new database instance from the connection details:
const db = pgp(cn);

// Exporting the database object for shared use:
module.exports = db;
