const mysql = require('mysql');
const port = 5000;
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 }
}));

app.use('/styles', express.static('styles'));
const MyPath = path.join(__dirname, 'styles');
app.set('view engine', 'ejs');

app.get("/myStyle", function (req, res) {
    res.render('Lib_Man_Sys');
});

const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'lms',
    debug: false
});

app.get('/', (req, res) => {
    const sessionData = req.session;
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login', (req, res) => {
    //const { username, password, userRole } = req.query;
    username=req.query.username;
    password=req.query.password;
    userRole=req.query.userRole;
    pool.query('SELECT * FROM login_logout WHERE UserName = ? AND Password = ? AND UserType = ?', [username, password, userRole], (error, results) => {
        if (error) {
            throw error;
        }

        if (results.length > 0) {
            req.session.isLoggedIn = true;
            req.session.username = username;
            req.session.userRole = userRole;
            console.log("User logged in. Redirecting...");
            if (userRole == 'Admin') {
                res.redirect('/admin');
            } else {
                res.redirect('/user');
            }
        } else {
            console.log("Incorrect username or password.");
            res.status(401).sendFile(path.join(__dirname, 'login.html'), { error: 'Incorrect username or password.' });
        }
    });
});

function restrict_user(req, res, next) {
  if (req.session.isLoggedIn && req.session.userRole == 'User') {
    next();
  } else {
    res.redirect('/');
  }
}

app.get('/user', (req, res) => {
  if (req.session.isLoggedIn && req.session.userRole == 'User') {
    res.sendFile(path.join(__dirname, 'user.html'));
  } else {
    res.redirect('/');
  }
});

function restrict_admin(req, res, next) {
  if (req.session.isLoggedIn && req.session.userRole == 'Admin') {
    next();
  } else {
    res.redirect('/');
  }
}

app.get('/admin', (req, res) => {
  if (req.session.isLoggedIn && req.session.userRole == 'Admin') {
    res.sendFile(path.join(__dirname, 'admin.html'));
  } else {
    res.redirect('/');
  }
});

//USER SIDE

