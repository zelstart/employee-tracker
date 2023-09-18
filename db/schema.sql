DROP DATABASE IF EXISTS workplace_db;
CREATE DATABASE workplace_db;

USE workplace_db;

CREATE TABLE departments (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,

    PRIMARY KEY (id)
);

CREATE TABLE roles (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    salary INTEGER NOT NULL,
    department_id INT NOT NULL,

    PRIMARY KEY (id),
    -- get department data based on department_id
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE employees (
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    manager_id INT,

    PRIMARY KEY (id),
    -- get data from role table based on role_id
    FOREIGN KEY (role_id) REFERENCES roles(id),
    -- self-join to get manager name from id
    FOREIGN KEY (manager_id) REFERENCES employees(id)
);
