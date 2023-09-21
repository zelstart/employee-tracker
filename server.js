// dependencies
const fs = require('fs');
const inquirer = require('inquirer');
const mysql = require('mysql2');
const Table = require('cli-table');
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


// MAIN MENU
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
          'Update Employees',
          'View All Roles',
          'Add Role',
          'View All Departments',
          'Add Department',
          'Delete Employees/Roles/Depts',
          'Quit',
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

        case "Update Employees":
          updateEmployees();
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

        case "Delete Employees/Roles/Depts":
          deleteRows();
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


// ADD EMPLOYEES
async function addEmployee() {
  try {
    // async to wait for these functions to complete before continuing
    const roles = await getRoles();
    const managers = await getEmployees();

    // convert roles to choices format
    const roleChoices = roles.map(role => role.title);
    const managerNames = managers.map(employee => `${employee.first_name} ${employee.last_name}`);

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
        choices: [...managerNames, 'none']
      },
    ]);

    // get role_id based on selected role title
    const selectedRole = roles.find(role => role.title === answers.role);
    const role_id = selectedRole.id;

    // get manager_id based on selected manager name. if mangager was set to null, sets manager_id to null as well.
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

// UPDATE EMPLOYEES
async function updateEmployees() {
  try {
    // run these functions first so we can populate lists with current data
    const employees = await getEmployees();
    const roles = await getRoles();
    const employeeNames = employees.map(employee => `${employee.first_name} ${employee.last_name}`);
    const roleTitles = roles.map(role => role.title);

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'employee',
        message: "Which employee do you want to update?",
        choices: employeeNames
      },
      {
        type: 'list',
        name: 'action',
        message: "Which field would you like to update?",
        choices: [
          'Name',
          'Role',
          'Manager'
        ]
      }
    ]);

    const selectedEmployee = employees.find(employee => `${employee.first_name} ${employee.last_name}` === answers.employee);

    // !!! NAME CASE !!!
    switch (answers.action) {
      case "Name":
        const nameAnswers = await inquirer.prompt([
          {
            type: 'input',
            name: 'firstName',
            message: "Employee First Name:",
            default: selectedEmployee.first_name
          },
          {
            type: 'input',
            name: 'lastName',
            message: "Employee Last Name:",
            default: selectedEmployee.last_name
          }
        ]);

        const updateQuery = `
          UPDATE employees
          SET
          first_name = ?,
          last_name = ?
          WHERE id = ?
        `;

        await db.execute(updateQuery, [nameAnswers.firstName, nameAnswers.lastName, selectedEmployee.id]);

        console.log('Employee name updated successfully!');
        break;

      // !!! ROLE CASE !!!
      case "Role":
        const roleAnswers = await inquirer.prompt([
          {
            type: 'list',
            name: 'role',
            message: "What is this employee's new role?",
            choices: roleTitles,
            default: roles.find(role => role.id === selectedEmployee.role_id).title
          }
        ]);

        const selectedRole = roles.find(role => role.title === roleAnswers.role);

        const updateRoleQuery = `
          UPDATE employees
          SET
          role_id = ?
          WHERE id = ?
        `;

        await db.execute(updateRoleQuery, [selectedRole.id, selectedEmployee.id]);

        console.log('Employee role updated successfully!');
        break;

      // !!! MANAGER CASE !!!
      case "Manager":
        const managerAnswers = await inquirer.prompt([
          {
            type: 'list',
            name: 'manager',
            message: "Who is this employee's new manager?",
            choices: [...employeeNames, 'none'],
            default: selectedEmployee.manager_id ? employees.find(employee => employee.id === selectedEmployee.manager_id).id : 'none'
          }
        ]);

        // get manager's id by using their first & last names
        const selectedManager = managerAnswers.manager === 'none' ? null : employees.find(employee => employee.id === parseInt(managerAnswers.manager));

        const updateManagerQuery = `
          UPDATE employees
          SET
          manager_id = ?
          WHERE id = ?
        `;

        await db.execute(updateManagerQuery, [selectedManager ? selectedManager.id : null, selectedEmployee.id]);

        console.log('Employee manager updated successfully!');
        break;

      default:
        console.log("Invalid action");
    }

    // ask user if they'd like to continue or go back to main menu
    const { continueOption } = await inquirer.prompt([
      {
        type: 'list',
        name: 'continueOption',
        message: 'Do you want to update more employees?',
        choices: ['Update Employees', 'Go Back to Main Menu']
      }
    ]);

    if (continueOption === 'Update Employees') {
      await updateEmployees();
    } else {
      mainMenu();
    }

  } catch (error) {
    console.error(error);
  }
}

