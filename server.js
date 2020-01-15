// init project
const express = require("express");
const exphbs  = require('express-handlebars');
const bodyParser = require("body-parser");

const app = express();
 
const hbs = exphbs.create({
  defaultLayout: "main",
  extname: ".hbs",
  helpers: require("./scripts/helpers.js").helpers
     
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
Insert modules from Scripts as const 
*/
const dbapi = require("./scripts/dbapi");
const db = require("./scripts/database");

const tables = ["timelogs", "customers", "employees", "projects"];


/*
Web routes
@URL 
*/

app.get('/home', async (req, res) => {
  res.render('home');
});

app.get('/', async (req, res) => {
  const customers = await dbapi.getAll('customers');
  const timelogs = await dbapi.getAll('timelogs'); 
  const projCust = await dbapi.getProjectCustomers();
  const projects = await dbapi.getAll('projects');
  const employees = await dbapi.getAll('employees');
  
  res.render('overview',{
    projCust: projCust,
    customers: customers,
    projects: projects,
    timelogs: timelogs,
    employees: employees
  });
});

app.get('/customers', async (req, res) => {
  const customers = await dbapi.getAll('customers');
  res.render('customers',{
    customers: customers
  });
});

app.get('/projects', async (req, res) => {
  const customers = await dbapi.getAll('customers'); 
  const projCust = await dbapi.getProjectCustomers();
  res.render('projects',{
    projCust: projCust,
    customers: customers
  });
});

app.get('/employees', async (req, res) => {
  const employees = await dbapi.getAll('employees');
  res.render('employees',{
    employees: employees
  });
});

app.get('/timelogs', async (req, res) => {
    const timelogs = await dbapi.getCompleteTimelogs();
    const employees = await dbapi.orderby('surname','employees');
    const projects = await dbapi.orderby('customer_id','projects');
    res.render('timelogs',{
      timelogs: timelogs, employees: employees, projects: projects
    });
});



/*
Web formes post
@URL 
*/
app.post('/submit-form', async (req, res) => {
  await dbapi.create(req.body,req.body.tablename);
  res.status(201).redirect(`/${req.body.tablename}`);
})

app.post('/update', async (req, res) => {
  console.log(req.body);
  await dbapi.update(req.body.id, req.body, req.body.tablename);
  res.status(201).redirect(`/${req.body.tablename}`);
  
});

app.post('/delete', async (req, res) => {
  delAnswer = await dbapi.delete(req.body.id, req.body.tablename);
  console.log(delAnswer);
  if(delAnswer == 'failed'){
    res.sendStatus(409);
  }else{
    res.status(204).redirect(`/${req.body.tablename}`);
  }
    
  
  
});

app.post("/fakeData", async (req, res) => {
  await dbapi.fakeData();
  res.status(201).redirect(`/`);
});


/*
API's
@URL /api/v1/*
*/

tables.forEach(table => {
  //API getAll from table
  app.get(`/api/v1/${table}`, async (req, res) => {
    const tableData = await dbapi.getAll(table);
    res.send(tableData);
  });

  //API get table item by id
  app.get(`/api/v1/${table}/:id`, async (req, res) => {
    const tableItem = await dbapi.findByID(req.params.id, table);
    if (tableItem == null) {
        res
          .status(404)
          .send({ error: `no Item in ${table} with id ${req.params.id} found` });
          return;
      }
      res.send(tableItem);
  });

  //API delete Item by id from Table
  app.delete(`/api/v1/${table}/:id`, async (req, res) => {
      const delAnswer = await dbapi.delete(req.params.id, table);  
      if (delAnswer == 'failed') {
        return res.sendStatus(409);
      } else {
        return res.sendStatus(204);
      }
      
    });

  app.post(`/api/v1/${table}`, async (req, res) => {
    const newContent = await dbapi.create(req.body, table);
    res.status(201).send(newContent);
  });

  app.put(`/api/v1/${table}/:id`, async (req, res) => {
    
    const updateItem = await dbapi.update(req.params.id, req.body ,table);
  
    if (updateItem == null) {
      res
        .status(404)
        .send({ error: `updateItem with ID ${req.params.id} not found` });
      return;
    }
    res.send(updateItem);
  });

});


// API insert dummy data

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
