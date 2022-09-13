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

      //go back to the main menu options
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
    //prompting user with questions to create new role
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
          choices: departmentNames.name,
        },
      ]);
    })
    .then((answers) => {
      //getting the id for the department the new role belongs to
      let departmentID = db.query(
        `SELECT id FROM department WHERE name = ${answers.department}`
      );

      //returning answers to the questions and the id data from the new role's department
      return answers, departmentID;
    })
    .then((answers, departmentID) => {
      //adding the new role to the role table
      db.query(
        `INSERT INTO role(title, salary, department_id) VALUES ("${answers.roleName}", ${answers.roleSalary}, ${departmentID})`
      );
      console.log("New role added.");

      //go back to the main menu options
      menuSelect();
    })
    .catch((err) => {
      console.log(err);
    });
};

//adding employee
const addEmployee = () => {
  //getting all of the role titles
  db.query("SELECT title FROM role")
    .then((roleTitles) => {
      let managerNames = db.query(
        "SELECT first_name FROM employee where manager_id IS NULL"
      );
      return roleTitles, managerNames;
    })
    .then((roleTitles, managerNames) => {
      inquirer.createPromptModule([
        {
          name: "employeeFirstName",
          message: "What is the first name of the new employee?",
          type: "input",
        },
        {
          name: "employeeLastName",
          message: "What is the last name of the new employee?",
          type: "input",
        },
        {
          name: "employeeRole",
          message: "What is the new employee's role?",
          type: "list",
          choices: roleTitles.title,
        },
        {
          name: "employeeManager",
          message:
            "Who is the new employee's manager? (Select 'null' if the new employee is a manager).",
          type: "list",
          choices: [...managerNames.first_name, "null"],
        },
      ]);
    })
    .then((answers) => {
      //getting the id for the new employee role
      let roleID = db.query(
        `SELECT id FROM role WHERE title = ${answers.employeeRole}`
      );

      //returning answers to the questions and the id data from the role table
      return answers, roleID;
    })
    .then((answers, roleID) => {
      // getting id for the new employee's manager
      let employeeManagerID = db.query(
        `SELECT id FROM employee WHERE first_name = ${answers.employeeManager}`
      );

      // if new employee is manager - make manager_id null
      if (answers.employeeManger === "null") {
        db.query(
          `INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES ("${answers.employeeFirstName}", "${answers.employeeLastName}", ${roleID}, null)`
        );
      } else {
        db.query(
          `INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES ("${answers.employeeFirstName}", "${answers.employeeLastName}", ${roleID}, ${employeeManagerID})`
        );
      }
      console.log("New employee added.");

      //go back to main menu options
      menuSelect();
    })
    .catch((err) => {
      console.log(err);
    });
};

//UPDATING TABLE DATA:

//updating employee role
const updateRole = () => {
  db.query("SELECT title FROM role")
    .then((roleTitles) => {
      let firstName = db.query("SELECT first_name FROM employee");
      return roleTitles, firstName;
    })
    .then((roleTitles, firstName) => {
      inquirer
        .createPromptModule([
          {
            name: "employeeFirstName",
            message:
              "What is the first name of the employee you would like to update?",
            type: "list",
            choices: firstName.first_name,
          },
          {
            name: "updatedRole",
            message: "What is the new role of this employee?",
            type: "list",
            choices: roleTitles.title,
          },
        ])
        .then((answers) => {
          const newRoleId = db.query(
            `SELECT id FROM role WHERE title = "${answers.updatedRole}"`
          );
          return answers, newRoleId;
        })
        .then((answers, newRoleId) => {
          db.query(
            `UPDATE employee SET role_id = ${newRoleId.id} WHERE first_name = ${answers.employeeFirstName}`
          );
          console.log("Employee role updated.");
        });

      //go back to main menu options
      menuSelect();
    })
    .catch((err) => {
      console.log(err);
    });
  
};