// ADD ROLES
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

// ADD DEPARTMENTS
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
// DELETE ROWS
  // ** this doesn't work exactly as intended - i wanted to add in a check that made sure that deleted dept's didn't have roles associated with them, and that 
  // deleted roles didn't have employees associated with them, if you deleted managers you'd have to reassign a new manager to employees...
  // but it kept giving me errors and i ran out of time. so for now, you just have to be mindful what you're deleting!! **
async function deleteRows() {
  try {
    // get info from the tables
    const departments = await getDepartments();
    const roles = await getRoles();
    const employees = await getEmployees();

    const deptNames = departments.map(department => department.name);
    const roleTitles = roles.map(role => role.title);
    const employeeNames = employees.map(employee => `${employee.first_name} ${employee.last_name}`);

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: "What table would you like to delete data from?",
        choices: ['Departments', 'Roles', 'Employees', 'Quit']
      }
    ]);

    switch (answers.choice) {
      // back to main menu
      case "Quit":
        return mainMenu(); // go back to main menu
      // DEPARTMENTS
      case "Departments":
        const deptAnswers = await inquirer.prompt([
          {
            type: 'list',
            name: 'dept',
            message: "Which department would you like to delete?",
            choices: [...deptNames, 'Quit']
          }
        ]);

        if (deptAnswers.dept === 'Quit') {
          return deleteRows();
        }

        const deleteDept = `
          DELETE FROM departments
          WHERE name = ?`;

        await db.execute(deleteDept, [deptAnswers.dept]);
        console.log("Department removed from database!");
        break;

      // ROLES
      case "Roles":
        const roleAnswers = await inquirer.prompt([
          {
            type: 'list',
            name: 'role',
            message: "Which role would you like to delete?",
            choices: [...roleTitles, 'Quit']
          }
        ]);

        if (roleAnswers.role === 'Quit') {
          return deleteRows();
        }

        const deleteRole = `
          DELETE FROM roles
          WHERE title = ?`;

        await db.execute(deleteRole, [roleAnswers.role]);
        console.log("Role removed from database!");
        break;

      // EMPLOYEES
      case "Employees":
        const employeeAnswers = await inquirer.prompt([
          {
            type: 'list',
            name: 'employeeName',
            message: "Which employee would you like to delete?",
            choices: [...employeeNames, 'Quit']
          }
        ]);

        if (employeeAnswers.employeeName === 'Quit') {
          return deleteRows();
        }

        const [selectedFirstName, selectedLastName] = employeeAnswers.employeeName.split(' ');

        const deleteEmployeeQuery = `
          DELETE FROM employees
          WHERE first_name = ? AND last_name = ?`;

        await db.execute(deleteEmployeeQuery, [selectedFirstName, selectedLastName]);
        console.log("Employee removed from database!");
        break;
    }

    const { continueOption } = await inquirer.prompt([
      {
        type: 'list',
        name: 'continueOption',
        message: 'Do you want to delete more rows from the database?',
        choices: ['Continue', 'Go Back to Main Menu']
      }
    ]);

    if (continueOption === 'Continue') {
      await deleteRows();
    } else {
      mainMenu();
    }

  } catch (error) {
    console.error(error);
  }
}