app.get('/view_books', (req, res) => {
  if (req.session.isLoggedIn && req.session.userRole == 'User')
  {
    pool.query('SELECT BookID, BookName, Category, Price FROM view_books', (error, results) => {
      if (error) {
        console.error(error);
        res.send('Error fetching data.');
        return;
      }

      let table = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>View Books</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 40px;
              margin-bottom: 40px;
            }

            table th,
            table td {
              padding: 8px;
              border: 1px solid #ddd;
            }

            table th {
              background-color: #f2f2f2;
              font-weight: bold;
              text-align: left;
            }

            table tr:nth-child(even) {
              background-color: #f9f9f9;
            }

            table tr:hover {
              background-color: #f2f2f2;
            }

            .navbar {
              background-color: #343a40 !important;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <!-- Navbar -->
          <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <a class="navbar-brand" href="#"><i class="bi bi-book"></i> LIBRARY MANAGEMENT SYSTEM</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav ml-auto">
                <li class="nav-item">
                  <a class="nav-link" href="/user">
                    <i class="fas fa-home"></i> HOME
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#footer"><i class="fas fa-info-circle"></i> ABOUT US</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="/logout"><i class="fas fa-sign-out-alt"></i> LOGOUT</a>
                </li>
              </ul>
            </div>
          </nav>
        
        <table border="1">
          <tr>
            <th>BookID</th>
            <th>BookName</th>
            <th>Category</th>
            <th>Price</th>
          </tr>`;

    results.forEach(row => {
      table += `
        <tr>
          <td>${row.BookID}</td>
          <td>${row.BookName}</td>
          <td>${row.Category}</td>
          <td>${row.Price}</td>
        </tr>`;
    });

    table += `
        </table>
        <!-- Footer -->
        <footer id="footer" class="footer mt-auto py-3 bg-dark text-white">
        <div class="container">
            <div class="row">
                <!-- Privacy Policy -->
                <div class="col-lg-4 col-md-6">
                    <h5>Privacy Policy</h5>
                    <ul>
                        <li>At Library Management System, we take your privacy seriously.</li>
                        <li>This Privacy Policy outlines the types of personal information we collect and how we use it.</li>
                        <li>By using our services, you agree to the collection and use of information in accordance with this policy.</li>
                    </ul>
                </div>
                <!-- Terms of Service -->
                <div class="col-lg-4 col-md-6">
                    <h5>Terms of Service</h5>
                    <ul>
                        <li>Welcome to Library Management System!</li>
                        <li>By accessing or using our services, you agree to be bound by these Terms of Service.</li>
                        <li>Please read them carefully before using our platform.</li>
                    </ul>
                </div>
                <!-- Contact Us -->
                <div class="col-lg-4 col-md-12">
                    <h5>Contact Us</h5>
                    <ul>
                        <li>If you have any questions, concerns, or feedback, please don't hesitate to contact us.</li>
                        <li>You can reach us by email at <a href="mailto:contact@librarymanagement.com">contact@librarymanagement.com</a>.</li>
                        <li>Or you can contact us via:
                            <ul>
                                <li>Phone: +1 (555) 123-4567</li>
                                <li>Telegram ID: @librarymanagement_telegram</li>
                                <li>Instagram ID: @librarymanagement_instagram</li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
            <hr class="mt-4">
            <div class="row">
                <div class="col-12 text-center">
                    <span class="text-muted">Library Management System &copy; 2024. All rights reserved.</span>
                    <div class="social-icons mt-3">
                        <a href="https://www.facebook.com" class="text-white mr-3"><i class="fab fa-facebook-f"></i></a>
                        <a href="https://www.twitter.com" class="text-white mr-3"><i class="fab fa-twitter"></i></a>
                        <a href="https://www.instagram.com" class="text-white mr-3"><i class="fab fa-instagram"></i></a>
                        <a href="https://www.linkedin.com/" class="text-white"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>
            </div>
        </div>
      </footer>
      </body>
      </html>`;
    res.send(table);
    });
  } 
  else 
  {
    res.redirect('/');
  }
});

app.get('/issue_books', restrict_user, (req, res) => {
  res.sendFile(path.join(__dirname, 'issue_books_form.html'));
});

app.get('/add_issue_books', restrict_user, (req, res) => { 
    const { BookID, UserName, TimePeriod, IssueDate } = req.query;
    const insertString = 'INSERT INTO issue_books (BookID, UserName, TimePeriod, IssueDate) VALUES (?, ?, ?, ?)';
    let query = mysql.format(insertString, [BookID, UserName, TimePeriod, IssueDate]);
    pool.query(query, (err, results) => {
        if (err) {
            console.error("Error inserting data: ", err);
            res.status(500).send("Error inserting data");
            return;
        }
        // Construct HTML response with embedded CSS
        const htmlResponse = `
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        padding: 20px;
                    }
                    .container {
                        max-width: 500px;
                        margin: 0 auto;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 5px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    }
                    h2 {
                        color: #333;
                    }
                    .success-message {
                        color: green;
                    }
                    .error-message {
                        color: red;
                    }
                    .back-link {
                    display: inline-block;
                    text-decoration: none;
                    color: #333;
                    margin-top: 10px;
                    padding: 8px 12px;
                    background-color: #f0f0f0;
                    border-radius: 5px;
                    transition: background-color 0.3s ease;
                }

                .back-link:hover {
                    background-color: #e0e0e0;
                }

                .back-link i {
                    margin-right: 5px;
                }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Data Insertion Result</h2>
                    ${err ? '<p class="error-message">Error inserting data</p>' : '<p class="success-message">Data inserted successfully!</p>'}
                    <a href="/user" class="back-link"><i class="fa fa-arrow-left"></i>Back to Home</a>
                </div>
            </body>
            </html>
        `;
        res.send(htmlResponse);
    });
});

//ADMIN SIDE

app.get('/view_books_admin', restrict_admin,(req, res) => {
  pool.query('SELECT BookID, BookName, Category, Price FROM view_books', (error, results) => {
    if (error) {
      console.error(error);
      res.send('Error fetching data.');
      return;
    }
    
    let table = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>View Books</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 40px;
              margin-bottom: 40px;
            }

            table th,
            table td {
              padding: 8px;
              border: 1px solid #ddd;
            }

            table th {
              background-color: #f2f2f2;
              font-weight: bold;
              text-align: left;
            }

            table tr:nth-child(even) {
              background-color: #f9f9f9;
            }

            table tr:hover {
              background-color: #f2f2f2;
            }

            .navbar {
              background-color: #343a40 !important;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <!-- Navbar -->
          <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <a class="navbar-brand" href="#"><i class="bi bi-book"></i> LIBRARY MANAGEMENT SYSTEM</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav ml-auto">
                <li class="nav-item">
                  <a class="nav-link" href="/admin">
                    <i class="fas fa-home"></i> HOME
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#footer"><i class="fas fa-info-circle"></i> ABOUT US</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="/logout"><i class="fas fa-sign-out-alt"></i> LOGOUT</a>
                </li>
              </ul>
            </div>
          </nav>
        
        <table border="1">
          <tr>
            <th>BookID</th>
            <th>BookName</th>
            <th>Category</th>
            <th>Price</th>
          </tr>`;

    results.forEach(row => {
      table += `
        <tr>
          <td>${row.BookID}</td>
          <td>${row.BookName}</td>
          <td>${row.Category}</td>
          <td>${row.Price}</td>
        </tr>`;
    });

    table += `
        </table>
        <!-- Footer -->
        <footer id="footer" class="footer mt-auto py-3 bg-dark text-white">
        <div class="container">
            <div class="row">
                <!-- Privacy Policy -->
                <div class="col-lg-4 col-md-6">
                    <h5>Privacy Policy</h5>
                    <ul>
                        <li>At Library Management System, we take your privacy seriously.</li>
                        <li>This Privacy Policy outlines the types of personal information we collect and how we use it.</li>
                        <li>By using our services, you agree to the collection and use of information in accordance with this policy.</li>
                    </ul>
                </div>
                <!-- Terms of Service -->
                <div class="col-lg-4 col-md-6">
                    <h5>Terms of Service</h5>
                    <ul>
                        <li>Welcome to Library Management System!</li>
                        <li>By accessing or using our services, you agree to be bound by these Terms of Service.</li>
                        <li>Please read them carefully before using our platform.</li>
                    </ul>
                </div>
                <!-- Contact Us -->
                <div class="col-lg-4 col-md-12">
                    <h5>Contact Us</h5>
                    <ul>
                        <li>If you have any questions, concerns, or feedback, please don't hesitate to contact us.</li>
                        <li>You can reach us by email at <a href="mailto:contact@librarymanagement.com">contact@librarymanagement.com</a>.</li>
                        <li>Or you can contact us via:
                            <ul>
                                <li>Phone: +1 (555) 123-4567</li>
                                <li>Telegram ID: @librarymanagement_telegram</li>
                                <li>Instagram ID: @librarymanagement_instagram</li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
            <hr class="mt-4">
            <div class="row">
                <div class="col-12 text-center">
                    <span class="text-muted">Library Management System &copy; 2024. All rights reserved.</span>
                    <div class="social-icons mt-3">
                        <a href="https://www.facebook.com" class="text-white mr-3"><i class="fab fa-facebook-f"></i></a>
                        <a href="https://www.twitter.com" class="text-white mr-3"><i class="fab fa-twitter"></i></a>
                        <a href="https://www.instagram.com" class="text-white mr-3"><i class="fab fa-instagram"></i></a>
                        <a href="https://www.linkedin.com/" class="text-white"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>
            </div>
        </div>
      </footer>
      </body>
      </html>`;
    res.send(table);
  });
});

