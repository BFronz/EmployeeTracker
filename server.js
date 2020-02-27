const inquirer = require("inquirer");
const mysql    = require("mysql");
const cTable   = require("console.table");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "employeeTracker_DB"
});

connection.connect(function(err) {
    if (err) throw err;  
    start();
  });




function start () {
    inquirer
    .prompt([
        {
            type: "list",
            name: "todo",
            message: "Please Select an Action",
            choices: [
                "View All Employees",
                "View All Employees by Department",
                "View All Employees by Manager",
                "View Total Budget",
                "Add Employee",
                "Remove Employee",
                "Update Employee Role",
                "Update Employee Manager",
                "Add Department",
                "Add Role",
                "END"
            ]
        }
    ]).then(response => {

        switch (response.todo) {  
                 
            case "View All Employees":
                viewAll();
                break;
    
            case "View All Employees by Department":
                viewAllDept();
                break;

            case "View All Employees by Manager":
                viewAllManager();
                break;
               
            case "View Total Budget":
                viewBudget();
                break;               
                
            case "Add Employee":
                addEmployee();
                break;
        
            case "Remove Employee":
                rmvEmployee();
                break;
    
            case "Update Employee Role":
                updateRole();
                break;
             
            case "Update Employee Manager":
                updateManager();
                break;    
                        
            case "Add Department":
                addDepartment();
                break;
         
            case "Add Role":
                addRole();
                break;               

                default:  
             
                process.exit(-1);
                break;
        }
    });
}


//View All Employees
function viewAll(){

       var query = "SELECT employee.id, manager_id as mgr_id, first_name, last_name, title, department.name department, salary,";
           query += "(SELECT CONCAT(first_name, ' ', last_name) FROM employee WHERE manager_id=mgr_id limit 1 ) AS manager ";
           query += "FROM employee ";
           query += "LEFT JOIN role ON role_id =  role.id ";
           query += "LEFT JOIN department ON department_id = department.id ";
          connection.query(query, function(err, result) {
            console.log("\n\n");      
          console.table(result);
          });
        start();  
}
                

//View All Employees by Department
function viewAllDept(){
   
   connection.query("SELECT name FROM department", function(err, result) {
    if (err) throw err; 
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < result.length; i++) {
              choiceArray.push(result[i].name);
            }
            return choiceArray;
          },
          message: "Select a Department?"
        }
      ])
      .then(function(answer) {           
             var query = "SELECT employee.id, manager_id AS mgr_id, first_name, last_name, title, department.name as department, salary,";
                query += "(SELECT CONCAT(first_name, ' ', last_name) FROM employee WHERE manager_id=mgr_id limit 1 ) AS manager ";
                query += "FROM employee ";
                query += "LEFT JOIN role ON role_id =  role.id ";
                query += "LEFT JOIN department ON department_id = department.id ";
                query += "WHERE ?";
             connection.query(query, { name: answer.choice }, function(err, result) {
                console.log("\n\n");   
                console.table(result);
            });
            
            start();
      });
  });
  
}
                

//View All Employees by Manager
function viewAllManager(){
    
    connection.query("SELECT CONCAT(first_name, ' ', last_name) as name FROM employee WHERE role_id=1", function(err, results) {
        if (err) throw err; 
        inquirer
          .prompt([
            {
              name: "choice",
              type: "rawlist",
              choices: function() {
                var choiceArray = [];
                for (var i = 0; i < results.length; i++) {
                  choiceArray.push(results[i].name);
                }
                return choiceArray; 
              },
              message: "Select a Manager?"
            }
          ])
          .then(function(answer) {   
              

                    var query = "SELECT employee.id, manager_id AS mgr_id, first_name, last_name, title, department.name, salary ";
                    query += "FROM employee ";
                    query += "LEFT JOIN role ON role_id =  role.id ";
                    query += "LEFT JOIN department ON department_id = department.id ";
                    query += "WHERE manager_id= (SELECT manager_id FROM employee WHERE CONCAT(first_name, ' ', last_name)  = '"+answer.choice+"' LIMIT 1) ";
                    query += "AND  CONCAT(first_name, ' ', last_name)  != '"+answer.choice+"' ";
                    
                        
                    connection.query(query, function(err, results) {
                        console.log("\n\n"); 
                        console.table(results);
                    });
                    start();
          });
      });


}
                
               
//"View Total Budget
function viewBudget(){

    var query = "SELECT department.name AS Department, SUM(salary) AS Budget ";
        query += "FROM department ";
        query += "LEFT JOIN role ON department.id =  role.id ";
        query += "LEFT JOIN employee ON role_id =  role.id ";
        query += "GROUP BY Department ";
        connection.query(query, function(err, result) {
            console.log("\n\n"); 
            console.table(result);
        });
        start();  
}
                             
                
//Add Employee
function addEmployee(){

   connection.query("SELECT title FROM role", function (err, result) {
    // console.log(result)

    var mgr_id=""; 
    var titleArr = [];

    for (var i = 0; i < result.length; i++) {
      titleArr.push(result[i].title)
    //   console.log(titleArr)
    }

    // The prompts need to live inside the asynchronus query
    inquirer
      .prompt([
        {
          name: "fname",
          type: "input",
          message: "Enter First Name"
        },
        {
          name: "lname",
          type: "input",
          message: "Enter Last Name?"
        },

        {
          name: "role",
          type: "list",
          message: "Select a role",
          choices: titleArr
        }


      ])
      .then(function (answer) {
        // when finished prompting, insert new employee info into table
   
        
        connection.query("SELECT id FROM role WHERE title = ? ", [answer.role], function (err, res) {
            if (err) throw err;
            console.log(res[0].id);

              if(mgr_id===""){mgr_id=1;}  

            
            connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
              [answer.fname,answer.lname,res[0].id, mgr_id], 

              function (err) {
                if (err) throw err;
               
                console.log("\n\n");  
                start();
              }
            );

          }
        )


      });
  }
  )

}
                
        
//Remove Employee
function rmvEmployee(){

}
               
    
//Update Employee Role
function updateRole(){

}
                
             
//Update Employee Manager
function updateManager(){

}
                 
                        
//Add Department
function addDepartment(){

}
             
         
//Add Role
function addRole(){

}
                        

























