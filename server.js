const inquirer = require("inquirer");
const cTable   = require("console.table");
var connection = require("./config/connection");


// init app
start ();


// main directional prompt
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
                "END PROGRAM"
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


// view all employees
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
                

// view all employees by department
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
                

// view all employees by manager
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
                
               
// view total budget
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
                             
                
// add employee
function addEmployee(){


   // role drop down data 
   connection.query("SELECT title FROM role", function (err, result) {
    if (err) throw err;  
   
    var titleArr = [];

    for (var i = 0; i < result.length; i++) {
      titleArr.push(result[i].title)
    }

    // manager data
    var managerArr = [];
    connection.query("SELECT CONCAT(first_name, ' ', last_name) AS name, id FROM employee WHERE role_id=1", function (err, res) {
        if (err) throw err;
         
        for (var i = 0; i < res.length; i++) {
        //  var com = res[i].name + " #" + res[i].id;
        //  managerArr.push(com);
        managerArr.push(res[i].name);
        }
        return managerArr;
        }); 
      
    // prompts need to be  inside  asynchronus query
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
        },
        {
            name: "mgr",
            type: "list",
            message: "Select a Manager",
            choices: managerArr
          }
      ])
      .then(function (answer) {
 
             //  match title with role id for insert
            connection.query("SELECT id FROM role WHERE title = ? ", [answer.role], function (err, res) {
             if (err) throw err;

                // get manager id then do insert
                var managerID = '';         
                getManagerId(answer.mgr, function(result){
                    var managerID = result;
                    console.log(managerID);

                        connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",      
                            [answer.fname, answer.lname,res[0].id, managerID], function (err, data) {
                                if (err) throw err; 
                                start();
                        }); 
                });   
            });
        });
  });

} 
                
        
// remove employee
function rmvEmployee(){

    // get employee list to remove
    connection.query("SELECT CONCAT(first_name, ' ', last_name) AS name FROM employee", function (err, result) {
        if (err) throw err;

        var employeeArr = [];  
        for (var i = 0; i < result.length; i++) {
            employeeArr.push(result[i].name)
        }
    
        inquirer
          .prompt([
            {
              name: "name",
              type: "list",
              message: "Select Employee to Remove",
              choices: employeeArr
            }
          ])
          .then(function (answer) {
  
            // get id from name
            connection.query("SELECT id FROM employee WHERE  CONCAT(first_name, ' ', last_name) = ?", [answer.name], function (err, res) {
                if (err) throw err;
                
                // make remove
                connection.query("DELETE FROM employee WHERE id=?",[res[0].id], function (err) {
                    if (err) throw err;
                    console.log("\n\n");  
                    start();
                  }
                );
              });
          });
      });
}
               
    
// update employee role
function updateRole(){
 
    // employee drop down data 
    connection.query("SELECT CONCAT(first_name, ' ', last_name) AS name, id FROM employee ", function (err, res) {  
    if (err) throw err;  
   
    var employeeArr = [];

    for (var i = 0; i < res.length; i++) {
      employeeArr.push(res[i].name)
    }

    // role data
    var titleArr = [];
    connection.query("SELECT title  FROM role", function (err, result) {
        if (err) throw err;
         
        for (var i = 0; i < result.length; i++) {
        titleArr.push(result[i].title);
        }
        return titleArr;
        }); 
      
    inquirer
      .prompt([

        {
            name: "ename",
            type: "list",
            message: "Select a Employee",
            choices: employeeArr
          },


        {
            name: "role",
            type: "list",
            message: "Select a Role",
            choices: titleArr
          }
       
     
      ])
      .then(function (answer) {
 
             //  get employee & title id for insert
            connection.query("SELECT id FROM employee WHERE CONCAT(first_name, ' ', last_name)=?", [answer.ename], function (err, res) {
             if (err) throw err;

                connection.query("SELECT id FROM role WHERE title = ? ", [answer.role], function (err, result) {
                    if (err) throw err;

                    console.log(result[0].id);

                    connection.query("UPDATE  employee SET role_id = ? WHERE id=?",[result[0].id,res[0].id], function (err) {
                        if (err) throw err;
                        console.log("\n\n");  
                        start();
                      });

                });
                        
                 
            });
        });
  });

}
                
             
// update employee manager
function updateManager(){

   // employee drop down data 
   connection.query("SELECT CONCAT(first_name, ' ', last_name) AS name, id FROM employee ", function (err, res) {  
    if (err) throw err;  
   
    var employeeArr = [];

    for (var i = 0; i < res.length; i++) {
      employeeArr.push(res[i].name)
    }

    // manager data
    var managerArr = [];
    connection.query("SELECT CONCAT(first_name, ' ', last_name) AS name, id FROM employee WHERE role_id=1", function (err, res) {
        if (err) throw err;
         
        for (var i = 0; i < res.length; i++) {
        managerArr.push(res[i].name);
        }
        return managerArr;
        }); 
      
    inquirer
      .prompt([

        {
            name: "ename",
            type: "list",
            message: "Select a Employee",
            choices: employeeArr
          },
        {
            name: "mgr",
            type: "list",
            message: "Select a Manager",
            choices: managerArr
          } 
      ])
      .then(function (answer) {
 
             //  get employee & manager id for insert
            connection.query("SELECT id FROM employee WHERE CONCAT(first_name, ' ', last_name)=?", [answer.ename], function (err, emplData) {
             if (err) throw err;

                connection.query("SELECT id FROM employee WHERE manager_id='1' AND CONCAT(first_name, ' ', last_name)=?", [answer.mgr], function (err, manData) {
                    if (err) throw err;
                    // console.log(answer.mgr,answer.ename);
                    // console.log(manData[0].id,emplData[0].id);

                    connection.query("UPDATE  employee SET manager_id = ? WHERE id=?",[manData[0].id,emplData[0].id], function (err) {
                        if (err) throw err;
                        console.log("\n\n");  
                        start();
                      });

                });
                        
                 
            });
        });
  });



}
                 
                        
// add a department
function addDepartment(){

    inquirer
      .prompt([
        {
          name: "department",
          type: "input",
          message: "Enter New Department"
        }
      ])
      .then(function (answer) {
 
        // check if  exists, warn if it does and prompt else insert
        connection.query("SELECT count(*)  AS num FROM department WHERE name=?", [answer.department], function (err, res) {
            if (err) throw err;
           
            if(res[0].num>0) {
                console.log("Department Already Set. Please Add Another.");
                addDepartment();
            }else {
                connection.query("INSERT INTO department (name) VALUES (?)",[answer.department], function (err) {
                    if (err) throw err;  
                    console.log("\n\n");
                    var table = "department";  
                    showData (table);
                    start();
                }
                );
            }

        });
  });   


}
             
         
// add a role
function addRole(){

    // get list of departments
    connection.query("SELECT name FROM department", function (err, result) {
        if (err) throw err;  

    var departmentArr = [];
    for (var i = 0; i < result.length; i++) {
        departmentArr.push(result[i].name)
    }

    inquirer
      .prompt([
        {
          name: "title",
          type: "input",
          message: "Enter New Role"
        },
        {
          name: "salary",
          type: "input",
          message: "Enter Role Salary?"
        },

        {
          name: "department",
          type: "list",
          message: "Select a Department",
          choices: departmentArr
        }
      ])
      .then(function (answer) {
 
        // check if  exists, warn if it does and prompt else insert
        connection.query("SELECT id FROM department WHERE name= ?", [answer.department], function (err, res) {
            if (err) throw err;
               
            connection.query("INSERT INTO role (title,salary,department_id) VALUES (?, ?, ?)",[answer.title,answer.salary,res[0].id],function (err) {
                if (err) throw err;

                var table = "role";
                showData (table);
                console.log("\n\n");  
                start();
              }
            );
          });
      });
  });   
}

// extra helper function

function showData (tableName){
    connection.query("SELECT * FROM "+tableName+" ", function (err, result) {
      if (err) throw err;    
      console.log("\n"+tableName);  
      console.table(result);
      start();
    }
  );
}
    

function getManagerId(name, callback){
     connection.query("SELECT manager_id as id FROM employee WHERE CONCAT(first_name, ' ', last_name) = ?", [name],  function (err, results) {
            if (err) throw err;
            // console.log(results[0].id); 
            return callback(results[0].id);
            }); 
}

function getEmployeeNames(name, callback){
    connection.query("SELECT CONCAT(first_name, ' ', last_name) AS name FROM employee ",  function (err, results) {
           if (err) throw err;
        
           var employeeArr = [];  
           for (var i = 0; i < results.length; i++) {
               employeeArr.push(results[i].name)
           }
           return callback(employeeArr);
           }); 
}