app.get('/issue_books_admin', restrict_admin, (req, res) => {
    res.sendFile(path.join(__dirname, 'issue_books_form_admin.html')); 
});

app.get('/new_user', restrict_admin, (req, res) => {
    res.sendFile(path.join(__dirname, 'new_user.html')); 
});

app.get('/add_new_user', restrict_admin, (req, res) => { 
    const { UserName, Password, UserType } = req.query;
    const insertString = 'INSERT INTO login_logout (UserName, Password, UserType) VALUES (?, ?, ?)';
    let query = mysql.format(insertString, [UserName, Password, UserType]);
    pool.query(query, (err, results) => {
        if (err) {
            console.error("Error inserting data: ", err);
            res.status(500).send("Error inserting data");
            return;
        }
        const htmlResponse = `
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        padding: 20px;
                    }
                    .container {
                        max-width: 500px;
                        margin: 0 auto;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 5px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    }
                    h2 {
                        color: #333;
                    }
                    .success-message {
                        color: green;
                    }
                    .error-message {
                        color: red;
                    }
                    .back-link {
                        display: inline-block;
                        text-decoration: none;
                        color: #333;
                        margin-top: 10px;
                        padding: 8px 12px;
                        background-color: #f0f0f0;
                        border-radius: 5px;
                        transition: background-color 0.3s ease;
                    }

                    .back-link:hover {
                        background-color: #e0e0e0;
                    }

                    .back-link i {
                        margin-right: 5px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Data Insertion Result</h2>
                    ${err ? '<p class="error-message">Error inserting data</p>' : '<p class="success-message">Data inserted successfully!</p>'}
                    <a href="/admin" class="back-link"><i class="fa fa-arrow-left"></i>Back to Home</a>
                </div>
            </body>
            </html>
        `;
        res.send(htmlResponse);
    });
});

