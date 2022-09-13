USE staff_db;

-- department id order = 1, 2, 3, 4
INSERT INTO department (name)
VALUES ("Engineering"),
        ("Finance"),
        ("Legal"),
        ("Sales");

-- role id order = 1, 2, 3, 4, 5, 6, 7, 8
INSERT INTO role (title, salary, department_id)
VALUES ("Engineer Manager", 150000, 1),
        ("Software Engineer", 120000, 1),
        ("Account Manager", 160000, 2),
        ("Accountant", 125000, 2),
        ("Legal Team Manager", 250000, 3),
        ("Lawyer", 190000, 3),
        ("Sales Manager", 100000, 4),
        ("Salesperson", 80000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Doe", 1, null),
        ("Alyssa", "Tennison", 2, 1),
        ("Cynthia", "Russell", 3, null),
        ("Ainsley", "Tindall", 4, 3),
        ("Quincey", "Monk", 5, null),
        ("Kay", "Peyton", 6, 5),
        ("Erskine", "Appleton", 7, null),
        ("Chelsey", "Barret", 8, 7);