// Proper way to initialize and share the Database object

// Loading and initializing the library:
const pgp = require("pg-promise")({
  // Initialization Options
});

// Preparing the connection details:
// const cn = "postgres://tcs_admin:root@localhost:5432/tcs_ion";
const cn = `postgres://${process.env.username}:${process.env.password}@dpg-ckcduvesmu8c73c6fj2g-a.singapore-postgres.render.com/hotel_booking_qh7d?ssl=true`;

// Creating a new database instance from the connection details:
const db = pgp(cn);

// Exporting the database object for shared use:
module.exports = db;
