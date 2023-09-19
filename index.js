// dependencies
const fs = require('fs');
const inquirer = require('inquirer');
const mysql = require('mysql2');
require('dotenv').config();

// connect to database
const db = mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'workplace_db'
});

console.log("  _____                       _                                 ");
console.log(" | ____|  _ __ ___    _ __   | |   ___    _   _    ___    ___   ");
console.log(" |  _|   | '_ ` _ \\  | '_ \\  | |  / _ \\  | | | |  / _ \\  / _ \\  ");
console.log(" | |___  | | | | | | | |_) | | | | (_) | | |_| | |  __/ |  __/  ");
console.log(" |_____| |_| |_| |_| | .__/  |_|  \\___/   \\__, |  \\___|  \\___|  ");
console.log("  _____              |_|        _         |___/                 ");
console.log(" |_   _|  _ __    __ _    ___  | | __   ___   _ __              ");
console.log("   | |   | '__|  / _` |  / __| | |/ /  / _ \\ | '__|             ");
console.log("   | |   | |    | (_| | | (__  |   <  |  __/ | |                ");
console.log("   |_|   |_|     \\__,_|  \\___| |_|\\_\\  \\___| |_|                ");

console.log(`Connected to the workplace_db database.`);



// get department data from db to use in inquirer prompts
function getDepartments() {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM departments`;
    db.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// get roles data from db to use in inquirer prompts
function getRoles() {
  // make this function asynchronous by using promise
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM roles`;
    db.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        // saving the titles as results
        resolve(results);
      }
    });
  });
}

// get employee data from db to use in inquirer prompts
function getEmployees() {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM employees`;
    db.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}


// initial menu
function mainMenu() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          'View All Employees',
          'Add Employee',
          'Update Employee Role',
          'View All Roles',
          'Add Role',
          'View All Departments',
          'Add Department',
          'Quit'
        ],
      },
    ])
    .then((answers) => {
      const action = answers.action;

      switch (action) {
        case "View All Employees":
          viewEmployees();
          break;

        case "Add Employee":
          addEmployee();
          break;

        case "Update Employee Role":
          updateRole();
          break;

        case "View All Roles":
          viewRoles();
          break;

        case "Add Role":
          addRoles();
          break;

        case "View All Departments":
          viewDepartments();
          break;

        case "Add Department":
          addDepartment();
          break;

        case "Quit":
          console.log("See You Later!");
          db.end();
          console.log("Connection to the database was ended.")
          break;

        default:
          console.log("Invalid action");
      }
    });
}


// add employee function
async function addEmployee() {
  try {
    // async to wait for these functions to complete before continuing
    const roles = await getRoles();
    const managers = await getEmployees();

    // convert roles to choices format
    const roleChoices = roles.map(role => role.title);
    const managerNames = managers.map(employee => `${employee.first_name} ${employee.last_name}`);
    // add an option for no manager
    managerNames.unshift('none')

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: "Employee First Name:"
      },
      {
        type: 'input',
        name: 'lastName',
        message: "Employee Last Name:"
      },
      {
        type: 'list',
        name: 'role',
        message: "What is the employee's role?",
        choices: roleChoices
      },
      {
        type: 'list',
        name: 'manager',
        message: "Who is the employee's manager?",
        choices: managerNames
      },
    ]);

    // get role_id based on selected role title
    const selectedRole = roles.find(role => role.title === answers.role);
    const role_id = selectedRole.id;

    // get manager_id based on selected manager name. if mangager was set to null, sets manager_id to null as well.
    // const selectedManager = managers.find(employee => `${employee.first_name} ${employee.last_name}` === answers.manager);
    const manager_id = answers.manager === 'none' ? null : managers.find(employee => `${employee.first_name} ${employee.last_name}` === answers.manager).id;

    // insert new employee data into employees table
    const insertQuery = `
      INSERT INTO employees (first_name, last_name, role_id, manager_id)
      VALUES (?, ?, ?, ?)
    `;
    await db.execute(insertQuery, [answers.firstName, answers.lastName, role_id, manager_id]);

    console.log('New employee was successfully added to the database!');

    // ask the user if they'd like to continue adding employees, or if they'd like to return to the main menu
    const { continueOption } = await inquirer.prompt([
      {
        type: 'list',
        name: 'continueOption',
        message: 'Do you want to add another employee or go back to the main menu?',
        choices: ['Add Another Employee', 'Go Back to Main Menu']
      }
    ]);

    if (continueOption === 'Add Another Employee') {
      await addEmployee();
    } else {
      mainMenu();
    }

  } catch (error) {
    console.error(error);
  }
}

// update employees

// add roles
async function addRoles() {
  try {
    // async to wait for this function to complete before continuing
    const departments = await getDepartments(); // Use getDepartments here instead of getRoles

    // convert departments to choices format
    const deptChoices = departments.map(department => department.name);
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: "What is the title of this role?"
      },
      {
        type: 'input',
        name: 'salary',
        message: "What is the salary for this role?"
      },
      {
        type: 'list',
        name: 'department',
        message: "What department is this role a part of?",
        choices: deptChoices
      }
    ]);
    // get department_id based on selected department name
    const selectedDepartment = departments.find(department => department.name === answers.department);
    const department_id = selectedDepartment.id;

    // ionsert new role into roles table
    const insertQuery = `
  INSERT INTO roles (title, salary, department_id)
  VALUES (?, ?, ?)
`;

    await db.execute(insertQuery, [answers.title, answers.salary, department_id]);

    console.log('New role was successfully added to the database!');


    // ask user if they would like to continue adding roles, or if they want to go back to the main menu
    const { continueOption } = await inquirer.prompt([
      {
        type: 'list',
        name: 'continueOption',
        message: 'Do you want to add another role or go back to the main menu?',
        choices: ['Add Another Role', 'Go Back to Main Menu']
      }
    ]);

    if (continueOption === 'Add Another Role') {
      await addRoles(); // Call the function recursively
    } else {
      mainMenu();
    }

  } catch (error) {
    console.error(error);
  }
}

//add departments
async function addDepartment() {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'department',
        message: "What is the name of this department?"
      }
    ]);
// insert new row using answers
    const insertQuery = `
      INSERT INTO departments (name)
      VALUES (?)`;

    await db.execute(insertQuery, [answers.department]);

    console.log('New department was successfully added to the database!');
// ask user if they want to add another dept or go back to main menu
    const { continueOption } = await inquirer.prompt([
      {
        type: 'list',
        name: 'continueOption',
        message: 'Do you want to add another department or go back to the main menu?',
        choices: ['Add Another Department', 'Go Back to Main Menu']
      }
    ]);

    if (continueOption === 'Add Another Department') {
      await addDepartment();
    } else {
      mainMenu();
    }

  } catch (error) {
    console.error(error);
  }
}


// view all employees
function viewEmployees() {
  const query = ``
}

// view all roles
function viewRoles() {
  const query = ``
}

// view all departments
function viewDepartments() {
  const sql = `SELECT id AS ID, name AS Department FROM departments`
}



mainMenu();