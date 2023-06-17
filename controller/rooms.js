const date = require("date-and-time");

const db = require("../util/db");

exports.createRoom = (req, res, next) => {
  const {
    category: new_category,
    facilities: new_facilities,
    included: new_included,
    maxAdult: new_maxAdult,
    maxChild: new_maxChild,
    maxGuests: new_maxGuests,
    roomNo: new_roomNo,
    size: new_size,
    price: new_price,
  } = req.body;

  db.query(
    "insert into rooms (category, facilities, included, max_adult, max_child, max_guests, room_no, size, price) values ($1, $2, $3, $4, $5, $6 ,$7, $8, $9)",
    [
      new_category,
      new_facilities,
      new_included,
      new_maxAdult,
      new_maxChild,
      new_maxGuests,
      new_roomNo,
      new_size,
      new_price,
    ]
  )
    .then((data) => {
      res.json({ message: "room successfully created !" });
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json({ message: "Room no. already exists !" });
    });
};

exports.allRoom = (req, res, next) => {
  db.query("select * from rooms").then((data) => {
    const formatedData = data.map((room) => {
      return {
        category: room.category,
        facilities: room.facilities,
        included: room.included,
        maxAdult: room.max_adult,
        maxChild: room.max_child,
        maxGuests: room.max_guests,
        roomNo: room.room_no,
        size: room.size,
        price: room.price,
      };
    });
    res.json({ allRoom: formatedData });
  });
};

exports.deleteRoom = (req, res, next) => {
  const { roomNo } = req.body;
  db.query("delete from rooms where room_no = $1", [roomNo])
    .then((data) => {
      res.json({ message: "Room successfully deleted !" });
    })
    .catch((err) => {
      res.status(500).json({ message: "something bed happened!" });
    });
};

exports.editRoom = (req, res, next) => {
  const {
    category,
    facilities,
    included,
    maxAdult,
    maxChild,
    maxGuests,
    roomNo,
    size,
    price,
  } = req.body;

  db.query(
    "update rooms set category = $1, facilities = $2, included = $3, max_adult = $4, max_child = $5, max_guests = $6, size = $7,  price=$8 where room_no = $9",
    [
      category,
      facilities,
      included,
      maxAdult,
      maxChild,
      maxGuests,
      size,
      price,
      roomNo,
    ]
  )
    .then((data) => {
      res.json({ message: "successfully edited!" });
    })
    .catch((err) => {
      res.status(500).json({ message: "something bed happened!" });
    });
};

exports.customerQuery = (req, res, next) => {
  const { contactNo, message = "non", name, subject } = req.body;

  const dateNow = new Date();
  const dateOfQuery = date.format(dateNow, "YYYY-MM-DD");
  db.query(
    "insert into callback (contact_no, date_of_query, message, name, subject) values ($1, $2, $3, $4, $5)",
    [contactNo, dateOfQuery, message, name, subject]
  )
    .then((data) => {
      res.json({
        message: "Your query successfully received. We callback you soon",
      });
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).json({ message: "Something bad happened!" });
    });
};

exports.getAllQuery = (req, res, next) => {
  db.query("select * from callback")
    .then((data) => {
      const formatedData = data.map((query) => {
        const formatedDate = date.format(query.date_of_query, "DD-MM-YYYY");

        return {
          contactNo: query.contact_no,
          dateOfQuery: formatedDate,
          subject: query.subject,
          message: query.message,
          customerName: query.name,
          queryId: query.query_id,
        };
      });
      res.json(formatedData);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).json({ message: "Something bad happened!" });
    });
};

exports.queryCleared = (req, res, next) => {
  const { queryId } = req.body;
  db.query("delete from callback where query_id = $1", [queryId])
    .then((data) => {
      res.json({ message: "Query successfully deleted !" });
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).json({ message: "Something bad happened!" });
    });
};

exports.getBookingData = (req, res, next) => {
  const { bookingId } = req.body;

  db.query("select * from booking where booking_id = $1", [bookingId]).then(
    (data) => {
      const room = data[0];
      if (room === undefined) {
        res.status(400).json({ message: "booking id doesn't exist!" });
        return;
      }

      const formatedBookingDate = date.format(
        room.date_of_booking,
        "DD-MM-YYYY"
      );
      const formatedCheckInDate = date.format(room.check_in, "DD-MM-YYYY");
      const formatedCheckOutDate = date.format(room.check_out, "DD-MM-YYYY");
      const formatedData = {
        bookingId: room.booking_id,
        checkIn: formatedCheckInDate,
        checkOut: formatedCheckOutDate,
        customerEmail: room.customer_email,
        dateOfBooking: formatedBookingDate,
        noOfAdult: room.no_of_adult,
        noOfChild: room.no_of_child,
        price: room.price,
        roomNo: room.room_no,
        customerName: room.name,
      };
      res.json({ bookingData: formatedData });
    }
  );
};

