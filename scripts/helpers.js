/**
 * Get difference between two times. Format: XX:XX
 * @param {string} time_start - Starttime Format XX:XX
 * @param {string} time_end - Endtime Format XX:XX
 * @returns {string || number} - If Endtime > Starttime: "Bitte Zeit ändern" Else: Difference in Milliseconds
 */
function timediff(time_start, time_end) {
  var start = time_start.toString().split(":");
  var end = time_end.toString().split(":");
  var startDate = new Date(0, 0, 0, start[0], start[1], 0);
  var endDate = new Date(0, 0, 0, end[0], end[1], 0);
  if (endDate.getTime() < startDate.getTime()) {
    return "Bitte Zeiten ändern";
  }
  var diff = endDate.getTime() - startDate.getTime();
  return diff;
}
/**
 * Format time(Milliseconds) into XX:XXh
 * @param {number} time - Time in Milliseconds
 * @returns {string} - Time Format: XX:XXh
 */
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
    /**
     * Get recorded Time per Timelog
     * @param {string} start - start_time of Table Timelogs
     * @param {string} end - end_time of Table Timelogs
     * @returns {string} - Time Format: XX:XXh
     */
    recordedTime: function(start, end) {
      var diff = timediff(start, end);
      return formatTime(diff);
    },

    /**
     * Replace text if text=null
     * @param {string} text - Input String
     * @returns {string} - text || "--"
     */

    textFix: function(text) {
      if (text == "") {
        return "  --";
      }
      return text;
    },
    /**
     * Replace company if company not null
     * @param {string} company - Input Company from Table Customer
     * @returns {string} - if company = null: company else: company + " - "
     */
    companyFix: function(company) {
      if (company != "") {
        return company + " - ";
      }
      return company;
    },
    /**
     * Convert Timestamp to Date (DD,MM,YYYY)
     * @param {string} timestamp - Input Timestamp from Column "Created_at"
     * @returns {string} Date (DD,MM,YYYY)
     */
    dateFix: function(timestamp) {
      var date = timestamp.substr(0, 10);
      var newdate = date.split("-");
      return newdate[2] + "." + newdate[1] + "." + newdate[0];
    },
    /**
     * Convert money to money with Format XX.XX (2 Decimals)
     * @param {number} money - Input Money
     * @returns {number} money Format XX.XX (2 Decimals)
     */
    moneyFix: function(money) {
      return money.toFixed(2);
    },
    /**
     * Get total cost per Project for Evaluation
     * @param {number} project_id - ID from Table projects
     * @param {number} hourly_euro - hourly_euro from Table projects
     * @param {JSON} timelogs - JsonObject with all Timelogs
     * @returns {string} money - if money = 0.00€ : "--" else: money Format XX.XX€
     */
    eval_projects_money: function(project_id, hourly_euro, timelogs) {
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
      money = minutesall * (hourly_euro / 60);
      money = money.toFixed(2) + "€";
      if (money == "0.00€") {
        return "--";
      }
      return money;
    },
    /**
     * Get total time per Project for Evaluation depending on Worktyp
     * @param {number} project_id - ID from Table projects
     * @param {string} worktyp - differenct Worktyp depending on evaluation
     * @param {JSON} timelogs - JsonObject with all Timelogs
     * @returns {string} - Total time per Customer, if = 00.00: "--" else: Format: XX:XXh
     */
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
    /**
     * Get total time per customer for Evaluation
     * @param {number} customer_id - ID from Table customers
     * @param {JSON} timelogs - JsonObject with all Timelogs
     * @param {JSON} projects - JsonObject with all Projects
     * @returns {string} - Total time per Customer, if = 00.00: "--" else: Format: XX:XXh
     */
    eval_customer_time: function(customer_id, timelogs, projects) {
      let projectsarr = [];
      let times = [];
      let timesum = 0;
      projects.forEach(project => {
        if (project.customer_id == customer_id) {
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
    /**
     * Count Projects per Customer
     * @param {number} customer_id - ID from Table customer
     * @param {JSON} projects - JsonObject with all Projects
     * @returns {number} - Total Count of Different Projects per Customer
     */
    count_projects_customer: function(customer_id, projects) {
      let projectsarr = [];
      projects.forEach(project => {
        if (project.customer_id == customer_id) {
          projectsarr.push(project);
        }
      });
      return projectsarr.length;
    },
    /**
     * Get total cost per Customer for Evaluation
     * @param {number} project_id - ID from Table projects
     * @param {JSON} projects - JsonObject with all Projects
     * @param {JSON} timelogs - JsonObject with all Timelogs
     * @returns {string} moneysum - total cost per Customer, if moneysum = 0.00€ : "--" else: moneysum Format XX.XX€
     */
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
    /**
     * Get total time per Employee for Evaluation depending on Worktyp
     * @param {number} employee_id - ID from Table employees
     * @param {string} worktyp - differenct Worktyp depending on evaluation
     * @param {JSON} timelogs - JsonObject with all Timelogs
     * @returns {string} timesum - Total time per Customer depending on Worktyp, if = 00.00h: "--" else: Format: XX:XXh
     */
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
    count_employee_projects: function(employee_id, timelogs, projects) {
      let projectsemp = [];
      timelogs.forEach(timelog => {
        if (timelog.employee_id == employee_id) {
          projectsemp.push(timelog.project_id);
        }
      });
      var projectsdist = Array.from(new Set(projectsemp));
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
