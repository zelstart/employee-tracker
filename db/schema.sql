DROP DATABASE IF EXISTS workplace_db;
CREATE workplace_db;

USE workplace_db;

CREATE TABLE department (
    id INT AUTO_INCREMENT NOT NULL,
    name VARCHAR(30) NOT NULL,
    
    PRIMARY KEY (id)
);

CREATE TABLE role (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    salary INTEGER NOT NULL,
    department_id INT NOT NULL,
    
    PRIMARY KEY (id)
    FOREIGN KEY (department_id)
    REFERENCES department(id)
)

CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    manager_id INT NOT NULL,

    PRIMARY KEY (id)
    FOREIGN KEY (role_id)
    REFERENCES role(id)
);


