const sqlite = require("sqlite3").verbose();
const dbPath = "./.data/timemanager.db";
const fs = require("fs");
const dbExists = fs.existsSync(dbPath);
const db = new sqlite.Database(dbPath);

if (!dbExists) {
  db.run(`
    CREATE TABLE customers(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT NOT NULL,
      firstname TEXT NOT NULL,
      surname TEXT NOT NULL,
      zipcode INTEGER NOT NULL,
      city TEXT NOT NULL,
      street TEXT NOT NULL,
      housenum INTEGERT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
`);

  db.run(`
    CREATE TABLE employees(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstname TEXT NOT NULL,
      surname TEXT NOT NULL,
      salary INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
`);

  db.run(`
    CREATE TABLE projects(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      customer_id INTEGER NOT NULL,
      hourly_euro INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (customer_id)
       REFERENCES customers (id)
       ON UPDATE RESTRICT
       ON DELETE RESTRICT 
    )
`);

  db.run(`
    CREATE TABLE timelogs(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      project_id INTEGER NOT NULL,
      work_step TEXT NOT NULL,
      employee_id INTEGER NOT NULL,
      types TEXT NOT NULL,
      FOREIGN KEY (employee_id)
       REFERENCES employees (id)
       ON UPDATE RESTRICT
       ON DELETE RESTRICT,
      FOREIGN KEY (project_id)
       REFERENCES projects (id)
       ON UPDATE RESTRICT
       ON DELETE RESTRICT  
    )
`);
}

module.exports = db;
