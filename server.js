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
  const menuOptions = inquirer.createPromptModule();

  menuOptions({
    name: "menuChoice",
    type: "list",
    message: "Please select one of the following actions:",
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
  }).then((response) => {
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
        break;
      case "Done":
        process.exit(0);
    }
  });
};

// view department table
const showDepartment = () =>
  //showing id and name
  db.query("SELECT * FROM department", (err, results) => {
    console.table(results);
    menuSelect();
  });

// view role table
const showRole = () =>
  //joining role & department table to show ... id, title, department, salary
  db.query(
    "SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department ON role.department_id = department.id",
    (err, results) => {
      console.table(results);
      menuSelect();
    }
  );

// view employee table
const showEmployee = () =>
  //joining employee, role, & department tables to show ... id, first name, last name, title, department, salary, manager name
  db.query(
    "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary AS salary, manager.first_name AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id",
    (err, results) => {
      console.table(results);
      menuSelect();
    }
  );

// ADDING TABLE DATA:

// adding department
const addDepartment = () => {
  const newDepartmentQuestions = inquirer.createPromptModule();
  //prompting user to answer a question to add new department
  newDepartmentQuestions([
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
  //getting all of the department name data
  db.promise()
    .query("SELECT name FROM department")
    .then((departmentNames) => {
      // above mysql query returns more than the name data array so - departmentNames[0]
      const departmentOptions = departmentNames[0].map((dept) => dept.name);

      const newRoleQuestions = inquirer.createPromptModule();

      //prompting user with questions to create new role
      newRoleQuestions([
        {
          name: "roleName",
          message: "What is the name of the role you would like to add?",
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
          choices: departmentOptions,
        },
      ]).then((answers) => {
        //getting the id for the department the new role belongs to
        db.promise()
          .query(
            `SELECT id FROM department WHERE name = "${answers.department}"`
          )
          .then((deptId) => {
            //making array of only the id - [{id: }]
            const newRoleDeptId = deptId[0];

            //returning an array - [user answers, id object array]
            return [answers, newRoleDeptId];
          })
          .then((newRoleData) => {
            //adding the new role to the role table
            db.promise().query(
              `INSERT INTO role(title, salary, department_id) VALUES ("${newRoleData[0].roleName}", ${newRoleData[0].roleSalary}, ${newRoleData[1][0].id})`
            );
            console.log("New role added.");

            //go back to the main menu options
            menuSelect();
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//adding employee
const addEmployee = () => {
  const newEmployeeQuestions = inquirer.createPromptModule();

  //getting all of the role titles
  db.promise()
    .query("SELECT title FROM role")
    .then((roleTitles) => {
      //creating array of only the role titles
      const roleOptions = roleTitles[0].map((role) => role.title);

      //getting first names of all the managers
      db.promise()
        .query("SELECT first_name FROM employee where manager_id IS NULL")
        .then((allManagers) => {
          //creating array of all of the current managers
          const managerOptions = allManagers[0].map(
            (employee) => employee.first_name
          );

          //returning an array - [array of role titles, array of manager names]
          return [roleOptions, managerOptions];
        })
        .then((choiceArray) => {
          //prompting user with questions to add new employee
          newEmployeeQuestions([
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
              choices: choiceArray[0],
            },
            {
              name: "employeeManager",
              message:
                "Who is the new employee's manager? (Select 'null' if the new employee is a manager).",
              type: "list",
              choices: [...choiceArray[1], "null"],
            },
          ]).then((answers) => {
            //getting the role id for the new employee role
            db.promise()
              .query(
                `SELECT id FROM role WHERE title = "${answers.employeeRole}"`
              )
              .then((newEmployeeRoleId) => {
                //returning an array - [user answers, new role id]
                return [answers, newEmployeeRoleId[0][0].id];
              })
              .then((newEmployeeData) => {
                // getting id for the new employee's manager
                db.promise()
                  .query(
                    `SELECT id FROM employee WHERE first_name = "${newEmployeeData[0].employeeManager}"`
                  )
                  .then((newEmployeeManagerId) => {
                    // if new employee is manager - make manager_id null
                    if (newEmployeeManagerId[0][0] === undefined) {
                      db.promise().query(
                        `INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES ("${newEmployeeData[0].employeeFirstName}", "${newEmployeeData[0].employeeLastName}", ${newEmployeeData[1]}, NULL)`
                      );
                    } else {
                      db.promise().query(
                        `INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES ("${newEmployeeData[0].employeeFirstName}", "${newEmployeeData[0].employeeLastName}", ${newEmployeeData[1]}, ${newEmployeeManagerId[0][0].id})`
                      );
                    }
                    console.log("New employee added.");

                    //go back to main menu options
                    menuSelect();
                  });
              });
          });
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

//UPDATING TABLE DATA:

//updating employee role
const updateRole = () => {
  const updateEmployeeQuestions = inquirer.createPromptModule();

  db.promise()
    .query("SELECT title FROM role")
    .then((roleTitles) => {
      //making array of only the role titles
      const roleOptions = roleTitles[0].map((role) => role.title);

      //getting first names of all employees
      db.promise()
        .query("SELECT first_name FROM employee")
        .then((allEmployees) => {
          //creating array of only the employee's names
          const employeeOptions = allEmployees[0].map(
            (employee) => employee.first_name
          );

          //getting first names of all the managers
          db.promise()
            .query("SELECT first_name FROM employee where manager_id IS NULL")
            .then((allManagers) => {
              //creating array of all of the current managers
              const managerOptions = allManagers[0].map(
                (employee) => employee.first_name
              );

              //returning array - [role title array, employee name array, manager name array]
              return [roleOptions, employeeOptions, managerOptions];
            })
            .then((employeeData) => {
              //prompting user to answer questions to update the employee role
              updateEmployeeQuestions([
                {
                  name: "employeeFirstName",
                  message:
                    "What is the first name of the employee you would like to update?",
                  type: "list",
                  choices: employeeData[1],
                },
                {
                  name: "updatedRole",
                  message: "What is the new role of this employee?",
                  type: "list",
                  choices: employeeData[0],
                },
                {
                  name: "updatedManager",
                  message:
                    "Who is the employee's manager? (Select 'null' if the employee's new role is a manager).",
                  type: "list",
                  choices: [...employeeData[2], "null"],
                },
              ]).then((answers) => {
                //getting id of the new role
                db.promise()
                  .query(
                    `SELECT id FROM role WHERE title = "${answers.updatedRole}"`
                  )
                  .then((updatedRoleId) => {
                    //returning array - [user answers, id of new role]
                    return [answers, updatedRoleId[0][0].id];
                  })
                  .then((updatedEmployeeData) => {
                    //getting id for the updated manager
                    db.promise()
                      .query(
                        `SELECT id FROM employee WHERE first_name = "${updatedEmployeeData[0].updatedManager}"`
                      )

                      //updating employee role and manager
                      .then((updatedManagerId) => {
                        //if the updated role is manager - make manager_id null
                        if (updatedManagerId[0][0] === undefined) {
                          db.promise().query(
                            `UPDATE employee SET role_id = ${updatedEmployeeData[1]}, manager_id = NULL WHERE first_name = "${updatedEmployeeData[0].employeeFirstName}"`
                          );
                        } else {
                          db.promise().query(
                            `UPDATE employee SET role_id = ${updatedEmployeeData[1]}, manager_id = ${updatedManagerId[0][0].id} WHERE first_name = "${updatedEmployeeData[0].employeeFirstName}"`
                          );
                        }
                        console.log("Employee role updated.");
                      });

                    //go back to main menu options
                    menuSelect();
                  });
              });
            });
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

menuSelect();
