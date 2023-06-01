const bcrypt = require("bcryptjs");

const db = require("../util/db");
const { generateToken } = require("../util/jwt");

exports.getManagementData = (req, res, next) => {
  const { username } = req.tokenData;
  db.query("select * from management where username = $1", [username]).then(
    (data) => {
      const user = data[0];
      if (user === undefined) {
        res.status(401).json({ message: "Not a valid user !" });
        return;
      }
      res.json({
        name: user.name,
        isAdmin: user.is_admin,
        employeeId: user.employee_id,
      });
    }
  );
};

exports.managementLogin = (req, res, next) => {
  const { username, password } = req.body;
  db.query("select * from management where username = $1", [username])
    .then((userData) => {
      const user = userData[0];
      if (user === undefined) {
        const error = new Error(
          "User does not exist ! Please check enter right username."
        );
        error.statusCode = 404;
        throw error;
      }
      if (user.password !== password) {
        const error = new Error("Please enter correct password !");
        error.statusCode = 401;
        throw error;
      }
      const token = generateToken({
        username: username,
        isAdmin: user.is_admin,
      });
      res.json({
        name: user.name,
        employeeId: user.employee_id,
        isAdmin: user.is_admin,
        token: token,
      });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(err.statusCode).json({ message: err.message });
    });
};

exports.getCustomerData = (req, res, next) => {
  const { email } = req.tokenData;
  db.query("select * from customer where email = $1", [email]).then((data) => {
    const user = data[0];
    if (user === undefined) {
      res.status(401).json({ message: "Not a valid user !" });
      return;
    }
    res.json({
      isAuthenticated: true,
      user: {
        customerName: `${user.first_name} ${
          user.last_name === "non" ? "" : user.last_name
        }`,
        email: user.email,
        contactNo: user.contact_no,
      },
    });
  });
};

exports.createUser = (req, res, next) => {
  const {
    isAdmin: new_isAdmin,
    username: new_username,
    name: new_name,
    governmentId: new_governmentId,
    age: new_age,
    password: new_password,
    address: new_address,
  } = req.body;
  db.query(
    "insert into management (is_admin, username, name, government_id, age, password, address) values ($1, $2, $3, $4, $5, $6, $7)",
    [
      new_isAdmin,
      new_username,
      new_name,
      new_governmentId,
      new_age,
      new_password,
      new_address,
    ]
  )
    .then((data) => {
      res.json({ message: "user successfully created!" });
    })
    .catch((err) => {
      res.status(409).json({ message: "username already exists !" });
    });
};

exports.customerLogin = (req, res, next) => {
  const { email, password } = req.body;
  let user;
  db.query("select * from customer where email = $1", [email])
    .then((data) => {
      user = data[0];
      if (user === undefined) {
        res.status(404).json({
          message: "Account doesn't exists, Please create you accounts!",
        });
        throw new Error("User not exists");
      }
      return bcrypt.compare(password, user.password);
    })
    .then((campareResult) => {
      if (!campareResult) {
        res.status(401).json({ message: "Please enter valid password !" });
        throw new Error("password not match");
      }
      const token = generateToken({ email: email });
      res.json({
        token: token,
        isAuthenticated: true,
        user: {
          customerName: `${user.first_name} ${
            user.last_name === "non" ? "" : user.last_name
          }`,
          email: user.email,
          contactNo: user.contact_no,
        },
      });
    })
    .catch((err) => {
      console.error(err.message);
    });
};

exports.createCustomer = (req, res, next) => {
  const {
    contactNo,
    email,
    firstName,
    lastName = "non",
    forgetQuestionType,
    forgetQuestionAnswer,
    password,
  } = req.body;
  bcrypt.hash(password, 12).then((hashPassword) => {
    db.query(
      "insert into customer (contact_no, email, first_name, forget_question_answer, forget_question_type, last_name, password) values ($1, $2, $3, $4, $5, $6, $7)",
      [
        contactNo,
        email,
        firstName,
        forgetQuestionAnswer,
        forgetQuestionType,
        lastName,
        hashPassword,
      ]
    )
      .then((data) => {
        res.json({ message: "Account successfully created !" });
      })
      .catch((err) => {
        console.error(err.message);
        res
          .status(400)
          .json({ message: "Your email and contact no. already exist !" });
      });
  });
};

exports.forgetPassword = (req, res, next) => {
  const { email, forgetQuestionType, forgetQuestionAnswer } = req.body;

  db.query("select * from customer where email = $1", [email]).then((data) => {
    const user = data[0];
    if (user === undefined) {
      res.status(400).json({ message: "Account doesn't exists !" });
    } else {
      const { forget_question_answer, forget_question_type } = user;
      if (
        forgetQuestionAnswer !== forget_question_answer ||
        forgetQuestionType !== forget_question_type
      ) {
        res
          .status(401)
          .json({ message: "Wrong selected question or answer !" });
        return;
      }
      const token = generateToken({
        email: user.email,
      });
      res.json({ token: token });
    }
  });
};

exports.setNewPassword = (req, res, next) => {
  const { password } = req.body;
  const { email } = req.tokenData;

  bcrypt.hash(password, 12).then((hashPassword) => {
    db.query("select * from customer where email = $1", [email]).then(
      (data) => {
        const user = data[0];
        if (user === undefined) {
          res.status(401).json({ message: "Unauthorised request" });
          return;
        }
        db.query("update customer set password = $1 where email = $2", [
          hashPassword,
          email,
        ]).then((data) => {
          res.json({ message: "Your password successfully reseted !" });
        });
      }
    );
  });
};

exports.resetPassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const { email } = req.tokenData;

  db.query("select * from customer where email = $1", [email])
    .then((data) => {
      const user = data[0];
      if (user === undefined) {
        res.status(400).json({ message: "User doesn't exists !" });

        throw new Error("User doesn't exists!");
      }
      return bcrypt.compare(currentPassword, user.password);
    })
    .then((compareResult) => {
      if (!compareResult) {
        res
          .status(401)
          .json({ message: "please enter right current password !" });
        throw new Error("Wrong password!");
      }
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashPassword) => {
      return db.query("update customer set password = $1 where email = $2", [
        hashPassword,
        email,
      ]);
    })
    .then((result) => {
      res.json({ message: "Your new password successfully set !" });
    })
    .catch((err) => {
      console.error(err.message);
    });
};
