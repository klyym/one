import { pgTable, serial, timestamp, text, varchar, boolean, integer, numeric, jsonb, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


// 系统表 - 健康检查
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 工作室基本信息
export const studioInfo = pgTable(
	"studio_info",
	{
		id: serial().primaryKey(),
		name: varchar("name", { length: 255 }).notNull(),
		address: varchar("address", { length: 500 }),
		phone: varchar("phone", { length: 50 }),
		email: varchar("email", { length: 255 }),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [index("studio_info_id_idx").on(table.id)]
);

// 用户（管理员、设计师等）
export const users = pgTable(
	"users",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		email: varchar("email", { length: 255 }).notNull().unique(),
		name: varchar("name", { length: 128 }).notNull(),
		role: varchar("role", { length: 50 }).notNull().default("designer"), // admin, designer
		password_hash: varchar("password_hash", { length: 255 }).notNull(),
		is_active: boolean("is_active").default(true).notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("users_email_idx").on(table.email),
		index("users_role_idx").on(table.role),
	]
);

// 客户信息
export const clients = pgTable(
	"clients",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		name: varchar("name", { length: 128 }).notNull(),
		phone: varchar("phone", { length: 50 }),
		email: varchar("email", { length: 255 }),
		address: varchar("address", { length: 500 }),
		company_name: varchar("company_name", { length: 255 }),
		notes: text("notes"),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("clients_name_idx").on(table.name),
		index("clients_phone_idx").on(table.phone),
	]
);

// 设计师信息
export const designers = pgTable(
	"designers",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		name: varchar("name", { length: 128 }).notNull(),
		position: varchar("position", { length: 128 }).notNull(),
		phone: varchar("phone", { length: 50 }).notNull(),
		email: varchar("email", { length: 255 }),
		specialties: text("specialties"), // 擅长风格，逗号分隔
		rating: numeric("rating", { precision: 3, scale: 2 }).default('0'), // 评分
		project_count: integer("project_count").default(0), // 项目数
		bio: text("bio"), // 简介
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("designers_name_idx").on(table.name),
		index("designers_phone_idx").on(table.phone),
	]
);

// 项目信息
export const projects = pgTable(
	"projects",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		name: varchar("name", { length: 255 }).notNull(),
		client_id: varchar("client_id", { length: 36 }).notNull().references(() => clients.id, { onDelete: "cascade" }),
		designer_id: varchar("designer_id", { length: 36 }).notNull().references(() => designers.id, { onDelete: "set null" }),
		status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, in_progress, completed, cancelled
		priority: varchar("priority", { length: 50 }).notNull().default("medium"), // low, medium, high
		budget: numeric("budget", { precision: 12, scale: 2 }),
		area: numeric("area", { precision: 10, scale: 2 }), // 面积（平方米）
		address: varchar("address", { length: 500 }),
		style: varchar("style", { length: 100 }), // 设计风格
		overall_progress: integer("overall_progress").default(0), // 总体进度 0-100
		current_phase: varchar("current_phase", { length: 100 }), // 当前阶段
		start_date: timestamp("start_date", { withTimezone: true }),
		end_date: timestamp("end_date", { withTimezone: true }),
		notes: text("notes"),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("projects_client_id_idx").on(table.client_id),
		index("projects_designer_id_idx").on(table.designer_id),
		index("projects_status_idx").on(table.status),
		index("projects_priority_idx").on(table.priority),
		index("projects_start_date_idx").on(table.start_date),
	]
);

// 项目阶段进度
export const projectPhases = pgTable(
	"project_phases",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		project_id: varchar("project_id", { length: 36 }).notNull().references(() => projects.id, { onDelete: "cascade" }),
		phase_name: varchar("phase_name", { length: 100 }).notNull(), // 平面设计, SU模型推敲, 效果图, 施工图, 设计完成
		status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, in_progress, completed
		progress: integer("progress").default(0), // 0-100
		notes: text("notes"),
		start_date: timestamp("start_date", { withTimezone: true }),
		end_date: timestamp("end_date", { withTimezone: true }),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("project_phases_project_id_idx").on(table.project_id),
		index("project_phases_status_idx").on(table.status),
	]
);

// 设计案例
export const designCases = pgTable(
	"design_cases",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		name: varchar("name", { length: 255 }).notNull(),
		style: varchar("style", { length: 100 }).notNull(),
		area: numeric("area", { precision: 10, scale: 2 }), // 面积（平方米）
		address: varchar("address", { length: 500 }),
		images: jsonb("images"), // 图片数组 [{ url: "", description: "" }]
		tags: text("tags"), // 标签，逗号分隔
		is_featured: boolean("is_featured").default(false), // 是否精选
		view_count: integer("view_count").default(0), // 浏览量
		like_count: integer("like_count").default(0), // 点赞数
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("design_cases_style_idx").on(table.style),
		index("design_cases_is_featured_idx").on(table.is_featured),
		index("design_cases_created_at_idx").on(table.created_at),
	]
);

// 跟进记录
export const followUps = pgTable(
	"follow_ups",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		client_id: varchar("client_id", { length: 36 }).notNull().references(() => clients.id, { onDelete: "cascade" }),
		type: varchar("type", { length: 50 }).notNull(), // call, visit, email, wechat, other
		content: text("content").notNull(), // 跟进内容
		next_plan: text("next_plan"), // 下一步计划
		next_date: timestamp("next_date", { withTimezone: true }), // 下次跟进日期
		followed_by: varchar("followed_by", { length: 36 }), // 跟进人（设计师 ID）
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("follow_ups_client_id_idx").on(table.client_id),
		index("follow_ups_type_idx").on(table.type),
		index("follow_ups_next_date_idx").on(table.next_date),
		index("follow_ups_created_at_idx").on(table.created_at),
	]
);

