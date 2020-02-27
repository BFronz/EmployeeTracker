
INSERT INTO employee (first_name, last_name, role_id, manager_id )
VALUES 
("Bob",    "Fronczak", 1, 1), 
("Angela", "Hull",     3, 1),
("Vince",  "Lombardi", 3, 1),
("Leo",    "Walsh",    2, 1),
("John",   "Wayne",    1, 2), 
("Joe",    "Green",    4, 2),
("Anna",   "Smith",    5, 2);


INSERT INTO role (title,salary,department_id)
VALUES
("Manager",    100000.00, 1),
("Salesman",    50000.00, 2),
("Programmer",  60000.00, 3),
("Lawyer",      80000.00, 4),
("Clerk",       35000.00, 5);


INSERT INTO  department (name)  
VALUES
("Management"),
("Sales"),
("IT"),
("Legal"),
("Human Resources");


