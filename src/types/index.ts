// ─── Enums as const objects ───────────────────────────────
export const TICKET_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  WAITING_FEEDBACK: "waiting_feedback",
  COMPLETED: "completed",
  CLOSED: "closed",
  REJECTED: "rejected",
} as const;

export const TICKET_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export const TICKET_TYPE = {
  DEMAND: "需求",
  BUG: "Bug",
  DESIGN: "设计",
  COPY: "文案",
  DATA: "数据",
  OPERATION: "运营",
  OTHER: "其他",
} as const;

export const USER_ROLE = {
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
} as const;

export const MEMBER_ROLE = {
  OWNER: "owner",
  COLLABORATOR: "collaborator",
  WATCHER: "watcher",
} as const;

export const LOG_ACTION = {
  CREATED: "created",
  STATUS_CHANGED: "status_changed",
  ASSIGNEE_CHANGED: "assignee_changed",
  MEMBER_ADDED: "member_added",
  MEMBER_REMOVED: "member_removed",
  PRIORITY_CHANGED: "priority_changed",
  CLOSED: "closed",
} as const;

// ─── Label maps ─────────────────────────────────────────
export const STATUS_LABELS: Record<string, string> = {
  [TICKET_STATUS.PENDING]: "待处理",
  [TICKET_STATUS.PROCESSING]: "处理中",
  [TICKET_STATUS.WAITING_FEEDBACK]: "等待反馈",
  [TICKET_STATUS.COMPLETED]: "已完成",
  [TICKET_STATUS.CLOSED]: "已关闭",
  [TICKET_STATUS.REJECTED]: "已驳回",
};

export const PRIORITY_LABELS: Record<string, string> = {
  [TICKET_PRIORITY.LOW]: "低",
  [TICKET_PRIORITY.MEDIUM]: "中",
  [TICKET_PRIORITY.HIGH]: "高",
  [TICKET_PRIORITY.URGENT]: "紧急",
};

export const TYPE_LABELS: Record<string, string> = {
  [TICKET_TYPE.DEMAND]: "需求",
  [TICKET_TYPE.BUG]: "Bug",
  [TICKET_TYPE.DESIGN]: "设计",
  [TICKET_TYPE.COPY]: "文案",
  [TICKET_TYPE.DATA]: "数据",
  [TICKET_TYPE.OPERATION]: "运营",
  [TICKET_TYPE.OTHER]: "其他",
};

export const ROLE_LABELS: Record<string, string> = {
  [USER_ROLE.ADMIN]: "管理员",
  [USER_ROLE.MANAGER]: "经理",
  [USER_ROLE.USER]: "普通用户",
};

export const MEMBER_ROLE_LABELS: Record<string, string> = {
  [MEMBER_ROLE.OWNER]: "负责人",
  [MEMBER_ROLE.COLLABORATOR]: "协作者",
  [MEMBER_ROLE.WATCHER]: "关注者",
};

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];
export type TicketPriority = (typeof TICKET_PRIORITY)[keyof typeof TICKET_PRIORITY];
export type TicketType = (typeof TICKET_TYPE)[keyof typeof TICKET_TYPE];
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
export type MemberRole = (typeof MEMBER_ROLE)[keyof typeof MEMBER_ROLE];
export type LogAction = (typeof LOG_ACTION)[keyof typeof LOG_ACTION];

/** Shared ticket list item type used by dashboard and tickets list pages */
export type TicketListItem = {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  creator: { id: string; displayName: string };
  assignee: { displayName: string } | null;
  members: Array<{ role: string; user: { id: string } }>;
  _count: { comments: number };
};