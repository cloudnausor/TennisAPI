const output = require("../../_models/output");
const db_library = require("../../_helpers/db_library");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const appConfig = require("../../../../config/appConfig");
const mail_template = require("../../MailTemplate/mailTemplate");
const moment = require("moment");
const lang = require("../../../lang/language").franchContent;

exports.welcome = async function(req, res, next) {
  var _output = new output();
  _output.data = "API Running at 3004 Port";
  _output.isSuccess = true;
  _output.message = "Welcome to OhMyTennis API";
  res.send(_output);
};

exports.index = async function(req, res, next) {
  var _output = new output();
  await db_library
    .execute("SELECT * FROM `users`")
    .then(value => {
      var result = value[0];
      _output.data = result;
      _output.isSuccess = true;
      _output.message = "User Get Successfully";
    })
    .catch(err => {
      _output.data = {};
      _output.isSuccess = false;
      _output.message = "User Get Failed";
    });

  res.send(_output);
};

exports.registerUser = async function(req, res, next) {
  var _output = new output();
  const {
    firstName,
    lastName,
    email,
    gender,
    mobile,
    postalCode,
    cityId,
    password,
    roleId
  } = req.body;

  if (
    firstName != "" &&
    lastName != "" &&
    email != "" &&
    gender != "" &&
    mobile != "" &&
    postalCode != "" &&
    cityId != "" &&
    password != "" &&
    roleId != ""
  ) {
    var encry_pass = await bcrypt.hash(password, 10);

    var query =
      "INSERT INTO `users`(`firstName`, `lastName`, `email`, `gender`, `password`, `mobile`, `postalCode`, `cityId`, `roleId`, `isActive`)" +
      " VALUES (?,?,?,?,?,?,?,?,?,?);";

    var coach_query =
      "INSERT INTO `coaches_dbs`(`Coach_Fname`, `Coach_Lname`, `Coach_Email`, `Coach_Phone`, `Coach_Password`, `User_type`,`Coach_City`)" +
      " VALUES (?,?,?,?,?,?,?);";

    await db_library
      .execute("SELECT * FROM `users` WHERE email='" + email + "'")
      .then(async value => {
        var result = value;
        if (result.length == 0) {
          try {
            // let res = exports.insertUser(query);
            await db_library
              .parameterexecute(query, [
                firstName,
                lastName,
                email,
                gender,
                encry_pass,
                mobile,
                postalCode,
                cityId,
                roleId,
                1
              ])
              .then(val => {
                _output.data = val;
                _output.isSuccess = true;
                _output.message = "Register Successfully";
              })
              .catch(err => {
                _output.data = {};
                _output.isSuccess = false;
                _output.message = "Register failed";
              });
            if (roleId == 2) {
              await db_library
                .parameterexecute(coach_query, [
                  firstName,
                  lastName,
                  email,
                  mobile,
                  encry_pass,
                  "coach",
                  postalCode
                ])
                .then(value => {
                  _output.data = value;
                  _output.isSuccess = true;
                  _output.message = lang.coach_register;
                })
                .catch(err => {
                  _output.data = {};
                  _output.isSuccess = false;
                  _output.message = "Coach Register Failed";
                });
            }
            var mailTemplate = await mail_template.getMailTemplate(
              appConfig.MailTemplate.Register
            );
            const mailOption = require("../../_mailer/mailOptions");
            let _mailOption = new mailOption();
            _mailOption.to = email;
            _mailOption.subject = lang.registration_successful;
            var em = Buffer.from(email).toString("base64");
            var temp = mailTemplate[0].template;
            var temp1 = temp.replace("{{email}}", em);
            var temp2 = temp1.replace(
              "{{username}}",
              firstName + " " + lastName
            );
            _mailOption.html = temp2;
            var _mailer = require("../../_mailer/mailer");
            _mailer.sendMail(_mailOption);
          } catch (error) {
            _output.data = error;
            _output.isSuccess = false;
            _output.message = "Register Failed";
          }
        } else {
          _output.data = {};
          _output.isSuccess = false;
          _output.message = "UserEmail already Exist";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "Register Failed";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Register Failed";
  }

  res.send(_output);
};

exports.updateProfile = async function(req, res, next) {
  var _output = new output();
  const {
    Coach_Fname,
    Coach_Lname,
    Coach_Email,
    Coach_Phone,
    InstagramURL,
    TwitterURL,
    FacebookURL,
    Coach_Description,
    Coach_transport,
    Coach_Price,
    Coach_City,
    Coach_PriceX10,
    Coach_Services,
    Coach_payment_type,
    Coach_Bank_Name,
    Branch_Code,
    Coach_Bank_ACCNum,
    Coach_Bank_City,
    Coach_Rayon,
    Coach_Image,
    Coach_Resume,
    ResumeName
  } = req.body;

  if (
    Coach_Fname != "" &&
    InstagramURL != "" &&
    Coach_City != "" &&
    TwitterURL != "" &&
    FacebookURL != "" &&
    Coach_Lname != "" &&
    Coach_Email != "" &&
    Coach_Phone != "" &&
    Coach_Description != "" &&
    Coach_Price != "" &&
    Coach_PriceX10 != "" &&
    Coach_Services != "" &&
    Coach_Bank_Name != "" &&
    Branch_Code != "" &&
    Coach_Bank_ACCNum != "" &&
    Coach_Bank_City != "" &&
    Coach_Rayon != "" &&
    Coach_Image != "" &&
    Coach_Resume != ""
  ) {
    // var query = "INSERT INTO `users`(`firstName`, `lastName`, `email`, `gender`, `password`, `mobile`, `postalCode`, `cityId`, `roleId`, `isActive`)" +
    //     " VALUES ('" + firstName + "','" + lastName + "','" + email + "','" + gender + "','" + encry_pass + "','" + mobile + "','" + postalCode + "'," + cityId + "," + roleId + ",1);";

    var coach_query =
      "UPDATE `coaches_dbs` SET `Coach_Fname` =?, `Coach_Lname`=?, `Coach_Phone`=?, `InstagramURL`=?, `TwitterURL`=?, `FacebookURL`=?,`Coach_Description`=?,`Coach_transport`=?,`Coach_Price`=?,`Coach_PriceX10`=?,`Coach_Services`=?," +
      "`Coach_payment_type`=?,`Coach_City`=?,`Coach_Bank_Name`=?,`Branch_Code`=?,`Coach_Bank_ACCNum`=?,`Coach_Bank_City`=?,`Coach_Image`=?,`Coach_Resume`=?,`Coach_Rayon`=?,`ResumeName`=? WHERE `Coach_Email`=?;";

    await db_library
      .parameterexecute(coach_query, [
        Coach_Fname,
        Coach_Lname,
        Coach_Phone,
        InstagramURL,
        TwitterURL,
        FacebookURL,
        Coach_Description,
        Coach_transport,
        Coach_Price,
        Coach_PriceX10,
        Coach_Services,
        Coach_payment_type,
        Coach_City,
        Coach_Bank_Name,
        Branch_Code,
        Coach_Bank_ACCNum,
        Coach_Bank_City,
        Coach_Image,
        Coach_Resume,
        Coach_Rayon,
        ResumeName,
        Coach_Email
      ])
      .then(value => {
        console.log("value", value);
        _output.data = {};
        _output.isSuccess = true;
        _output.message = "Update Successfully";
      })
      .catch(err => {
        console.log("err", err.message);
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Update failed";
      });
  } else {
    console.log("err");
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Update failed";
  }
  res.send(_output);
};

exports.login = async function(req, res, next) {
  var _output = new output();
  const { email, password } = req.body;

  if (email != "" && password != "") {
    const query =
      "SELECT `id`, `firstName`, `lastName`, `email`, `gender`, `password`, `mobile`, `address`, `postalCode`, `cityId`," +
      "`roleId`, `isOtpVerified`, `isActive`, `hashKey`" +
      " FROM `users` WHERE `email`= '" +
      email +
      "' AND `isOtpVerified`= 1 AND `isActive`= 1;";

    await db_library
      .execute(query)
      .then(async value => {
        var result = value;
        if (result.length > 0) {
          const match = await bcrypt.compare(password, result[0].password);
          if (match) {
            _output.data = result[0];
            _output.isSuccess = true;
            _output.message = lang.login_success;
          } else {
            _output.data = {};
            _output.isSuccess = false;
            _output.message = lang.invalid_login;
          }
        }
        if (result.length == 0) {
          _output.data = {};
          _output.isSuccess = false;
          _output.message = lang.email_verify;
        }
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "login failed ";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "login failed";
  }
  res.send(_output);
};

exports.forgotPassword = async function(req, res, next) {
  var _output = new output();
  const email = req.body.email;

  if (email != "") {
    try {
      if (email) {
        var random = Math.random().toString();
        var encry_hash = await bcrypt.hash(random, 10);

        //Query
        var query =
          "UPDATE `users` SET `hashKey`='" +
          encry_hash +
          "' WHERE `email` = '" +
          email +
          "'";
        var sel_query =
          "SELECT `firstname`,`lastname` from `users` WHERE `email` = '" +
          email +
          "'";

        await db_library
          .execute(sel_query)
          .then(async val => {
            if (val.length > 0) {
              await db_library
                .execute(query)
                .then(async value => {
                  var mailTemplate = await mail_template.getMailTemplate(
                    appConfig.MailTemplate.ForgotPassword
                  );
                  const mailOption = require("../../_mailer/mailOptions");
                  let _mailOption = new mailOption();
                  _mailOption.to = email;
                  _mailOption.subject = lang.forgotten_password;
                  _mailOption.html = mailTemplate[0].template
                    .replace(
                      "{{username}}",
                      val[0].firstname + " " + val[0].lastname
                    )
                    .replace("{{hashkey}}", encry_hash);
                  var _mailer = require("../../_mailer/mailer");
                  _mailer.sendMail(_mailOption);
                  _output.data = value;
                  _output.isSuccess = true;
                  _output.message = "Hash Key Generated Successfully";
                })
                .catch(err => {
                  _output.data = {};
                  _output.isSuccess = false;
                  _output.message = "Hash Key Generated Failed";
                });
            } else {
              _output.data = {};
              _output.isSuccess = false;
              _output.message = "No User Found";
            }
          })
          .catch(err => {
            _output.data = {};
            _output.isSuccess = false;
            _output.message = "No User Found";
          });
      }
    } catch (err) {
      _output.data = {};
      _output.isSuccess = false;
      _output.message = "err";
    }
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Hash Key Generated Failed";
  }
  res.send(_output);
};

exports.resetPassword = async function(req, res, next) {
  var _output = new output();

  const email = req.body.email;
  const hashKey = req.body.hash;
  const password = req.body.password;

  if (email != "" && password != "") {
    var encry_pass = await bcrypt.hash(password, 10);
    if (hashKey == "") {
      var query =
        "UPDATE `users` SET `password`= '" +
        encry_pass +
        "' WHERE `email` = '" +
        email +
        "'";
    } else {
      var query =
        "UPDATE `users` SET `password`= '" +
        encry_pass +
        "' WHERE `hashKey`='" +
        hashKey +
        "' AND `email` = '" +
        email +
        "'";
    }
    await db_library
      .execute(query)
      .then(value => {
        var result = {};
        _output.data = result;
        _output.isSuccess = true;
        _output.message = "Reseted Password Successfully";
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Password Reset falied";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Password Reset falied";
  }
  res.send(_output);
};

exports.userVerification = async function(req, res, next) {
  const email = req.body.email;
  var _output = new output();

  if (email != "") {
    var query =
      "UPDATE `users` SET isOtpVerified = 1 WHERE email = '" + email + "';";

    await db_library
      .execute(query)
      .then(value => {
        var result = value;
        _output.data = {};
        _output.isSuccess = true;
        _output.message = "Votre compte a été vérifié avec succès";
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "User Verification Failed";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "User Verification Failed";
  }
  res.send(_output);
};

exports.setNewPassword = async function(req, res, next) {
  var _output = new output();
  const email = req.body.email;
  const password = req.body.password;

  if (email != "" && password != "") {
    var encry_pass = await bcrypt.hash(password, 10);

    var query =
      "UPDATE `users` SET password = '" +
      encry_pass +
      "' WHERE email = '" +
      email +
      "'; ";

    await db_library
      .execute(query)
      .then(value => {
        var result = value;
        _output.data = result;
        _output.isSuccess = true;
        _output.message = "Password Updated Successfully";
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "Password Updated Failed";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Password Updated Failed";
  }
  res.send(_output);
};

exports.getCoachDetails = async function(req, res, next) {
  var _output = new output();

  await db_library
    .execute("SELECT * FROM `coaches_dbs`")
    .then(value => {
      var obj = {
        coaches: value
      };
      _output.data = obj;
      _output.isSuccess = true;
      _output.message = "Coach Get Successfully";
    })
    .catch(err => {
      _output.data = err.message;
      _output.isSuccess = false;
      _output.message = "Coach Get Failed";
    });
  res.send(_output);
};

exports.getUserDetails = async function(req, res, next) {
  var _output = new output();

  await db_library
    .execute("SELECT * FROM `users`")
    .then(value => {
      var obj = {
        coaches: value
      };
      _output.data = obj;
      _output.isSuccess = true;
      _output.message = "User Get Successfully";
    })
    .catch(err => {
      _output.data = err.message;
      _output.isSuccess = false;
      _output.message = "User Get Failed";
    });
  res.send(_output);
};

exports.blockCoach = async function(req, res, next) {
  const Coach_ID = req.body.Coach_ID;
  var _output = new output();

  await db_library
    .execute("INSERT")
    .then(value => {
      var result = value;
      _output.data = result;
      _output.isSuccess = true;
      _output.message = "Coach Blocked Successfully";
    })
    .catch(err => {
      _output.data = err.message;
      _output.isSuccess = false;
      _output.message = "Coach Blocked Failed";
    });
  res.send(_output);
};

exports.blockUser = async function(req, res, next) {
  const User_ID = req.body.id;
  var _output = new output();

  await db_library
    .execute("Update")
    .then(value => {
      var result = value;
      _output.data = result;
      _output.isSuccess = true;
      _output.message = "User Blocked Successfully";
    })
    .catch(err => {
      _output.data = err.message;
      _output.isSuccess = false;
      _output.message = "User Blocked Failed";
    });
  res.send(_output);
};

exports.unBlockUser = async function(req, res, next) {
  const User_ID = req.body.id;
  var _output = new output();

  await db_library
    .execute("Update")
    .then(value => {
      var result = value;
      _output.data = result;
      _output.isSuccess = true;
      _output.message = "User UnBlocked Successfully";
    })
    .catch(err => {
      _output.data = err.message;
      _output.isSuccess = false;
      _output.message = "User UnBlocked Failed";
    });
  res.send(_output);
};

exports.deleteUser = async function(req, res, next) {
  const User_ID = req.body.id;
  var _output = new output();

  await db_library
    .execute("Update")
    .then(value => {
      var result = value;
      _output.data = result;
      _output.isSuccess = true;
      _output.message = "User Delete Successfully";
    })
    .catch(err => {
      _output.data = err.message;
      _output.isSuccess = false;
      _output.message = "User Delete Failed";
    });
  res.send(_output);
};

exports.updateUserProfile = async function(req, res, next) {
  var _output = new output();
  const {
    firstName,
    lastName,
    email,
    mobile,
    User_Location,
    User_Level,
    User_Team,
    address,
    User_Image
  } = req.body;

  if (
    firstName != "" &&
    lastName != "" &&
    email != "" &&
    mobile != "" &&
    User_Location != "" &&
    User_Level != "" &&
    User_Team != "" &&
    address != "" &&
    User_Image != ""
  ) {
    var user_query =
      "UPDATE `users` SET `firstName` = ?, `lastName`=?, `email`=?, `mobile`=?," +
      " `User_Location`=?, `User_Level`=?,`User_Team`=?,`address`=?,`User_Image`=? WHERE `email`=?;";

    await db_library
      .parameterexecute(user_query, [
        firstName,
        lastName,
        email,
        mobile,
        User_Location,
        User_Level,
        User_Team,
        address,
        User_Image,
        email
      ])
      .then(value => {
        _output.data = {};
        _output.isSuccess = true;
        _output.message = "Update Successfully";
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Update failed";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Update failed";
  }
  res.send(_output);
};

exports.getuserbyid = async function(req, res, next) {
  const User_Email = req.body.User_Email;
  var _output = new output();

  if (User_Email != "") {
    await db_library
      .execute("SELECT * FROM `users` WHERE email='" + User_Email + "'")
      .then(value => {
        if (value.length > 0) {
          var obj = {
            User_list: value
          };
          var result = obj;
          _output.data = result;
          _output.isSuccess = true;
          _output.message = "User Get Successfull";
        } else {
          var obj = {
            User_list: {}
          };
          var result = obj;
          _output.isSuccess = true;
          _output.message = " No Coach Found";
        }
      })
      .catch(err => {
        _output.data = err.message;
        _output.isSuccess = false;
        _output.message = "Coach Get Failed";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Coach Get Failed";
  }
  res.send(_output);
};

exports.getUserReservation = async function(req, res, next) {
  var _output = new output();
  const User_ID = req.query.User_ID;

  if (User_ID != "") {
    var Qry =
      `select booking_Id,BookingTime,Coach_ID,amount,bookingCourse, d.CourseName,(select DATE_FORMAT(bookingDate, '%Y-%m-%d')) as bookingDate,discount_club,paymentStatus,payment_Id,status,user_Id, u.firstName, u.lastName, u.email,s.Remarks from booking_dbs s
        inner join course_dbs d on s.bookingCourse = d.Course_Shotname
        inner join users u on s.Coach_ID = u.id where user_Id = ` + User_ID;
    await db_library
      .execute(Qry)
      .then(async val => {
        var result = val;
        if (result.length > 0) {
          var obj = {
            booking: result
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "Get Successfull";
        } else {
          var obj = {
            booking: []
          };
          _output.data = obj;
          _output.isSuccess = true;
          _output.message = "No records Found";
        }
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Get Failed";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Get Failed";
  }
  res.send(_output);
};

exports.cancelReservation = async function(req, res, next) {
  var _output = new output();
  const Coach_id = req.body.Coach_ID;
  const status = req.body.status;
  const booking_id = req.body.booking_id;
  const amount = req.body.amount;
  const booking_date = req.body.booking_date;
  const course = req.body.course;
  const email = req.body.email;
  const booking_time = req.body.booking_time;

  if (
    Coach_id != "" &&
    status != "" &&
    booking_id != "" &&
    amount != "" &&
    booking_date != "" &&
    course != ""
  ) {
    if (course == "CoursCollectifOndemand") {
      var update_qry =
        "UPDATE `booking_dbs` SET `status`= '" +
        status +
        "' ,`amount`= '" +
        amount +
        "' WHERE `booking_Id`=" +
        booking_id +
        " AND `bookingDate`='" +
        booking_date +
        "' AND `bookingCourse`='" +
        course +
        "'";
      var sel_qry =
        "SELECT * FROM `users` u INNER JOIN `booking_dbs` b on u.id = b.user_Id INNER JOIN `coaches_dbs` cb where cb.Coach_Email = '" +
        email +
        "' AND b.bookingCourse='" +
        course +
        "' AND b.bookingDate ='" +
        booking_date +
        "' AND b.Coach_ID = " +
        Coach_id +
        " AND b.BookingTime = '" +
        booking_time +
        "'";
    } else {
      // var update_qry = "UPDATE `booking_dbs` SET `status`= '" + status + "' ,`amount`= '" + amount + "' WHERE `Coach_id`=" + Coach_id + " AND `booking_id`=" + booking_id + "";
      var update_qry =
        "call proc_set_booking_status(" +
        booking_id +
        "," +
        amount +
        ",'" +
        status +
        "')";
      var sel_qry =
        "SELECT * FROM `users` u INNER JOIN `booking_dbs` b on u.id = b.user_Id INNER JOIN `coaches_dbs` cb where cb.Coach_Email = '" +
        email +
        "' AND b.booking_id = " +
        booking_id +
        "";
    }

    await db_library
      .execute(update_qry)
      .then(async value => {
        if (value.affectedRows > 0) {
          await db_library
            .execute(sel_qry)
            .then(async val => {
              if (val.length > 0) {
                for (var i = 0; i < val.length; i++) {
                  if (status == "UC") {
                    var mailTemplate = await mail_template.getMailTemplate(
                      appConfig.MailTemplate.UserCancel
                    );
                    const mailOption = require("../../_mailer/mailOptions");
                    let _mailOption = new mailOption();
                    _mailOption.to = val[i].Coach_Email;
                    _mailOption.subject =
                      "Reservation Cancelled by " +
                      val[i].firstName +
                      " " +
                      val[i].lastName;
                    _mailOption.html = mailTemplate[0].template
                      .replace(
                        "{{username}}",
                        val[i].Coach_Fname + " " + val[i].Coach_Lname
                      )
                      .replace(
                        "{{user}}",
                        val[i].firstName + " " + val[i].lastName
                      )
                      .replace("{{course}}", val[i].bookingCourse)
                      .replace(
                        "{{book_date}}",
                        moment(val[i].bookingDate).format("DD-MM-YYYY")
                      );
                    var _mailer = require("../../_mailer/mailer");
                    _mailer.sendMail(_mailOption);
                  }
                }
                _output.data = {};
                _output.isSuccess = true;
                _output.message = "Status Update Successfull";
              }
            })
            .catch(err => {
              _output.data = {};
              _output.isSuccess = false;
              _output.message = "Mail Not Sent";
            });
        }
      })
      .catch(err => {
        _output.data = {};
        _output.isSuccess = false;
        _output.message = "Status Update Failed";
      });
  } else {
    _output.data = lang.required_field;
    _output.isSuccess = false;
    _output.message = "Status Update Failed";
  }
  res.send(_output);
};

exports.getallusercoursecount = async function(req, res, next) {
  var _output = new output();
  const User_ID = req.body.User_ID;
  var CoursIndividuel;
  var CoursCollectifOndemand;
  var CoursCollectifClub;
  var Stage;
  var Tournament;

  await db_library
    .execute(
      `select count(*)
 from booking_dbs s join users u on s.user_Id = u.id where bookingCourse = "CoursIndividuel" AND user_Id = ` +
        User_ID
    )
    .then(value => {
      CoursIndividuel = value[0]["count(*)"];
    });
  await db_library
    .execute(
      `select count(*)
 from booking_dbs s join users u on s.user_Id = u.id where bookingCourse = "CoursCollectifOndemand" AND user_Id = ` +
        User_ID
    )
    .then(value => {
      CoursCollectifOndemand = value[0]["count(*)"];
    });

  await db_library
    .execute(
      `select count(*)
 from booking_dbs s join users u on s.user_Id = u.id where bookingCourse = "CoursCollectifClub" AND user_Id = ` +
        User_ID
    )
    .then(value => {
      CoursCollectifClub = value[0]["count(*)"];
    });

  await db_library
    .execute(
      `select count(*)
 from booking_dbs s join users u on s.user_Id = u.id where bookingCourse = "Stage" AND user_Id = ` +
        User_ID
    )
    .then(value => {
      Stage = value[0]["count(*)"];
    });
  await db_library
    .execute(
      `select count(*)
 from booking_dbs s join users u on s.user_Id = u.id where bookingCourse = "Tournoi" AND user_Id = ` +
        User_ID
    )
    .then(value => {
      Tournament = value[0]["count(*)"];
    });
  await db_library
    .execute(
      `select count(*)
 from booking_dbs s join users u on s.user_Id = u.id where bookingCourse = "TeamBuilding" AND user_Id = ` +
        User_ID
    )
    .then(value => {
      TeamBuilding = value[0]["count(*)"];
    });

  await db_library
    .execute(
      `select count(*)
 from booking_dbs s join users u on s.user_Id = u.id where bookingCourse = "Animation" AND user_Id = ` +
        User_ID
    )
    .then(value => {
      Animation = value[0]["count(*)"];
    });

  var obj = {
    CoursIndividuel: CoursIndividuel,
    CoursCollectifOndemand: CoursCollectifOndemand,
    CoursCollectifClub: CoursCollectifClub,
    Stage: Stage,
    Tournament: Tournament,
    TeamBuilding: TeamBuilding,
    Animation: Animation
  };
  _output.data = obj;
  _output.isSuccess = true;
  _output.message = "Get Successfull";
  res.send(_output);
};
