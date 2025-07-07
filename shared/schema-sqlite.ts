import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const departments = sqliteTable("departments", {
  id: integer("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const employees = sqliteTable("employees", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  photoUrl: text("photo_url"),
  departmentId: integer("department_id").notNull().references(() => departments.id),
  position: text("position"),
  employeeGroup: text("employee_group").notNull(), // "group_a" or "group_b"
  joinDate: integer("join_date").notNull(), // Unix timestamp
  status: text("status").default("active").notNull(), // "active" or "inactive"
  role: text("role").default("user").notNull(), // "admin" or "user"
  biometricDeviceId: text("biometric_device_id"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const attendance = sqliteTable("attendance", {
  id: integer("id").primaryKey(),
  employeeId: text("employee_id").references(() => employees.id).notNull(),
  date: integer("date").notNull(), // Unix timestamp
  checkIn: integer("check_in"), // Unix timestamp
  checkOut: integer("check_out"), // Unix timestamp
  status: text("status").notNull(), // "present", "absent", "late", "early_departure"
  workingHours: real("working_hours"),
  overtimeHours: real("overtime_hours"),
  notes: text("notes"),
  createdAt: integer("created_at").notNull(),
});

export const leaveRequests = sqliteTable("leave_requests", {
  id: integer("id").primaryKey(),
  employeeId: text("employee_id").references(() => employees.id).notNull(),
  startDate: integer("start_date").notNull(), // Unix timestamp
  endDate: integer("end_date").notNull(), // Unix timestamp
  leaveType: text("leave_type").notNull(), // "annual", "sick", "casual", "maternity", "paternity"
  reason: text("reason"),
  status: text("status").default("pending").notNull(), // "pending", "approved", "rejected"
  appliedAt: integer("applied_at").notNull(),
  reviewedAt: integer("reviewed_at"),
  reviewedBy: text("reviewed_by"),
  comments: text("comments"),
});

export const overtimeRequests = sqliteTable("overtime_requests", {
  id: integer("id").primaryKey(),
  employeeId: text("employee_id").references(() => employees.id).notNull(),
  date: integer("date").notNull(), // Unix timestamp
  startTime: integer("start_time").notNull(), // Unix timestamp
  endTime: integer("end_time").notNull(), // Unix timestamp
  reason: text("reason"),
  status: text("status").default("pending").notNull(), // "pending", "approved", "rejected"
  requestedAt: integer("requested_at").notNull(),
  reviewedAt: integer("reviewed_at"),
  reviewedBy: text("reviewed_by"),
  comments: text("comments"),
});

export const biometricDevices = sqliteTable("biometric_devices", {
  id: integer("id").primaryKey(),
  deviceId: text("device_id").notNull().unique(),
  name: text("name").notNull(),
  ipAddress: text("ip_address").notNull(),
  port: integer("port").notNull(),
  location: text("location"),
  status: text("status").default("active").notNull(), // "active", "inactive"
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const holidays = sqliteTable("holidays", {
  id: integer("id").primaryKey(),
  date: integer("date").notNull(), // Unix timestamp
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // "annual", "special", "weekend"
  isRecurring: integer("is_recurring").default(0).notNull(), // 0 or 1 (boolean)
  createdAt: integer("created_at").notNull(),
});

// Relations
export const departmentRelations = relations(departments, ({ many }) => ({
  employees: many(employees),
}));

export const employeeRelations = relations(employees, ({ one, many }) => ({
  department: one(departments, {
    fields: [employees.departmentId],
    references: [departments.id],
  }),
  attendance: many(attendance),
  leaveRequests: many(leaveRequests),
  overtimeRequests: many(overtimeRequests),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  employee: one(employees, {
    fields: [attendance.employeeId],
    references: [employees.id],
  }),
}));

export const leaveRequestRelations = relations(leaveRequests, ({ one }) => ({
  employee: one(employees, {
    fields: [leaveRequests.employeeId],
    references: [employees.id],
  }),
}));

export const overtimeRequestRelations = relations(overtimeRequests, ({ one }) => ({
  employee: one(employees, {
    fields: [overtimeRequests.employeeId],
    references: [employees.id],
  }),
}));

// Insert schemas
export const insertDepartmentSchema = createInsertSchema(departments);
export const insertEmployeeSchema = createInsertSchema(employees);
export const insertAttendanceSchema = createInsertSchema(attendance);
export const insertLeaveRequestSchema = createInsertSchema(leaveRequests);
export const insertOvertimeRequestSchema = createInsertSchema(overtimeRequests);
export const insertBiometricDeviceSchema = createInsertSchema(biometricDevices);
export const insertHolidaySchema = createInsertSchema(holidays);

// Types
export type Department = typeof departments.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type OvertimeRequest = typeof overtimeRequests.$inferSelect;
export type BiometricDevice = typeof biometricDevices.$inferSelect;
export type Holiday = typeof holidays.$inferSelect;

export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type InsertOvertimeRequest = z.infer<typeof insertOvertimeRequestSchema>;
export type InsertBiometricDevice = z.infer<typeof insertBiometricDeviceSchema>;
export type InsertHoliday = z.infer<typeof insertHolidaySchema>;