app.get('/view_users', restrict_admin,(req, res) => {
  pool.query('SELECT UserName, Password, UserType FROM login_logout', (error, results) => {
    if (error) {
      console.error(error);
      res.send('Error fetching data.');
      return;
    }
    
    let table = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>View Books</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 40px;
              margin-bottom: 40px;
            }

            table th,
            table td {
              padding: 8px;
              border: 1px solid #ddd;
            }

            table th {
              background-color: #f2f2f2;
              font-weight: bold;
              text-align: left;
            }

            table tr:nth-child(even) {
              background-color: #f9f9f9;
            }

            table tr:hover {
              background-color: #f2f2f2;
            }

            .navbar {
              background-color: #343a40 !important;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <!-- Navbar -->
          <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <a class="navbar-brand" href="#"><i class="bi bi-book"></i> LIBRARY MANAGEMENT SYSTEM</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav ml-auto">
                <li class="nav-item">
                  <a class="nav-link" href="/admin">
                    <i class="fas fa-home"></i> HOME
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#footer"><i class="fas fa-info-circle"></i> ABOUT US</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="/logout"><i class="fas fa-sign-out-alt"></i> LOGOUT</a>
                </li>
              </ul>
            </div>
          </nav>
        
        <table border="1">
          <tr>
            <th>UserName</th>
            <th>Password</th>
            <th>UserType</th>
          </tr>`;

            results.forEach(row => {
            table += `
                <tr>
                    <td>${row.UserName}</td>
                    <td>${row.Password}</td>
                    <td>${row.UserType === 'User' ? 'User' : 'Admin'}</td>
               </tr>`;
        });

    table += `
        </table>
        <!-- Footer -->
        <footer id="footer" class="footer mt-auto py-3 bg-dark text-white">
        <div class="container">
            <div class="row">
                <!-- Privacy Policy -->
                <div class="col-lg-4 col-md-6">
                    <h5>Privacy Policy</h5>
                    <ul>
                        <li>At Library Management System, we take your privacy seriously.</li>
                        <li>This Privacy Policy outlines the types of personal information we collect and how we use it.</li>
                        <li>By using our services, you agree to the collection and use of information in accordance with this policy.</li>
                    </ul>
                </div>
                <!-- Terms of Service -->
                <div class="col-lg-4 col-md-6">
                    <h5>Terms of Service</h5>
                    <ul>
                        <li>Welcome to Library Management System!</li>
                        <li>By accessing or using our services, you agree to be bound by these Terms of Service.</li>
                        <li>Please read them carefully before using our platform.</li>
                    </ul>
                </div>
                <!-- Contact Us -->
                <div class="col-lg-4 col-md-12">
                    <h5>Contact Us</h5>
                    <ul>
                        <li>If you have any questions, concerns, or feedback, please don't hesitate to contact us.</li>
                        <li>You can reach us by email at <a href="mailto:contact@librarymanagement.com">contact@librarymanagement.com</a>.</li>
                        <li>Or you can contact us via:
                            <ul>
                                <li>Phone: +1 (555) 123-4567</li>
                                <li>Telegram ID: @librarymanagement_telegram</li>
                                <li>Instagram ID: @librarymanagement_instagram</li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
            <hr class="mt-4">
            <div class="row">
                <div class="col-12 text-center">
                    <span class="text-muted">Library Management System &copy; 2024. All rights reserved.</span>
                    <div class="social-icons mt-3">
                        <a href="https://www.facebook.com" class="text-white mr-3"><i class="fab fa-facebook-f"></i></a>
                        <a href="https://www.twitter.com" class="text-white mr-3"><i class="fab fa-twitter"></i></a>
                        <a href="https://www.instagram.com" class="text-white mr-3"><i class="fab fa-instagram"></i></a>
                        <a href="https://www.linkedin.com/" class="text-white"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>
            </div>
        </div>
      </footer>
      </body>
      </html>`;
    res.send(table);
  });
});

app.get('/view&add', restrict_admin,(req, res) => {
  pool.query('SELECT BookID, BookName, Category, Price FROM view_books', (error, results) => {
    if (error) {
      console.error(error);
      res.send('Error fetching data.');
      return;
    }
    
    let table = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>View Books</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 40px;
              margin-bottom: 40px;
            }

            table th,
            table td {
              padding: 8px;
              border: 1px solid #ddd;
            }

            table th {
              background-color: #f2f2f2;
              font-weight: bold;
              text-align: left;
            }

            table tr:nth-child(even) {
              background-color: #f9f9f9;
            }

            table tr:hover {
              background-color: #f2f2f2;
            }

            .navbar {
              background-color: #343a40 !important;
              margin-bottom: 20px;
            }

            .add-button-container {
              text-align: center;
              margin-top: 10px;
              margin-bottom: 20px;
            }

            .add-button {
              font-size: 16px;
              padding: 10px 20px;
            }
          </style>
        </head>
        <body>
          <!-- Navbar -->
          <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <a class="navbar-brand" href="#"><i class="bi bi-book"></i> LIBRARY MANAGEMENT SYSTEM</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav ml-auto">
                <li class="nav-item">
                  <a class="nav-link" href="/admin">
                    <i class="fas fa-home"></i> HOME
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#footer"><i class="fas fa-info-circle"></i> ABOUT US</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="/logout"><i class="fas fa-sign-out-alt"></i> LOGOUT</a>
                </li>
              </ul>
            </div>
          </nav>
        
        <table border="1">
          <tr>
            <th>BookID</th>
            <th>BookName</th>
            <th>Category</th>
            <th>Price</th>
          </tr>`;

    results.forEach(row => {
      table += `
        <tr>
          <td>${row.BookID}</td>
          <td>${row.BookName}</td>
          <td>${row.Category}</td>
          <td>${row.Price}</td>
        </tr>`;
    });

    table += `
        </table>
        <div class="add-button-container">
          <button class="btn btn-primary add-button" onclick="location.href='/add_books_form'">
            <i class="fas fa-plus"></i> ADD BOOKS
          </button>
        </div>
        <!-- Footer -->
        <footer id="footer" class="footer mt-auto py-3 bg-dark text-white">
        <div class="container">
            <div class="row">
                <!-- Privacy Policy -->
                <div class="col-lg-4 col-md-6">
                    <h5>Privacy Policy</h5>
                    <ul>
                        <li>At Library Management System, we take your privacy seriously.</li>
                        <li>This Privacy Policy outlines the types of personal information we collect and how we use it.</li>
                        <li>By using our services, you agree to the collection and use of information in accordance with this policy.</li>
                    </ul>
                </div>
                <!-- Terms of Service -->
                <div class="col-lg-4 col-md-6">
                    <h5>Terms of Service</h5>
                    <ul>
                        <li>Welcome to Library Management System!</li>
                        <li>By accessing or using our services, you agree to be bound by these Terms of Service.</li>
                        <li>Please read them carefully before using our platform.</li>
                    </ul>
                </div>
                <!-- Contact Us -->
                <div class="col-lg-4 col-md-12">
                    <h5>Contact Us</h5>
                    <ul>
                        <li>If you have any questions, concerns, or feedback, please don't hesitate to contact us.</li>
                        <li>You can reach us by email at <a href="mailto:contact@librarymanagement.com">contact@librarymanagement.com</a>.</li>
                        <li>Or you can contact us via:
                            <ul>
                                <li>Phone: +1 (555) 123-4567</li>
                                <li>Telegram ID: @librarymanagement_telegram</li>
                                <li>Instagram ID: @librarymanagement_instagram</li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
            <hr class="mt-4">
            <div class="row">
                <div class="col-12 text-center">
                    <span class="text-muted">Library Management System &copy; 2024. All rights reserved.</span>
                    <div class="social-icons mt-3">
                        <a href="https://www.facebook.com" class="text-white mr-3"><i class="fab fa-facebook-f"></i></a>
                        <a href="https://www.twitter.com" class="text-white mr-3"><i class="fab fa-twitter"></i></a>
                        <a href="https://www.instagram.com" class="text-white mr-3"><i class="fab fa-instagram"></i></a>
                        <a href="https://www.linkedin.com/" class="text-white"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>
            </div>
        </div>
      </footer>
      </body>
      </html>`;
    res.send(table);
  });
});

