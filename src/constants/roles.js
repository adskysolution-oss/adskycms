export const USER_ROLES = {
    ADMIN: 'super_admin',
    OPERATIONS_ADMIN: 'operations_admin',
    STAFF: 'staff',
    VENDOR: 'vendor',
    SUB_VENDOR: 'sub_vendor',
    EMPLOYEE: 'employee',
    MEMBER: 'member',
    HEALTH_PARTNER: 'health_partner',
    BRANCH_ADMIN: 'branch_admin',
    HEALTH_STAFF: 'health_staff',
    HEALTH_RECEPTIONIST: 'health_receptionist',
    HEALTH_BILLING: 'health_billing',
    HEALTH_LAB_TECHNICIAN: 'health_lab_technician',
    HEALTH_DOCTOR: 'health_doctor',
    HEALTH_COUNTER_MANAGER: 'health_counter_manager',
    HEALTH_VENDOR: 'health_vendor',
    HEALTH_SUB_VENDOR: 'health_sub_vendor',
    HEALTH_TEAM_LEADER: 'health_team_leader',
    HEALTH_EXECUTIVE: 'health_executive',
    RECRUITMENT_ADMIN: 'recruitment_admin',
    RECRUITMENT_PARTNER: 'recruitment_partner',
    // ─── AD SKY SOLUTION — Corporate Module ───────────────────────────────────
    CORPORATE_VENDOR: 'corporate_vendor',
    CORPORATE_SUB_VENDOR: 'corporate_sub_vendor',
    CORPORATE_TEAM_LEADER: 'corporate_team_leader',
    CORPORATE_EMPLOYEE: 'corporate_employee',
    CORPORATE_EXECUTIVE: 'corporate_executive',
    CORPORATE_CENTER: 'corporate_center',
    // ─── AD SKY SOLUTION — MLM Module ─────────────────────────────────────────
    MLM_MEMBER: 'mlm_member',
};
// ─── Corporate role set (for guards / middleware) ──────────────────────────
export const CORPORATE_ROLES = [
    USER_ROLES.CORPORATE_VENDOR,
    USER_ROLES.CORPORATE_SUB_VENDOR,
    USER_ROLES.CORPORATE_TEAM_LEADER,
    USER_ROLES.CORPORATE_EMPLOYEE,
    USER_ROLES.CORPORATE_EXECUTIVE,
    USER_ROLES.CORPORATE_CENTER,
];
// ─── MLM role set ─────────────────────────────────────────────────────────
export const MLM_ROLES = [USER_ROLES.MLM_MEMBER];
