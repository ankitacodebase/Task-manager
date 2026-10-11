import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db_pool, close_db_pool
from app.core.email import EmailService
from app.core.enums import TaskStatus, SystemRole

@pytest.mark.asyncio
async def test_complete_backend_enterprise_suite():
    await init_db_pool()
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # 1. System Health Check
            health_resp = await client.get("/health")
            assert health_resp.status_code == 200
            health_data = health_resp.json()
            assert health_data["success"] is True
            assert health_data["data"]["status"] == "healthy"

            # 2. OpenAPI Documentation
            openapi_resp = await client.get("/openapi.json")
            assert openapi_resp.status_code == 200
            spec = openapi_resp.json()
            assert "/api/v1/auth/register" in spec["paths"]
            assert "/api/v1/auth/login" in spec["paths"]
            assert "/api/v1/users" in spec["paths"]
            assert "/api/v1/tasks" in spec["paths"]

            # Generate unique test runs
            unique_suffix = uuid.uuid4().hex[:8]
            admin_email = f"admin_{unique_suffix}@company.com"
            admin_password = "Password123!"
            emp_email = f"emp_{unique_suffix}@company.com"
            emp_password = "Password123!"

            # 3. Registration (Tenant + Admin User)
            reg_payload = {
                "tenant_name": f"Enterprise Org {unique_suffix}",
                "full_name": "Chief Executive",
                "email": admin_email,
                "password": admin_password,
            }
            reg_resp = await client.post("/api/v1/auth/register", json=reg_payload)
            assert reg_resp.status_code == 201, reg_resp.text
            reg_data = reg_resp.json()
            assert reg_data["success"] is True
            assert "access_token" in reg_data["data"]
            assert reg_data["data"]["user"]["role"] == SystemRole.ADMIN.value
            admin_token = reg_data["data"]["access_token"]
            admin_headers = {"Authorization": f"Bearer {admin_token}"}

            # Verify OTP to complete account verification
            sent_emails = EmailService.get_sent_emails()
            reg_emails = [e for e in sent_emails if e["to"] == admin_email]
            import re
            otp_match = re.search(r"\b(\d{6})\b", reg_emails[-1]["body"])
            assert otp_match
            await client.post("/api/v1/auth/otp/verify", json={
                "email": admin_email,
                "otp_code": otp_match.group(1),
            })

            # 4. Duplicate Registration Guard (Verified account correctly rejected with 409)
            dup_resp = await client.post("/api/v1/auth/register", json=reg_payload)
            assert dup_resp.status_code == 409

            # 5. Admin Login
            login_payload = {
                "email": admin_email,
                "password": admin_password,
            }
            login_resp = await client.post("/api/v1/auth/login", json=login_payload)
            assert login_resp.status_code == 200
            login_data = login_resp.json()
            assert login_data["data"]["user"]["email"] == admin_email

            # 6. Invalid Password Guard
            bad_login = await client.post("/api/v1/auth/login", json={"email": admin_email, "password": "WrongPassword!"})
            assert bad_login.status_code == 401

            # 7. Get Current User Profile (Admin)
            me_resp = await client.get("/api/v1/auth/me", headers=admin_headers)
            assert me_resp.status_code == 200
            assert me_resp.json()["data"]["email"] == admin_email

            # 8. OTP Lifecycle
            otp_send_resp = await client.post("/api/v1/auth/otp/send", json={"email": admin_email, "purpose": "LOGIN_2FA"})
            assert otp_send_resp.status_code == 200
            # Check dev email log captured OTP
            sent_emails = EmailService.get_sent_emails()
            otp_email = next((e for e in reversed(sent_emails) if e["to"] == admin_email and "Code" in e["subject"]), None)
            assert otp_email is not None

            # 9. Admin Provisions Employee User (RBAC test)
            create_user_payload = {
                "email": emp_email,
                "password": emp_password,
                "full_name": "Alice Engineer",
                "role": "USER",
            }
            user_create_resp = await client.post("/api/v1/users", json=create_user_payload, headers=admin_headers)
            assert user_create_resp.status_code == 201, user_create_resp.text
            created_user = user_create_resp.json()["data"]
            emp_id = created_user["id"]
            assert created_user["email"] == emp_email
            assert created_user["role"] == "USER"

            # Verify Welcome email dispatched
            welcome_email = next((e for e in reversed(sent_emails) if e["to"] == emp_email and "Welcome" in e["subject"]), None)
            assert welcome_email is not None

            # 10. Admin Lists Users
            list_users_resp = await client.get("/api/v1/users", headers=admin_headers)
            assert list_users_resp.status_code == 200
            users_list = list_users_resp.json()["data"]
            assert any(u["email"] == emp_email for u in users_list)

            # 11. Employee Log In
            emp_login_resp = await client.post("/api/v1/auth/login", json={"email": emp_email, "password": emp_password})
            assert emp_login_resp.status_code == 200
            emp_token = emp_login_resp.json()["data"]["access_token"]
            emp_headers = {"Authorization": f"Bearer {emp_token}"}

            # 12. RBAC Enforcement: Standard User CANNOT Create Users (Must return 403 Forbidden)
            forbidden_create = await client.post(
                "/api/v1/users",
                json={"email": "hacker@test.com", "password": "Password123!", "full_name": "Hacker", "role": "USER"},
                headers=emp_headers
            )
            assert forbidden_create.status_code == 403

            # 13. Admin Creates Task Assigned to Employee
            task_create_payload = {
                "title": "Build Authentication Architecture",
                "description": "Implement enterprise 3-tier controllers and DTOs",
                "priority": "HIGH",
                "assignee_id": emp_id,
            }
            task_create_resp = await client.post("/api/v1/tasks", json=task_create_payload, headers=admin_headers)
            assert task_create_resp.status_code == 201, task_create_resp.text
            task_data = task_create_resp.json()["data"]
            task_id = task_data["id"]
            assert task_data["task_key"].startswith("TASK-")
            assert task_data["status"] == TaskStatus.TODO.value
            assert task_data["assignee_id"] == emp_id

            # Verify Task Assignment Email Dispatched
            assign_email = next((e for e in reversed(sent_emails) if e["to"] == emp_email and "Assigned" in e["subject"]), None)
            assert assign_email is not None

            # 14. Admin Lists Tasks -> Can see all tasks
            admin_tasks_resp = await client.get("/api/v1/tasks", headers=admin_headers)
            assert admin_tasks_resp.status_code == 200
            admin_tasks = admin_tasks_resp.json()["data"]
            assert any(t["id"] == task_id for t in admin_tasks)

            # 15. Employee Lists Tasks -> Sees only tasks assigned to them
            emp_tasks_resp = await client.get("/api/v1/tasks", headers=emp_headers)
            assert emp_tasks_resp.status_code == 200
            emp_tasks = emp_tasks_resp.json()["data"]
            assert all(t["assignee_id"] == emp_id for t in emp_tasks)
            assert any(t["id"] == task_id for t in emp_tasks)

            # 16. Employee Updates Task Status: TODO -> IN_PROGRESS
            status_update_resp = await client.patch(
                f"/api/v1/tasks/{task_id}/status",
                json={"status": TaskStatus.IN_PROGRESS.value},
                headers=emp_headers
            )
            assert status_update_resp.status_code == 200, status_update_resp.text
            assert status_update_resp.json()["data"]["status"] == TaskStatus.IN_PROGRESS.value

            # Verify Status Update Email Dispatched to Admin (not to the employee who updated the status)
            sent_emails = EmailService.get_sent_emails()
            status_email = next((e for e in reversed(sent_emails) if e["to"] == admin_email and "Status Updated" in e["subject"]), None)
            assert status_email is not None

            # 17. Employee Advances Status: IN_PROGRESS -> IN_REVIEW -> DONE
            status_update_resp2 = await client.patch(
                f"/api/v1/tasks/{task_id}/status",
                json={"status": TaskStatus.IN_REVIEW.value},
                headers=emp_headers
            )
            assert status_update_resp2.status_code == 200
            assert status_update_resp2.json()["data"]["status"] == TaskStatus.IN_REVIEW.value

            status_update_resp3 = await client.patch(
                f"/api/v1/tasks/{task_id}/status",
                json={"status": TaskStatus.DONE.value},
                headers=emp_headers
            )
            assert status_update_resp3.status_code == 200
            assert status_update_resp3.json()["data"]["status"] == TaskStatus.DONE.value

            # 18. Filter Tasks by Status
            filter_resp = await client.get(f"/api/v1/tasks?status={TaskStatus.DONE.value}", headers=admin_headers)
            assert filter_resp.status_code == 200
            filtered_tasks = filter_resp.json()["data"]
            assert all(t["status"] == TaskStatus.DONE.value for t in filtered_tasks)
            assert any(t["id"] == task_id for t in filtered_tasks)

            # 19. Forgot Password and Reset Password Lifecycle
            forgot_resp = await client.post("/api/v1/auth/forgot-password", json={"email": emp_email})
            assert forgot_resp.status_code == 200
            reset_token = forgot_resp.json()["data"]["reset_token"]
            assert reset_token is not None

            # Verify Password Reset Email Dispatched
            reset_email = next((e for e in reversed(sent_emails) if e["to"] == emp_email and "Reset" in e["subject"]), None)
            assert reset_email is not None

            new_password = "BrandNewPassword456!"
            reset_resp = await client.post("/api/v1/auth/reset-password", json={
                "token": reset_token,
                "new_password": new_password,
            })
            assert reset_resp.status_code == 200

            # Log in with new password succeeds
            new_login_resp = await client.post("/api/v1/auth/login", json={"email": emp_email, "password": new_password})
            assert new_login_resp.status_code == 200

            # 20. Strict Multi-User RBAC Task Isolation
            emp2_email = f"emp2_{unique_suffix}@company.com"
            user2_resp = await client.post(
                "/api/v1/users",
                json={"email": emp2_email, "password": "Password123!", "full_name": "Bob Backend", "role": "USER"},
                headers=admin_headers
            )
            assert user2_resp.status_code == 201
            emp2_id = user2_resp.json()["data"]["id"]

            emp2_login = await client.post("/api/v1/auth/login", json={"email": emp2_email, "password": "Password123!"})
            emp2_token = emp2_login.json()["data"]["access_token"]
            emp2_headers = {"Authorization": f"Bearer {emp2_token}"}

            # Create Task 2 for Employee 2
            task2_resp = await client.post(
                "/api/v1/tasks",
                json={"title": "Task for Employee 2", "description": "Bob work only", "priority": "MEDIUM", "assignee_id": emp2_id},
                headers=admin_headers
            )
            assert task2_resp.status_code == 201
            task2_id = task2_resp.json()["data"]["id"]

            # Employee 1 tries to view Employee 2's task -> 403 Forbidden
            emp1_view_task2 = await client.get(f"/api/v1/tasks/{task2_id}", headers=emp_headers)
            assert emp1_view_task2.status_code == 403

            # Employee 1 tries to update status of Employee 2's task -> 403 Forbidden
            emp1_edit_task2 = await client.patch(
                f"/api/v1/tasks/{task2_id}/status",
                json={"status": TaskStatus.IN_PROGRESS.value},
                headers=emp_headers
            )
            assert emp1_edit_task2.status_code == 403

            # Employee 1 tries to reassign Employee 2's task -> 403 Forbidden
            emp1_reassign = await client.patch(
                f"/api/v1/tasks/{task2_id}/assign",
                json={"assignee_id": emp_id},
                headers=emp_headers
            )
            assert emp1_reassign.status_code == 403

            # Admin reassigns Task 2 to Employee 1 -> 200 OK
            admin_reassign = await client.patch(
                f"/api/v1/tasks/{task2_id}/assign",
                json={"assignee_id": emp_id},
                headers=admin_headers
            )
            assert admin_reassign.status_code == 200
            assert admin_reassign.json()["data"]["assignee_id"] == emp_id

            # Now Employee 1 CAN view and update Task 2
            emp1_view_after = await client.get(f"/api/v1/tasks/{task2_id}", headers=emp_headers)
            assert emp1_view_after.status_code == 200

            print("\n=======================================================")
            print("ALL 20 ENTERPRISE LIFECYCLE & RBAC CHECKS PASSED 100%!")
            print("=======================================================")
    finally:
        await close_db_pool()