exports.checkIn = (req, res, next) => {
  const { adultIds, bookingId, customerEmail, paymentMode, price } = req.body;
  const { username } = req.tokenData;

  db.query("select * from booked where booking_id = $1", [bookingId]).then(
    (data) => {
      if (data.length > 0) {
        res.status(405).json({ message: "Already check-in !" });
        return;
      }
      db.query(
        "insert into booked (adult_ids, booking_id, customer_email, payment_mode, price, check_in_by) values ($1,$2,$3,$4,$5,$6)",
        [adultIds, bookingId, customerEmail, paymentMode, price, username]
      )
        .then((data) => {
          res.json({ message: "Successfully checked in ." });
        })
        .catch((err) => {
          console.error(err.message);
          res.status(500).json({ message: "something bad happen on server !" });
        });
    }
  );
};

exports.checkOut = (req, res, next) => {
  res.json({ message: "Guests successfully checked out!" });
};

exports.getAvailableRoom = (req, res, next) => {
  const { checkIn, checkOut, noOfAdult, noOfChild } = req.body;
  db.query(
    "select * from rooms where room_no not in (select room_no from booking where check_in = $1::date or check_out = $2::date or (check_in between $1::date and $2::date) or (check_out between $1::date and $2::date))",
    [checkIn, checkOut]
  )
    .then((availableRooms) => {
      console.log(availableRooms);
      const filtered = availableRooms.filter((room) => {
        if (room.max_guests >= Number(noOfChild) + Number(noOfAdult)) {
          return true;
        }
      });
      console.log("filtered", filtered);
      const formatedData = filtered.map((room) => {
        return {
          category: room.category,
          facilities: room.facilities,
          included: room.included,
          maxAdult: room.max_adult,
          maxChild: room.max_child,
          maxGuests: room.max_guests,
          roomNo: room.room_no,
          size: room.size,
          price: room.price,
        };
      });
      res.json({ availableRooms: formatedData });
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).json({ message: "something bad happen on server !" });
    });
};

exports.bookRoom = (req, res, next) => {
  const { checkIn, checkOut, noOfChild, noOfAdult, price, roomNo, name } =
    req.body;

  const { email: customerEmail } = req.tokenData;

  const now = new Date();
  const formatedDate = date.format(now, "YYYY-MM-DD");

  db.query(
    "insert into booking (check_in, check_out, customer_email, no_of_adult, no_of_child, price, room_no, date_of_booking, name) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
    [
      checkIn,
      checkOut,
      customerEmail,
      Number(noOfAdult),
      Number(noOfChild),
      Number(price),
      roomNo,
      formatedDate,
      name,
    ]
  )
    .then((data) => {
      res.json({ message: "Room booked successfully !" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "something bad happen on server !" });
    });
};

exports.cancelBooking = (req, res, next) => {
  const { bookingId } = req.body;
  const { email } = req.tokenData;

  db.query("delete from booking where booking_id = $1", [bookingId])
    .then((data) => {
      res.json({ message: "Booking successfully canceled !" });
    })
    .catch((err) => {
      console.error(err.message);
    });
};

exports.getPresentBookings = (req, res, next) => {
  const { email } = req.tokenData;

  const now = new Date();
  const formatedDate = date.format(now, "YYYY-MM-DD");

  db.query(
    "select * from booking where customer_email = $1 and check_in >= $2::date and booking_id not in (select booking_id from booked where customer_email = $1) order by booking_id",
    [email, formatedDate]
  )
    .then((data) => {
      const formatedData = data.map((room) => {
        const formatedCheckInDate = date.format(room.check_in, "DD/MM/YYYY");
        const formatedCheckOutDate = date.format(room.check_out, "DD/MM/YYYY");
        const formatedDateOfBooking = date.format(
          room.date_of_booking,
          "DD/MM/YYYY"
        );

        return {
          bookingId: room.booking_id,
          checkIn: formatedCheckInDate,
          checkOut: formatedCheckOutDate,
          dateOfBooking: formatedDateOfBooking,
          noOfAdult: room.no_of_adult,
          noOfChild: room.no_of_child,
          price: room.price,
          roomType: room.room_type,
        };
      });
      res.json({ presentBookings: formatedData });
    })
    .catch((err) => {
      res.status(500).json({ message: "something bad happen on server !" });
      console.error(err);
    });
};

exports.getPastBookings = (req, res, next) => {
  const { email } = req.tokenData;

  db.query(
    "select * from booking where booking_id in (select booking_id from booked where customer_email = $1)",
    [email]
  ).then((data) => {
    const formatedData = data.map((room) => {
      const formatedDateOfBooking = date.format(
        room.date_of_booking,
        "DD/MM/YYYY"
      );
      const formatedCheckInDate = date.format(room.check_in, "DD/MM/YYYY");
      const formatedCheckOutDate = date.format(room.check_out, "DD/MM/YYYY");
      return {
        bookingId: room.booking_id,
        checkIn: formatedCheckInDate,
        checkOut: formatedCheckOutDate,
        dateOfBooking: formatedDateOfBooking,
        noOfAdult: room.no_of_adult,
        noOfChild: room.no_of_child,
        price: room.price,
      };
    });
    res.json({ pastBookings: formatedData });
  });
};
