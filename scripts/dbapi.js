const db = require("./database");

/** @const {object} dbtables*/
const dbtables = {
  customers: [
    "company",
    "firstname",
    "surname",
    "zipcode",
    "city",
    "street",
    "housenum"
  ],
  employees: ["firstname", "surname", "salary"],
  projects: ["name", "description", "customer_id", "hourly_euro"],
  timelogs: [
    "date",
    "start_time",
    "end_time",
    "project_id",
    "work_step",
    "employee_id",
    "types"
  ]
};

module.exports = {
  /**
   * Get all data from a database table.
   * @param {string} tablename - The tablename of the Selected Table
   * @returns {Promise} - Promise object with all data from table
   */
  getAll: tablename => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM ${tablename} ORDER BY id DESC`, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  /**
   * Find data in table by id.
   * @param {number} id - The id which will be searched for.
   * @param {string} tablename - The tablename of the Selected Table
   * @returns {Promise} - Promise object with all data from table where id = id
   */
  findByID: (id, tablename) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM ${tablename} WHERE id = $id`,
        { $id: id },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  },

  /**
   * Insert Json data in table
   * @param {JSON} jsonObject - the data which will be insert
   * @param {string} tablename - The tablename of the Selected Table
   * @returns {Promise} - Promise object with insertet data for check
   */
  create: (jsonObject, tablename) => {
    let sqlInsert = `INSERT INTO ${tablename} (`;
    dbtables[tablename].forEach(item => {
      sqlInsert = sqlInsert + `${item}`;
      if (dbtables[tablename].indexOf(item) < dbtables[tablename].length - 1) {
        sqlInsert = sqlInsert + ", ";
      }
    });
    sqlInsert = sqlInsert + ") VALUES (";

    dbtables[tablename].forEach(item => {
      sqlInsert = sqlInsert + `?`;
      if (dbtables[tablename].indexOf(item) < dbtables[tablename].length - 1) {
        sqlInsert = sqlInsert + ", ";
      }
    });
    sqlInsert = sqlInsert + `)`;

    let sqlValues = [];
    dbtables[tablename].forEach(item => {
      sqlValues.push(jsonObject[item]);
    });

    console.log(sqlInsert);
    console.log(sqlValues);

    return new Promise((resolve, reject) => {
      db.run(sqlInsert, sqlValues, function(err) {
        if (err) {
          reject(err);
          return;
        }
        db.get(
          `SELECT * FROM ${tablename} WHERE id = $id`,
          { $id: this.lastID },
          (err2, result) => {
            if (err2) {
              reject(err2);
            } else {
              resolve(result);
            }
          }
        );
      });
    });
  },

  /**
   * update data in table by id with data from jsonObject
   * @param {JSON} jsonObject - the data which will be insert on update
   * @param {number} id - The id which will be updated
   * @param {string} tablename - The tablename of the Selected Table
   * @returns {Promise} - Promise object with insertet data for check
   */
  update: (id, jsonObject, tablename) => {
    return new Promise((resolve, reject) => {
      dbtables[tablename].forEach(item => {
        if (jsonObject[item] != null) {
          db.run(
            `UPDATE ${tablename} SET ${item} = $newItem WHERE id = $id`,
            {
              $newItem: jsonObject[item],
              $id: id
            },
            function(err) {
              if (err) {
                reject(err);
              }
            }
          );
        }
      });
      db.get(
        `SELECT * FROM ${tablename} WHERE id = $id`,
        { $id: id },
        (err2, result) => {
          if (err2) {
            reject(err2);
          } else {
            resolve(result);
          }
        }
      );
    });
  },

  /**
   * output a Table by order
   * @param {string} order - The order which should be used
   * @param {string} tablename - The tablename of the Selected Table
   * @returns {Promise} - Promise object with ordered data
   */
  orderby: (order, tablename) => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM ${tablename} ORDER BY ${order}`, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  /**
   * output Data from Projects with additonal informations
   * @returns {Promise} - Promise object with all data
   */
  getProjectCustomers: () => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT P.*, C.surname, C.firstname, C.company FROM projects AS P, customers AS C WHERE C.id = P.customer_id ORDER BY P.id DESC`,
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });
  },

  /**
   * output Data from Timelogs with additonal informations
   * @returns {Promise} - Promise object with all data
   */
  getCompleteTimelogs: () => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT T.*, P.name ,E.surname, E.firstname 
              FROM timelogs AS T, projects AS P, employees AS E 
              WHERE E.id = T.employee_id  
              AND  P.id = T.project_id ORDER BY T.date DESC`,
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });
  },

  /**
   * delete data by id
   * @param {number} id - The id which will be delted
   * @param {string} tablename - The tablename of the Selected Table
   * @returns {Promise} - if sucessfull -> deleted else -> failed
   */
  delete: (id, tablename) => {
    return new Promise((resolve, reject) => {
      db.get("PRAGMA foreign_keys = ON;");
      db.run(`DELETE FROM ${tablename} WHERE id = $id`, { $id: id }, err => {
        if (err) {
          reject(err);
        } else {
          resolve("deleted");
        }
      });
    }).catch(() => {
      return "failed";
    });
  },

  /**
   * used for input test Data
   * @returns {Promise} - when complete insert -> done
   */
  testdata: () => {
    return new Promise((resolve, reject) => {
      //TESTDATEN
      db.run(
        `INSERT INTO customers (company, firstname, surname, zipcode, city, street, housenum) 
                VALUES 
                ("","Annalena","Bruckner",86657,"Bissingen","Hochstein",66),
                ("Malerbedarf Schwenker","Johannes","Schwenker",67393,"Düsseldorf","Malerstraße",12),
                ("","Detlef","Maier",38776,"Schweinspoint","An der Halde",7),
                ("DHBW Heidenheim","Jürgen","Seitz",89945,"Heidenheim","Schnaitheimer-Straße",45);`
      );

      db.run(
        `INSERT INTO timelogs (date, start_time, end_time, project_id, work_step, employee_id, types) 
                VALUES 
                ("2020-01-08","08:00","16:42",1,"Regale aufbauen",4,"Arbeitszeit"),
                ("2020-01-14","15:00","17:20",4,"Ausmessen der Parkflächen",4,"Arbeitszeit"),
                ("2020-01-09","10:30","15:25",6,"Entfernen der alten Fließen",4,"Arbeitszeit"),
                ("2020-01-16","07:30","08:35",1,"Anfahrt",2,"Fahrtzeit"),
                ("2020-01-15","15:00","16:45",3,"Pflanzen von Primeln",2,"Arbeitszeit"),
                ("2020-01-01","15:00","18:30",5,"Anfahrt",3,"Fahrtzeit"),
                ("2020-01-02","08:20","09:46",3,"Anfahrt",2,"Fahrtzeit");`
      );

      db.run(
        `INSERT INTO employees (firstname, surname, salary) 
              VALUES 
              ("Simone","Kunze", 29.99),
              ("Josy","Lechner", 65.70),
              ("Janina","Heidenreich", 7),
              ("Chris","Koch", 133.66);`
      );

      db.run(
        `INSERT INTO projects (name, description, customer_id, hourly_euro) 
                VALUES 
                ("Anbau Bibliothek","Erweiterung der Bibliothek am Hauptstandort um einen weiteren Flügel",4,37.50),
                ("Malerarbeien Kanine","Streichen der Kantine inkl. Küche am Hauptstandort Heidenheim",4,145.67),
                ("Gartenbepflanzung","Bepflanzung des Fartens am EFH Maier mit Bäumen,Sträuchern und Blumen",3,18.99),
                ("Ausbau Parkplatz","Erweiterung des Parkplatzes um 10 Parkplätz am Geschäftsstandort",2,56.40),
                ("Erweiterung der Uniräume","Ausstattung aller Lehrräume mit Dokumentenkameras",4,17),
                ("Badrestaurierung 1.Stock","Restaurierung des Bad im 1.Stock inkl. Fließen legen",2,60.53);`
      );
      resolve("done");
    });
  }
};
