const Emp = require("../models/empSuh.model");
const Attendance = require("../models/attendance.model");
const Lead = require("../models/lead.model");
const Salary = require("../models/salary.model");

function toCSV(rows) {
  if (!rows || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    if (s.search(/[",\n]/g) >= 0) return `"${s}"`;
    return s;
  };
  const csv = [headers.join(",")]
    .concat(rows.map((r) => headers.map((h) => escape(r[h])).join(",")))
    .join("\n");
  return csv;
}

async function fetchData(entity, query) {
  switch (entity) {
    case "employees": {
      const docs = await Emp.find().lean();
      return docs.map(({ _id, password, __v, ...rest }) => ({ id: _id, ...rest }));
    }
    case "attendance": {
      const docs = await Attendance.find().populate('employee', 'name email employeeId').lean();
      return docs.map(({ _id, employee, __v, ...rest }) => ({ id: _id, employeeId: employee?.employeeId, employeeName: employee?.name, employeeEmail: employee?.email, ...rest }));
    }
    case "leads": {
      const docs = await Lead.find().populate('assignedTo', 'name employeeId').lean();
      return docs.map(({ _id, assignedTo, activities, __v, ...rest }) => ({ id: _id, assignedToName: assignedTo?.name, assignedToEmployeeId: assignedTo?.employeeId, ...rest }));
    }
    case "salaries": {
      const docs = await Salary.find().populate('employee', 'name email employeeId').lean();
      return docs.map(({ _id, employee, __v, ...rest }) => ({ id: _id, employeeId: employee?.employeeId, employeeName: employee?.name, employeeEmail: employee?.email, ...rest }));
    }
    default:
      throw new Error("Unsupported entity");
  }
}

exports.exportData = async (req, res) => {
  try {
    const { entity } = req.params;
    const { format = "csv" } = req.query; // csv | json

    const rows = await fetchData(entity, req.query);

    if (format === "json") {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json({ success: true, count: rows.length, data: rows });
    }

    const csv = toCSV(rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${entity}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Export failed', error: error.message });
  }
};


