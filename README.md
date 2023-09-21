# Employee Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table Of Contents
- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [Dependencies](#dependencies)
- [Credits](#credits)
- [License](#license)

## Description
This Employee Tracker is a command-line interface (CLI) application designed to help you efficiently manage employee information within an organization. This tool enables you to keep track of departments, roles, employees, and their respective managers. With intuitive commands, you can easily add, remove, or update employee records.

## Installation
To get started, follow these steps:

1. Download the repository to your local machine.
2. Open the repository folder in your preferred code editor.
3. Install the necessary dependencies by running the following command in your terminal: `npm install`

### Dependencies
- [Inquirer](https://www.npmjs.com/package/inquirer) v8.2.4 `npm i inquirer@8.2.4`
- [cli-table](https://www.npmjs.com/package/cli-table) `npm i cli-table`
- [dotenv](https://www.npmjs.com/package/dotenv) `npm i dotenv`
- [mysql2](https://www.npmjs.com/package/mysql2) `npm i mysql2`

## Usage
Ensure that you modify the `.env.example` file to contain your mysql user and password. 
Once you've installed the dependencies, you can start the application by running: `npm start`
Use the arrow keys to navigate through the menus and follow the prompts to perform various operations.

## Credits
This project relies on the following technologies and resources:

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Inquirer v8.2.4](https://www.npmjs.com/package/inquirer)

[Stack Overflow thread - mysql & inquirer](https://stackoverflow.com/questions/66626936/inquirer-js-populate-list-choices-from-sql-database).

## License
MIT