// REQUIRED
// Add departments
//     ask for deprtment input
//     SELECT count(*) FROM department where name = "< new department input>";
//     if null
//     INSERT INTO department VALUES ("new epartment inout");
//     then ask if they want to add role
//     then ask if they want add employee


// Add roles
//     ask for role
//     SELECT count(*) FROM role WHERE  title = "<new role input>";
//     if null

//     SELECT max(id) FROM department
//     ask for salary and department
//     INSERT INTO role (title,salary,department_id)
//     VALUES ("<new roll input>",  <new salary input>, <maxid +1>);
//     INSERT INTO department VALUES ("new department inout");
//     if new department send to add department


// Add employees

//     get roles
//     SELECT role_id, title FROM employee 
//     INNER JOIN role ON role_id = role.id
//     GROUP BY role_id;

//      get managers

//     SELECT first_name,last_name, manager_id FROM employee 
//     WHERE manager_id =1 

//     ask for first, last, role id and manager id
//     INSERT INTO employee (first_name, last_name, role_id, manager_id )
//     VALUES 
//     ("<new fname input>",    "<new lname input>", <role>, <manager>), 
//     if new roll needed send to role
//     if new department needed sent to department



// View departments, roles, employees
    // SELECT department.name, title, first_name, last_name
    // FROM department
    // LEFT JOIN role ON department.id =  role.department_id
    // LEFT JOIN employee ON role.id = employee.role_id;


    // SELECT employee.id, manager_id as m, first_name, last_name, title, department.name, salary,

    //    (SELECT CONCAT(first_name, "  ", last_name)  
    //     FROM employee WHERE manager_id=m limit 1 ) AS mname

    // FROM employee
    // LEFT JOIN role ON role_id =  role.id
    // LEFT JOIN department ON department_id = department.id;


// Error Code: 1241. Operand should contain 1 column(s)



// Update employee roles
//     list employees
//     SELECT * FROM employee;
    
//      roles & id
//     SELECT role_id, title FROM employee 
//     INNER JOIN role ON role_id = role.id
//     GROUP BY role_id;

//     UPDATE employee SET role_id =<role_id input>
//      WHERE id=<id selected> ;
    


// BONUS
// Update employee managers

//   list employees
//     SELECT * FROM employee;
    
//     get managers
//     SELECT first_name,last_name, manager_id FROM employee 
//     WHERE manager_id =1 

//     UPDATE employee SET  manager_id=<managerid input>
//      WHERE id=<id selected> ;



// View employees by manager
//    SELECT first_name,last_name, manager_id FROM employee 
//     WHERE manager_id =1 

//    SELECT first_name, last_name, manager_id FROM employee
//    WHERE  role_id !=1; 
   


    



// Delete departments, roles, and employees

// SELECT * FROM department;
// DELETE FROM department WHERE id= <id selected>;
// UPDATE role SET department_id=0 WHERE department_id=<id selected>

// SELECT * FROM role;
// DELETE FROM role WHERE id= <id selected>;
// UPDATE employee SET role_id=0 WHERE role_id=<id selected>

// SELECT * FROM employee;
// DELETE FROM employee WHERE id= <id selected>;



// View the total utilized budget of a department
// ie the combined salaries of all employees in that department
