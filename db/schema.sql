CREATE DATABASE staff_db;

USE staff_db;

-- 3 tables needed department, role, & employee

-- Department --> 
    -- id: INT PRIMARY KEY
    -- name: VARCHAR(30) to hold department name

CREATE TABLE department (
id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
name VARCHAR(30),
);

-- role --> 
    -- id: INT PRIMARY KEY
    -- title: VARCHAR(30) -- to hold role title
    -- salary: DECIMAL to hold role salary
    -- department_id: INT to hold reference to the department role belongs to

CREATE TABLE role (
id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
title VARCHAR(30),
salary DECIMAL,
department_id INT,
FOREIGN KEY (department_id)
REFERENCES department(id)
);

-- employee -->
    -- id: INT PIMARY KEY
    -- first_name: VARCHAR(30) to hold employee first name
    -- last_name: VARCHAR(30) to hold employee last name
    -- role_id: INT to hold reference to eployee role
    -- manager_id: INT to hold reference to another employee that is manager of the current employee (null if the employee has no manager)

CREATE TABLE employee (
id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
first_name VARCHAR(30),
last_name VARCHAR(30),
role_id: INT,
manager_id: INT,
FOREIGN KEY (role_id)
REFERENCES roles(id)
);
