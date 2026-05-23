import { describe, it, expect } from "vitest";
import {
  TICKET_STATUS,
  TICKET_PRIORITY,
  TICKET_TYPE,
  USER_ROLE,
  MEMBER_ROLE,
  LOG_ACTION,
  STATUS_LABELS,
  PRIORITY_LABELS,
  TYPE_LABELS,
  ROLE_LABELS,
  MEMBER_ROLE_LABELS,
} from "./index";

// Helper to get all values from a const object
function valuesOf<T extends Record<string, string>>(obj: T): string[] {
  return Object.values(obj);
}

// Helper to check for duplicates in an array
function hasDuplicates(arr: string[]): boolean {
  return new Set(arr).size !== arr.length;
}

describe("TICKET_STATUS", () => {
  it("should have no duplicate values", () => {
    const vals = valuesOf(TICKET_STATUS);
    expect(hasDuplicates(vals)).toBe(false);
  });

  it("should have exactly 6 status values", () => {
    const vals = valuesOf(TICKET_STATUS);
    expect(vals).toHaveLength(6);
  });

  it("should contain expected status keys", () => {
    expect(TICKET_STATUS).toHaveProperty("PENDING");
    expect(TICKET_STATUS).toHaveProperty("PROCESSING");
    expect(TICKET_STATUS).toHaveProperty("WAITING_FEEDBACK");
    expect(TICKET_STATUS).toHaveProperty("COMPLETED");
    expect(TICKET_STATUS).toHaveProperty("CLOSED");
    expect(TICKET_STATUS).toHaveProperty("REJECTED");
  });
});

describe("TICKET_PRIORITY", () => {
  it("should have no duplicate values", () => {
    const vals = valuesOf(TICKET_PRIORITY);
    expect(hasDuplicates(vals)).toBe(false);
  });

  it("should have exactly 4 priority values", () => {
    const vals = valuesOf(TICKET_PRIORITY);
    expect(vals).toHaveLength(4);
  });

  it("should contain expected priority keys", () => {
    expect(TICKET_PRIORITY).toHaveProperty("LOW");
    expect(TICKET_PRIORITY).toHaveProperty("MEDIUM");
    expect(TICKET_PRIORITY).toHaveProperty("HIGH");
    expect(TICKET_PRIORITY).toHaveProperty("URGENT");
  });
});

describe("TICKET_TYPE", () => {
  it("should have no duplicate values", () => {
    const vals = valuesOf(TICKET_TYPE);
    expect(hasDuplicates(vals)).toBe(false);
  });

  it("should have exactly 7 type values", () => {
    const vals = valuesOf(TICKET_TYPE);
    expect(vals).toHaveLength(7);
  });

  it("should contain all expected type keys", () => {
    expect(TICKET_TYPE).toHaveProperty("DEMAND");
    expect(TICKET_TYPE).toHaveProperty("BUG");
    expect(TICKET_TYPE).toHaveProperty("DESIGN");
    expect(TICKET_TYPE).toHaveProperty("COPY");
    expect(TICKET_TYPE).toHaveProperty("DATA");
    expect(TICKET_TYPE).toHaveProperty("OPERATION");
    expect(TICKET_TYPE).toHaveProperty("OTHER");
  });
});

describe("USER_ROLE", () => {
  it("should have no duplicate values", () => {
    const vals = valuesOf(USER_ROLE);
    expect(hasDuplicates(vals)).toBe(false);
  });
});

describe("MEMBER_ROLE", () => {
  it("should have no duplicate values", () => {
    const vals = valuesOf(MEMBER_ROLE);
    expect(hasDuplicates(vals)).toBe(false);
  });
});

describe("LOG_ACTION", () => {
  it("should have no duplicate values", () => {
    const vals = valuesOf(LOG_ACTION);
    expect(hasDuplicates(vals)).toBe(false);
  });
});

describe("STATUS_LABELS", () => {
  it("should have a label for every TICKET_STATUS value", () => {
    const statusKeys = valuesOf(TICKET_STATUS);
    for (const key of statusKeys) {
      expect(STATUS_LABELS).toHaveProperty(key);
    }
  });

  it("should have no extra labels beyond TICKET_STATUS values", () => {
    const statusKeys = valuesOf(TICKET_STATUS);
    const labelKeys = Object.keys(STATUS_LABELS);
    expect(labelKeys).toHaveLength(statusKeys.length);
  });

  it("should have labels for specific statuses", () => {
    expect(STATUS_LABELS[TICKET_STATUS.PENDING]).toBe("待处理");
    expect(STATUS_LABELS[TICKET_STATUS.PROCESSING]).toBe("处理中");
    expect(STATUS_LABELS[TICKET_STATUS.WAITING_FEEDBACK]).toBe("等待反馈");
    expect(STATUS_LABELS[TICKET_STATUS.COMPLETED]).toBe("已完成");
    expect(STATUS_LABELS[TICKET_STATUS.CLOSED]).toBe("已关闭");
    expect(STATUS_LABELS[TICKET_STATUS.REJECTED]).toBe("已驳回");
  });
});

describe("PRIORITY_LABELS", () => {
  it("should have a label for every TICKET_PRIORITY value", () => {
    const priorityKeys = valuesOf(TICKET_PRIORITY);
    for (const key of priorityKeys) {
      expect(PRIORITY_LABELS).toHaveProperty(key);
    }
  });

  it("should have no extra labels beyond TICKET_PRIORITY values", () => {
    const priorityKeys = valuesOf(TICKET_PRIORITY);
    const labelKeys = Object.keys(PRIORITY_LABELS);
    expect(labelKeys).toHaveLength(priorityKeys.length);
  });

  it("should have labels for specific priorities", () => {
    expect(PRIORITY_LABELS[TICKET_PRIORITY.LOW]).toBe("低");
    expect(PRIORITY_LABELS[TICKET_PRIORITY.MEDIUM]).toBe("中");
    expect(PRIORITY_LABELS[TICKET_PRIORITY.HIGH]).toBe("高");
    expect(PRIORITY_LABELS[TICKET_PRIORITY.URGENT]).toBe("紧急");
  });
});

describe("TYPE_LABELS", () => {
  it("should have a label for every TICKET_TYPE value", () => {
    const typeKeys = valuesOf(TICKET_TYPE);
    for (const key of typeKeys) {
      expect(TYPE_LABELS).toHaveProperty(key);
    }
  });
});

describe("ROLE_LABELS", () => {
  it("should have a label for every USER_ROLE value", () => {
    const roleKeys = valuesOf(USER_ROLE);
    for (const key of roleKeys) {
      expect(ROLE_LABELS).toHaveProperty(key);
    }
  });
});

describe("MEMBER_ROLE_LABELS", () => {
  it("should have a label for every MEMBER_ROLE value", () => {
    const roleKeys = valuesOf(MEMBER_ROLE);
    for (const key of roleKeys) {
      expect(MEMBER_ROLE_LABELS).toHaveProperty(key);
    }
  });
});
