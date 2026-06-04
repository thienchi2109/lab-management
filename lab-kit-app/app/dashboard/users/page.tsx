import { getManageableUsers } from "@/lib/user-management/server";

import { UsersPageContent } from "./_components/users-page-content";

export default async function UsersPage() {
  const users = await loadUsersOrNull();

  if (users) {
    return <UsersPageContent users={users} />;
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-3 text-center">
      <div className="rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
        Không có quyền truy cập
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Chỉ Admin mới quản lý người dùng
      </h1>
      <p className="text-sm text-muted-foreground">
        Tài khoản hiện tại không có quyền xem danh sách, tạo người dùng hoặc
        thay đổi vai trò trong hệ thống.
      </p>
    </div>
  );
}

async function loadUsersOrNull() {
  try {
    return await getManageableUsers();
  } catch {
    return null;
  }
}
