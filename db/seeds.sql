INSERT INTO departments (name)
VALUES  ("Sales"),
        ("Legal"),
        ("Finance"),
        ("Engineering");

INSERT INTO roles (title, salary, department_id)
VALUES  ("Account Manager", "160000", 1),
        ("Accountant", "125000", 1),
        ("Legal Team Lead", "250000", 2),
        ("Lawyer", "190000", 2),
        ("Sales Lead", "100000", 3),
        ("Salesperson", "80000", 3),
        ("Lead Engineer", "150000", 4),
        ("Software Engineer", "120000", 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES  ("John", "Doe", 5, NULL),
        ("Mike", "Chan", 6, 1),
        ("Ashley", "Rodriguez", 7, NULL),
        ("Kevin", "Tupik", 8, 3),
        ("Kunal", "Singh", 1, NULL),
        ("Malia", "Brown", 2, 5),
        ("Sarah", "Lourd", 3, NULL),
        ("Tom", "Allen", 4, 7);