app.get('/add_books_form', restrict_admin,(req, res) => {
    res.sendFile(path.join(__dirname, 'add_books.html')); 
});

app.get('/add_books', restrict_admin,restrict_admin,(req, res) => { 
    const { BookID, BookName, Category, Price } = req.query; 
    const insertString = 'INSERT INTO view_books (BookID, BookName, Category, Price ) VALUES (?, ?, ?,?)';
    let query = mysql.format(insertString, [BookID, BookName, Category, Price ]);
    pool.query(query, (err, results) => {
        if (err) {
            console.error("Error inserting data: ", err);
            res.status(500).send("Error inserting data");
            return;
        }
        // Construct HTML response with embedded CSS
        const htmlResponse = `
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        padding: 20px;
                    }
                    .container {
                        max-width: 500px;
                        margin: 0 auto;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 5px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    }
                    h2 {
                        color: #333;
                    }
                    .success-message {
                        color: green;
                    }
                    .error-message {
                        color: red;
                    }
                    .back-link {
                        display: inline-block;
                        text-decoration: none;
                        color: #333;
                        margin-top: 10px;
                        padding: 8px 12px;
                        background-color: #f0f0f0;
                        border-radius: 5px;
                        transition: background-color 0.3s ease;
                    }

                    .back-link:hover {
                        background-color: #e0e0e0;
                    }

                    .back-link i {
                        margin-right: 5px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Data Insertion Result</h2>
                    ${err ? '<p class="error-message">Error inserting data</p>' : '<p class="success-message">Data inserted successfully!</p>'}
                    <a href="/view&add" class="back-link"><i class="fa fa-arrow-left"></i>Back</a>
                </div>
            </body>
            </html>
        `;
        res.send(htmlResponse);
    });
});