// ** the "view" options all feel overly complicated, but i couldn't figure out any other way to get the tables
// in the console log to look like the ones in the mockup **

// VIEW ALL EMPLOYEES
function viewEmployees() {
  // drop the view if it exists (needs to be separate from the create view, otherwise it errors)
  const dropView = `DROP VIEW IF EXISTS view_employees;`;
  db.execute(dropView, function (err, results, fields) {
    if (err) {
      console.error(err.message);
      return;
    }

    // create a new view of the joined tables
    const createView = `
      CREATE VIEW view_employees AS
      SELECT 
        e.id AS id,
        e.first_name AS first_name,
        e.last_name AS last_name,
        r.title AS title,
        d.name AS department,
        r.salary AS salary,
        CONCAT(m.first_name, ' ', m.last_name) AS manager
      FROM employees e
      JOIN roles r ON e.role_id = r.id
      JOIN departments d ON r.department_id = d.id
      LEFT JOIN employees m ON e.manager_id = m.id;
    `;

    db.execute(createView, function (err, results, fields) {
      if (err) {
        console.error(err.message);
        return;
      }

      const sql = `SELECT * FROM view_employees`;

      db.execute(sql, function (err, results, fields) {
        if (err) {
          console.error(err.message);
          return;
        }
        // create a cli table for the view. this might be overly complicated but i couldn't find any other way to make a table that looked like the example??
        const table = new Table({
          head: ['ID', 'First Name', 'Last Name', 'Title', 'Department', 'Salary', 'Manager']
        });

        results.forEach(employee => {
          // replace null manager with "N/A" because this table HATES empty fields
          const manager = employee.manager || "N/A";
          table.push([employee.id, employee.first_name, employee.last_name, employee.title, employee.department, employee.salary, manager]);
        });

        console.log(table.toString());

        mainMenu();
      });
    });
  });
}

// VIEW ALL ROLES
function viewRoles() {
  const dropView = `DROP VIEW IF EXISTS view_roles;`;
  db.execute(dropView, function (err, results, fields) {
    if (err) {
      console.error(err.message);
      return;
    }

    const createView = `
      CREATE VIEW view_roles AS
      SELECT 
        r.id AS ID,
        r.title AS Title,
        r.salary AS Salary,
        d.name AS Department
      FROM roles r
      JOIN departments d ON r.department_id = d.id;
    `;

    db.execute(createView, function (err, results, fields) {
      if (err) {
        console.error(err.message);
        return;
      }

      const sql = `SELECT * FROM view_roles`;

      db.execute(sql, function (err, results, fields) {
        if (err) {
          console.error(err.message);
          return;
        }

        const table = new Table({
          head: ['ID', 'Title', 'Salary', 'Department']
        });

        results.forEach(role => {
          table.push([role.ID, role.Title, role.Salary, role.Department]);
        });

        console.log(table.toString());

        mainMenu();
      });
    });
  });
}

// VIEW ALL DEPARTMENTS
function viewDepartments() {
  const dropView = `DROP VIEW IF EXISTS view_departments;`;
  db.execute(dropView, function (err, results, fields) {
    if (err) {
      console.error(err.message);
      return;
    }

    const createView = `
      CREATE VIEW view_departments AS
      SELECT 
        d.id AS ID,
        d.name AS Department
      FROM departments d;
    `;

    db.execute(createView, function (err, results, fields) {
      if (err) {
        console.error(err.message);
        return;
      }

      const sql = `SELECT * FROM view_departments`;

      db.execute(sql, function (err, results, fields) {
        if (err) {
          console.error(err.message);
          return;
        }

        const table = new Table({
          head: ['ID', 'Department']
        });

        results.forEach(department => {
          table.push([department.ID, department.Department]);
        });

        console.log(table.toString());

        mainMenu();
      });
    });
  });
}


mainMenu();