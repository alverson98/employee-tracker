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

// QUERYING THE DATABASE: view requested table(s) & data

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

// ADDING TABLE DATA:

// adding department
const addDepartment = () => {
  inquirer
    .createPromptModule([
      {
        name: "departmentName",
        message: "What is the name of the Department you would like to add?",
        type: "input",
      },
    ])
    .then((response) => {
      //adding the new department name to the department table
      db.query(
        `INSERT INTO department(name) VALUES ("${response.departmentName}")`
      );
      console.log("New department added.");
      menuSelect();
    })
    .catch((err) => {
      console.log(err);
    });
};

//adding role
const addRole = () => {
  //getting all of the department data
  db.query("SELECT name FROM department")
    .then((departmentNames) => {
      inquirer.createPromptModule([
        {
          name: "roleName",
          message: "What is the name of the Role you would like to add?",
          type: "input",
        },
        {
          name: "roleSalary",
          message: "What is the salary of this new role?",
          type: "input",
        },
        {
          name: "department",
          message: "What department does this new role belong to?",
          type: "list",
          choices: departmentNames,
        },
      ]);
    })
    .then((answers) => {
      //getting the id for the department
      let departmentID = db.query(
        `SELECT id FROM department WHERE name = ${answers.department}`
      );

      //returning answers to the questions and the id data from the department table
      return answers, departmentID;
    })
    .then((answers, departmentID) => {
      db.query(
        `INSERT INTO role(title, salary, department_id) VALUES ("${answers.roleName}", ${answers.roleSalary}, ${departmentID})`
      );
      console.log("New role was added.");
      menuSelect();
    })
    .catch((err) => {
      console.log(err);
    });
};

//adding employee

//UPDATING TABLE DATA:

//updating employee role

// WHEN I choose to add a role
// THEN I am prompted to enter the name, salary, and department for the role and that role is added to the database
// WHEN I choose to add an employee
// THEN I am prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database
// WHEN I choose to update an employee role
// THEN I am prompted to select an employee to update and their new role and this information is updated in the database
