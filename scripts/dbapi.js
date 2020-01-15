const db = require("./database");
const md5 = require('md5');

const dbtables = {
  customers: ['firstname','surname','zipcode','city','street','housenum'],
  employees: ['firstname','surname','salary'],
  projects: ['name','description','customer_id','hourly_euro'],
  timelogs: ['date','start_time','end_time','project_id','work_step','employee_id','types']
}

module.exports = {
  
  getAll: tablename => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM ${tablename}`, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },
  
  findByID: (id, tablename) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM ${tablename} WHERE id = $id`,
        {$id:id},
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

  create: (jsonObject, tablename) => {

    let sqlInsert = `INSERT INTO ${tablename} (`;
    dbtables[tablename].forEach(item =>{
      sqlInsert = sqlInsert + `${item}`;
      if(dbtables[tablename].indexOf(item) < (dbtables[tablename].length -1)){
        sqlInsert = sqlInsert +', ';
      }
    });
    sqlInsert = sqlInsert +') VALUES (';
    
    dbtables[tablename].forEach(item =>{
      sqlInsert = sqlInsert + `?`;
      if(dbtables[tablename].indexOf(item) < (dbtables[tablename].length -1)){
        sqlInsert = sqlInsert +', ';
      }
    });
    sqlInsert = sqlInsert + `)`;

    let sqlValues = [];
    dbtables[tablename].forEach(item =>{
      if (item == "password") {
          jsonObject[item] = md5(jsonObject[item]);
          }
      sqlValues.push(jsonObject[item]);
    });
    
    console.log(sqlInsert);
    console.log(sqlValues);

    return new Promise((resolve, reject) => {
      db.run(
        sqlInsert,sqlValues,
        function(err) {
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
            });
        });
    });
  },

  update: (id, jsonObject, tablename) => {
    return new Promise((resolve, reject) => {

      dbtables[tablename].forEach(item =>{
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
          });
        }
      });
      db.get(
        `SELECT * FROM ${tablename} WHERE id = $id`,
        { $id: id},
        (err2, result) => {
          if (err2) {
            reject(err2);
            
          } else {
            resolve(result);
            
          }
        });
    });     
  },
  orderby: (order,tablename) => {
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

  getProjectCustomers: () => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT P.*, C.surname, C.firstname FROM projects AS P, customers AS C WHERE C.id = P.customer_id`, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  getCompleteTimelogs: () => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT T.*, P.name ,E.surname, E.firstname 
              FROM timelogs AS T, projects AS P, employees AS E 
              WHERE E.id = T.employee_id  
              AND  P.id = T.project_id `,
            (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  delete: (id, tablename) => {
    return new Promise((resolve, reject) => {
      db.get("PRAGMA foreign_keys = ON;");
      db.run(
        `DELETE FROM ${tablename} WHERE id = $id`,
        {$id:id},
        (err) =>{
          if (err) {
            reject(err);
          }else {
            resolve('deleted');
          }
        });
    }).catch(() => {return 'failed'});
  },
  
  fakeData: () => {
    return new Promise((resolve, reject) => {
      //TESTDATEN
      db.run(
        `INSERT INTO customers (firstname, surname, zipcode, city, street, housenum) 
                VALUES 
                ("Michael","Jall",86657,"Bissingen","Hochstein",23),
                ("Benjamin","Lämmle",12345,"Schwäbisch-Gmünd","Teststraße1",30),
                ("Chris","Koch",98765,"Rust","Testraße2",45);`
      );
      
      db.run(
        `INSERT INTO timelogs (date, start_time, end_time, project_id, work_step, employee_id, types) 
                VALUES 
                (date('now'),"12:00","15:00",1,"Bauplatz vermessen",1,"Arbeitszeit"),
                (date('now'),"11:30","16:00",2,"Grundstein legen",2,"Arbeitszeit"),
                (date('now'),"7:45","15:42",3,"Anfahrt",3,"Fahrtzeit");`
      );

      db.run(
        `INSERT INTO employees (firstname, surname, salary) 
              VALUES 
              ("Michael","Jall", 10),
              ("Benjamin","Lämmle", 15),
              ("Simone","Kunze", 20),
              ("Janina","Heidenreich", 40),
              ("Josephine","Lechner",37),
              ("Chris","Koch",99);`
      );
      
      db.run(
        `INSERT INTO projects (name, description, customer_id, hourly_euro) 
                VALUES 
                ("DHBW Heidenheim","Bau einer neuen Hochschule in Heidenheim",1,30),
                ("Flughafen München","Landebahn 3-8 erweitern",1,35),
                ("Flughafen Berlin","Schadensbegrenzung",2,40),
                ("EFH Maier","Bau eines EFH in Heidenheim für FA Maier",3,7),
                ("MFH Lämmle","MFH für FA Lämmle in Schwäbisch-Gmünd",3,100),
                ("Voith Turbo Lagerhalle","Austausch der Sprinkleranlage und Aufbau neuer Beleuchtung",1,77),
                ("ADK Modulraum","Restaurierung Südwand nach Hagelschaden",2,88),
                ("Grundschule Schwäbisch-Gmünd","Bau eines neuen Klassenzimmers auf der Ostseite",3,12);`
      );
      resolve('done');
    });
  }  
}

