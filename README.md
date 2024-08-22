# Library Management System (Lib_Man_Sys)
This repository contains the source code for a simple Library Management System using Node.js, Express, and MySQL. The system allows users to view books, issue books, and return books, while administrators can manage books, users, and issue/return records.





# Prerequisites
•	Node.js installed
•	MySQL server with the lms database and the following tables:
o	login_logout
o	view_books
o	issue_books
o	return_books





# Getting Started


Clone the repository:
git clone https://github.com/AdyaSharma02/Lib_Man_Sys.git


Install the required packages:
cd Lib_Man_Sys

npm install


Update the MySQL connection details in app.js:
const pool = mysql.createPool({
  connectionLimit: 100,
  host: 'localhost',
  user: 'root', // Your MySQL username
  password: '', // Your MySQL password
  database: 'lms',
  debug: false
});





# Start the server:


Access the system using a web browser:
•	Users: http://localhost:5000/login?userRole=User
•	Administrators: http://localhost:5000/login?userRole=Admin





# Features
•	User authentication with session management
•	User roles: User and Admin
•	Users can view books and issue books
•	Admins can view, add, and delete books
•	Admins can view and manage users
•	Issue and return book records management





# File Structure
•	app.js: The main application file
•	styles: Contains CSS files
•	login.html: Login page
•	user.html: User homepage
•	admin.html: Admin homepage
•	view_books.html: View books page
•	issue_books_form.html: Issue books form
•	return_books.html: Return books form
•	new_user.html: New user form (Admin only)
•	add_books.html: Add books form (Admin only)





# Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

