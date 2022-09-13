// Dependencies
const inquirer = require("inquirer");
const mysql = require("mysql2");
const consoleTable = require("console.table");

// connecting to server db
const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "root",
    database: "staff_db",
  },
  console.log("Connected to the staff database.")
);

// User action prompts
const menuSelect = () => {
  inquirer
    .createPromptModule({
      name: "menuChoice",
      type: "list",
      choices: [
        "View Departments",
        "Add Department",
        "View Roles",
        "Add Role",
        "View Employees",
        "Add Employee",
        "Update Employee Role",
        "Done",
      ],
    })
    .then((response) => {
      //switch statement to call functions based on what user selected
      switch (response.menuChoice) {
        case "View Departments":
          showDepartment();
          break;
        case "Add Department":
          addDepartment();
          break;
        case "View Roles":
          showRole();
          break;
        case "Add Role":
          addRole();
          break;
        case "View Employees":
          showEmployee();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Update Employee Role":
          updateRole();
        case "Done":
          process.exit(0);
      }
    });
};

// QUERYING THE DATABASE:

// view department table
const showDepartment = () =>
  db.query("SELECT * FROM department", (err, results) => {
    console.table(results);
    menuSelect();
  });

// view role table
const showRole = () =>
  db.query(
    "SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department ON role.department_id = department.id",
    (err, results) => {
      console.table(results);
      menuSelect();
    }
  );

// view employee table
const showEmployee = () =>
  db.query(
    "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, employee.salary, manager.first_name AS manager FROM employee LEFT JOIN role  ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id",
    (err, results) => {
      console.table(results);
      menuSelect();
    }
  );

// GIVEN a command-line application that accepts user input
// WHEN I start the application
// THEN I am presented with the following options: view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role
// WHEN I choose to view all departments
// THEN I am presented with a formatted table showing department names and department ids
// WHEN I choose to view all roles
// THEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role
// WHEN I choose to view all employees
// THEN I am presented with a formatted table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
// WHEN I choose to add a department
// THEN I am prompted to enter the name of the department and that department is added to the database
// WHEN I choose to add a role
// THEN I am prompted to enter the name, salary, and department for the role and that role is added to the database
// WHEN I choose to add an employee
// THEN I am prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database
// WHEN I choose to update an employee role
// THEN I am prompted to select an employee to update and their new role and this information is updated in the database
