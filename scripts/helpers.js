function timediff(value1, value2) {
  var start = value1.toString().split(":");
  var end = value2.toString().split(":");
  var startDate = new Date(0, 0, 0, start[0], start[1], 0);
  var endDate = new Date(0, 0, 0, end[0], end[1], 0);
  if (endDate.getTime() < startDate.getTime()) {
    return "Bitte Zeiten ändern";
  }
  var diff = endDate.getTime() - startDate.getTime();
  return diff;
}

function formatTime(time) {
  var hours = Math.floor(time / 1000 / 60 / 60);
  time -= hours * 1000 * 60 * 60;
  var minutes = Math.floor(time / 1000 / 60);
  if (minutes < 10) {
    minutes = 0 + "" + minutes;
  }
  if (hours < 10) {
    hours = 0 + "" + hours;
  }
  if (hours == 0 && minutes == 0) {
    return " --";
  }
  return hours + ":" + minutes + "h";
}

var register = function(Handlebars) {
  var helpers = {
    recordedTime: function(start, end) {
      var diff = timediff(start, end);
      return formatTime(diff);
    },

    moneyFix: function(money) {
      return money.toFixed(2);
    },
    eval_projects_money: function(project_id, hourtime, timelogs) {
      let money;
      let times = [];

      timelogs.forEach(timelog => {
        if (timelog.project_id == project_id) {
          times.push(timelog);
        }
      });
      var minutesall = 0;
      times.forEach(row => {
        var diff = timediff(row.start_time, row.end_time);
        var minutes = Math.floor(diff / 1000 / 60);
        minutesall = minutesall + minutes;
      });
      money = minutesall * (hourtime / 60);
      money = money.toFixed(2) + "€";
      if (money == "0.00€") {
        return "--";
      }
      return money;
    },
    eval_projects_time: function(project_id, timelogs, worktyp) {
      let times = [];
      let timesum = 0;
      timelogs.forEach(timelog => {
        if (timelog.project_id == project_id) {
          times.push(timelog);
        }
      });
      times.forEach(row => {
        if (worktyp != "all") {
          if (row.types == worktyp) {
            var diff = timediff(row.start_time, row.end_time);
            timesum = timesum + diff;
          }
        } else {
          var diff = timediff(row.start_time, row.end_time);
          timesum = timesum + diff;
        }
      });
      return formatTime(timesum);
    },
    eval_customer_time: function(id, timelogs, projects) {
      let projectsarr = [];
      let times = [];
      let timesum = 0;
      projects.forEach(project => {
        if (project.customer_id == id) {
          projectsarr.push(project);
        }
      });
      projectsarr.forEach(arr => {
        timelogs.forEach(timelog => {
          if (timelog.project_id == arr.id) {
            times.push(timelog);
          }
        });
      });
      times.forEach(time => {
        var diff = timediff(time.start_time, time.end_time);
        timesum = timesum + diff;
      });

      return formatTime(timesum);
    },
    count_projects_customer: function(id, projects) {
      let projectsarr = [];
      projects.forEach(project => {
        if (project.customer_id == id) {
          projectsarr.push(project);
        }
      });
      return projectsarr.length;
    },
    eval_customer_money: function(id, projects, timelogs) {
      let projectsarr = [];
      let times = [];
      let timesum = 0;
      let moneysolo = 0;
      let moneysum = 0;

      projects.forEach(project => {
        if (project.customer_id == id) {
          projectsarr.push(project);
        }
      });

      projectsarr.forEach(arr => {
        times = [];
        timelogs.forEach(timelog => {
          if (timelog.project_id == arr.id) {
            times.push(timelog);
          }
        });
        times.forEach(time => {
          var diff = timediff(time.start_time, time.end_time);
          var minutes = Math.floor(diff / 1000 / 60);
          timesum = timesum + minutes;
        });

        moneysolo = timesum * (arr.hourly_euro / 60);
        moneysum = moneysum + moneysolo;
        timesum = 0;
      });
      moneysum = moneysum.toFixed(2) + "€";
      if (moneysum == "0.00€") {
        return "--";
      }

      return moneysum;
    },
    eval_employee_time: function(employee_id, timelogs, worktyp) {
      let times = [];
      let timesum = 0;
      timelogs.forEach(timelog => {
        if (timelog.employee_id == employee_id) {
          times.push(timelog);
        }
      });
      times.forEach(row => {
        if (worktyp != "all") {
          if (row.types == worktyp) {
            var diff = timediff(row.start_time, row.end_time);
            timesum = timesum + diff;
          }
        } else {
          var diff = timediff(row.start_time, row.end_time);
          timesum = timesum + diff;
        }
      });
      return formatTime(timesum);
    },

    eval_employee_money: function(employee_id, employee_salery, timelogs) {
      let times = [];
      let timesum = 0;
      let money = 0;
      timelogs.forEach(timelog => {
        if (timelog.employee_id == employee_id) {
          times.push(timelog);
        }
      });
      times.forEach(row => {

            var diff = timediff(row.start_time, row.end_time);
            var minutes = Math.floor(diff / 1000 / 60);
            timesum = timesum + minutes;
          

      });
      money = timesum * (employee_salery / 60);
      money = money.toFixed(2) + "€";
      if (money == "0.00€") {
        return "--";
      }
      return money;
    },
    count_employee_projects: function(employee_id, timelogs, projects){
            let projectsemp = [];
      timelogs.forEach(timelog => {
        if (timelog.employee_id == employee_id) {
          projectsemp.push(timelog.project_id);
        }
      });
      var projectsdist = Array.from(new Set(projectsemp))
      return projectsdist.length;
    },

    section: function(name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    }
  };

  if (Handlebars && typeof Handlebars.registerHelper === "function") {
    for (var prop in helpers) {
      Handlebars.registerHelper(prop, helpers[prop]);
    }
  } else {
    return helpers;
  }
};

module.exports.register = register;
module.exports.helpers = register(null);