app.get('/return_books_form', restrict_admin,(req, res) => {
    res.sendFile(path.join(__dirname, 'return_books.html')); 
});

app.get('/return_books', restrict_admin, (req, res) => {
    const { UserName, BookID, DateOfSubmission } = req.query;
    const currentDate = new Date();
    const submissionDate = new Date(DateOfSubmission);

    // Define the time limit in milliseconds (e.g., 7 days)
    const timeLimit = 7*24*60*60*1000;

    // Calculate the difference in milliseconds between submission and current date
    const timeDifference = currentDate - submissionDate;

    // Check if the submission is late
    const isLate = timeDifference > timeLimit;

    let fineAmount = 0;
    if (isLate) {
        // Calculate the number of days late
        const daysLate = Math.ceil(timeDifference / (24*60*60*1000));
        // Calculate the fine amount (10 rupees per day)
        fineAmount = daysLate*10;
    }

    const insertString = 'INSERT INTO return_books (UserName, BookID, DateOfSubmission) VALUES (?, ?, ?)';
    let query = mysql.format(insertString, [UserName, BookID, DateOfSubmission]);
    pool.query(query, (err, results) => {
        if (err) {
            console.error("Error inserting data: ", err);
            res.status(500).send("Error inserting data");
            return;
        }
        
        let message;
        if (isLate) {
            message = `<p class="error-message">You have returned the book late. Please pay a fine of ₹${fineAmount}.</p>`;
        } else {
            message = '<p class="success-message">Data inserted successfully!</p>';
        }

        const htmlResponse = `
            <html>
            <head>
                <style>
                    <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        padding: 20px;
                    }
                    .container {
                        max-width: 500px;
                        margin: 0 auto;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 5px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    }
                    h2 {
                        color: #333;
                    }
                    .success-message {
                        color: green;
                    }
                    .error-message {
                        color: red;
                    }
                    .back-link {
                        display: inline-block;
                        text-decoration: none;
                        color: #333;
                        margin-top: 10px;
                        padding: 8px 12px;
                        background-color: #f0f0f0;
                        border-radius: 5px;
                        transition: background-color 0.3s ease;
                    }

                    .back-link:hover {
                        background-color: #e0e0e0;
                    }

                    .back-link i {
                        margin-right: 5px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Data Insertion Result</h2>
                    ${message}
                    ${isLate ? `<p>Fine Amount: ₹${fineAmount}</p>` : ''}
                    <a href="/admin" class="back-link"><i class="fa fa-arrow-left"></i>Back to Home</a>
                </div>
            </body>
            </html>
        `;
        res.send(htmlResponse);
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

app.listen(port, () => {
    console.log("Server is listening on port", port);
});
