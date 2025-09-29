import { UsersService } from "./users.service";
import { UserRepository, UserFilter, UserQueryOptions } from "../repositories/user.repository";
import { PasswordService } from "../core/security/password";
import { HotelRepository } from "../repositories/hotel.repository";
import { AuthContext, UserStatus } from "../domain/auth/types";
import { ForbiddenError, ValidationError } from "../core/http/error";
import { RoleSlug } from "../rbac/enums";
import { User } from "../domain";

const createUserRepositoryMock = (): jest.Mocked<UserRepository> =>
  ({
    paginateScoped: jest.fn(),
    countScoped: jest.fn(),
    createWithRoleAndHotel: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    findOne: jest.fn(),
    listByHotel: jest.fn(),
    attachToHotel: jest.fn(),
    detachFromHotel: jest.fn(),
    assignRoleBySlug: jest.fn(),
    getUserRoleSlugs: jest.fn(),
    getUserHotelIds: jest.fn(),
    updateById: jest.fn(),
    softDeleteById: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    paginate: jest.fn(),
    updateUserRoleAndHotel: jest.fn(),
  }) as any;

const createHotelRepositoryMock = (): jest.Mocked<HotelRepository> =>
  ({
    getHotelIdsForUser: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    findOne: jest.fn(),
    listByOwner: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    softDeleteById: jest.fn(),
    paginate: jest.fn(),
    count: jest.fn(),
  }) as any;

const createPasswordServiceMock = (): jest.Mocked<PasswordService> =>
  ({
    createPasswordHash: jest.fn(),
    verifyPassword: jest.fn(),
  }) as any;

const createActor = (userId: string, roles: { slug: RoleSlug; scope: "internal" | "external" }[], permissions: string[] = []): AuthContext => ({
  userId,
  sessionId: "session-id",
  scope: roles.some((role) => role.scope === "internal") ? "internal" : "external",
  roles: roles as any,
  permissions,
});

describe("UsersService", () => {
  let userRepo: jest.Mocked<UserRepository>;
  let hotelRepo: jest.Mocked<HotelRepository>;
  let passwordService: jest.Mocked<PasswordService>;
  let service: UsersService;

  // Actors
  const admin = createActor("1", [{ slug: RoleSlug.ADMIN, scope: "internal" }], ["users:read", "users:write", "users:delete"]);
  const owner = createActor("10", [{ slug: RoleSlug.OWNER, scope: "external" }], ["users:read", "users:write", "users:delete"]);

  beforeEach(() => {
    jest.clearAllMocks();
    userRepo = createUserRepositoryMock();
    hotelRepo = createHotelRepositoryMock();
    passwordService = createPasswordServiceMock();
    passwordService.createPasswordHash.mockResolvedValue("hashed-password");
    service = new UsersService(userRepo, passwordService, hotelRepo);
    userRepo.paginateScoped.mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 20 });
  });

  describe("list()", () => {
    it("internal actor can filter by query and status", async () => {
      const filters: UserFilter & { page?: number; pageSize?: number } = { page: 1, pageSize: 20, q: "foo", status: UserStatus.ACTIVE };

      await service.list(filters, admin);

      expect(userRepo.paginateScoped).toHaveBeenCalledWith({ q: "foo", status: UserStatus.ACTIVE }, 1, 20, { id: "DESC" });
    });

    it("external actor with no hotels gets an empty list", async () => {
      hotelRepo.getHotelIdsForUser.mockResolvedValue([]);
      userRepo.getUserHotelIds.mockResolvedValue([]);

      const result = await service.list({ page: 1, pageSize: 10 }, owner);

      const expectedQueryOptions: UserQueryOptions = {
        excludeRoleSlugs: [RoleSlug.SUPERADMIN, RoleSlug.ADMIN],
        includeUserIds: [BigInt(owner.userId)],
      };
      expect(userRepo.paginateScoped).toHaveBeenCalledWith({}, 1, 10, { id: "DESC" }, expectedQueryOptions);
      expect(result.data).toEqual([]);
    });

    it("should auto-scope to the single hotel for an owner with one hotel", async () => {
      hotelRepo.getHotelIdsForUser.mockResolvedValue([100n]);
      await service.list({}, owner);

      const expectedQueryOptions: UserQueryOptions = {
        excludeRoleSlugs: [RoleSlug.SUPERADMIN, RoleSlug.ADMIN],
        includeUserIds: [BigInt(owner.userId)],
        hotelIds: [100n],
      };
      expect(userRepo.paginateScoped).toHaveBeenCalledWith(expect.any(Object), 1, 20, { id: "DESC" }, expectedQueryOptions);
    });

    it("should throw ForbiddenError when an owner queries for a hotel they do not own", async () => {
      hotelRepo.getHotelIdsForUser.mockResolvedValue([100n]);
      const filter = { hotel_id: 999n };
      await expect(service.list(filter, owner)).rejects.toThrow(ForbiddenError);
      await expect(service.list(filter, owner)).rejects.toThrow("Actor does not have access to the specified hotelId");
    });

    it("owner with multiple hotels must specify hotelId", async () => {
      hotelRepo.getHotelIdsForUser.mockResolvedValue([100n, 200n]);
      await expect(service.list({ page: 1, pageSize: 10 }, owner)).rejects.toThrow("Specify hotelId when managing multiple hotels");
    });

    it("should use a valid custom sort order", async () => {
      await service.list({ sortBy: "email", sortOrder: "ASC" }, admin);
      expect(userRepo.paginateScoped).toHaveBeenCalledWith(expect.any(Object), 1, 20, { email: "ASC" });
    });

    it("should throw a ValidationError for an invalid sortBy field", async () => {
      const invalidFilter = { sortBy: "password" as any }; // password is not a whitelisted sort field
      await expect(service.list(invalidFilter, admin)).rejects.toThrow(ValidationError);
      await expect(service.list(invalidFilter, admin)).rejects.toThrow("Invalid sortBy field: password");
    });

    it("should not include soft-deleted users by default", async () => {
      await service.list({}, admin);
      // The repository is expected to handle undefined `withDeleted` as `false`.
      // We ensure the property is not explicitly passed in the filter.
      expect(userRepo.paginateScoped).toHaveBeenCalledWith(expect.not.objectContaining({ withDeleted: true }), 1, 20, { id: "DESC" });
    });

    it("should include soft-deleted users when withDeleted is true", async () => {
      await service.list({ withDeleted: true }, admin);
      expect(userRepo.paginateScoped).toHaveBeenCalledWith({ withDeleted: true }, 1, 20, { id: "DESC" });
    });
  });

  describe("getById()", () => {
    it("returns null for a non-existent user ID", async () => {
      userRepo.findById.mockResolvedValue(null);
      const result = await service.getById(999n, admin);
      expect(result).toBeNull();
    });

    it("external actor cannot access internal admin", async () => {
      userRepo.findById.mockResolvedValue({ id: 2n } as any);
      userRepo.getUserRoleSlugs.mockResolvedValue([RoleSlug.ADMIN]);
      await expect(service.getById(2n, owner)).rejects.toThrow("External actors cannot access internal users");
    });

    it("should return a user with a BigInt ID", async () => {
      const userWithBigInt = { id: 123n, email: "user@test.com" };
      userRepo.findById.mockResolvedValue(userWithBigInt as any);

      const result = await service.getById(123n, admin);

      expect(result).toEqual(userWithBigInt);
      expect(typeof result?.id).toBe("bigint");
    });

    it("owner is forbidden from getting a user in a hotel they do not own", async () => {
      const targetUserId = 101n;
      // Owner ini hanya memiliki hotel 100
      hotelRepo.getHotelIdsForUser.mockResolvedValue([100n]);
      // Tapi user yang dituju ada di hotel 200
      userRepo.findById.mockResolvedValue({ id: targetUserId } as any);
      userRepo.getUserHotelIds.mockResolvedValue([200n]);
      userRepo.getUserRoleSlugs.mockResolvedValue([RoleSlug.USER]);

      await expect(service.getById(targetUserId, owner)).rejects.toThrow(ForbiddenError);
      await expect(service.getById(targetUserId, owner)).rejects.toThrow("External actors cannot access users outside their hotels");
    });
  });

  describe("create()", () => {
    const payload = { email: "new@user.com", password: "a-valid-password", name: "Newbie" };

    beforeEach(() => {
      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.createWithRoleAndHotel.mockResolvedValue({ id: 100n } as any);
    });

    it("normalizes email before checking for existence", async () => {
      const messyEmail = "  NEW@USER.com  ";
      await service.create({ ...payload, email: messyEmail }, admin);
      expect(userRepo.findByEmail).toHaveBeenCalledWith("new@user.com");
      expect(userRepo.createWithRoleAndHotel).toHaveBeenCalledWith(expect.objectContaining({ email: "new@user.com" }), expect.any(String), undefined);
    });

    it("throws error and does not create if email is already in use", async () => {
      userRepo.findByEmail.mockResolvedValue({ id: 99n } as any);
      await expect(service.create(payload, admin)).rejects.toThrow("Email already in use");
      expect(userRepo.createWithRoleAndHotel).not.toHaveBeenCalled();
    });

    it("throws error for invalid status value and does not create", async () => {
      const invalidPayload = { ...payload, status: "invalid-status" as any };
      await expect(service.create(invalidPayload, admin)).rejects.toThrow("Invalid status value");
      expect(userRepo.createWithRoleAndHotel).not.toHaveBeenCalled();
    });

    it("throws error for short password and does not create", async () => {
      const shortPasswordPayload = { ...payload, password: "short" };
      await expect(service.create(shortPasswordPayload, admin)).rejects.toThrow(/Password must be at least/);
      expect(passwordService.createPasswordHash).not.toHaveBeenCalled();
      expect(userRepo.createWithRoleAndHotel).not.toHaveBeenCalled();
    });

    it("throws when external actor with no hotels tries to create a user", async () => {
      hotelRepo.getHotelIdsForUser.mockResolvedValue([]);
      userRepo.getUserHotelIds.mockResolvedValue([]);
      await expect(service.create({ ...payload, roleSlug: RoleSlug.USER }, owner)).rejects.toThrow("External actors must belong to a hotel before creating users");
      expect(userRepo.createWithRoleAndHotel).not.toHaveBeenCalled();
    });

    it("throws when external actor creates user in a hotel they do not own", async () => {
      hotelRepo.getHotelIdsForUser.mockResolvedValue([100n]);
      const invalidPayload = { ...payload, roleSlug: RoleSlug.USER, hotelId: 200n };
      await expect(service.create(invalidPayload, owner)).rejects.toThrow("External actors cannot assign users to other hotels");
      expect(userRepo.createWithRoleAndHotel).not.toHaveBeenCalled();
    });

    it("owner is forbidden from creating a user with an internal role (e.g., admin)", async () => {
      hotelRepo.getHotelIdsForUser.mockResolvedValue([100n]);
      const payload = { email: "new@admin.com", password: "a-valid-password", name: "Wannabe Admin", roleSlug: RoleSlug.ADMIN, hotelId: 100n };

      await expect(service.create(payload, owner)).rejects.toThrow(ForbiddenError);
      await expect(service.create(payload, owner)).rejects.toThrow("External actors cannot assign internal roles");
      expect(userRepo.createWithRoleAndHotel).not.toHaveBeenCalled();
    });

    it("admin can create a user with a specific role and hotel", async () => {
      const payload = { email: "new@user.com", password: "a-valid-password", name: "Newbie", roleSlug: RoleSlug.MANAGER, hotelId: 500n };
      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.createWithRoleAndHotel.mockResolvedValue({ id: 101n } as any);

      await service.create(payload, admin);

      expect(userRepo.createWithRoleAndHotel).toHaveBeenCalledWith(expect.objectContaining({ email: "new@user.com" }), RoleSlug.MANAGER, 500n);
    });
  });

  describe("update()", () => {
    const targetUserId = 55n;
    const targetUser = { id: targetUserId, name: "Old Name" } as User;

    beforeEach(() => {
      userRepo.findById.mockResolvedValue(targetUser);
      userRepo.getUserRoleSlugs.mockResolvedValue([RoleSlug.USER]);
      userRepo.getUserHotelIds.mockResolvedValue([400n]);
      hotelRepo.getHotelIdsForUser.mockResolvedValue([400n]);
      userRepo.updateById.mockResolvedValue({ id: targetUserId } as any);
    });

    it("throws when trying to update a non-existent user", async () => {
      userRepo.findById.mockResolvedValue(null);
      await expect(service.update(999n, { name: "ghost" }, admin)).rejects.toThrow("User not found");
      expect(userRepo.updateById).not.toHaveBeenCalled();
    });

    it("normalizes email before updating", async () => {
      const messyEmail = "  CHANGED@EMAIL.com  ";
      userRepo.findByEmail.mockResolvedValue(null);
      await service.update(targetUserId, { email: messyEmail }, admin);
      expect(userRepo.findByEmail).toHaveBeenCalledWith("changed@email.com");
      expect(userRepo.updateById).toHaveBeenCalledWith(targetUserId, { email: "changed@email.com" });
    });

    it("throws when email is updated to an existing email", async () => {
      userRepo.findByEmail.mockResolvedValue({ id: 99n } as any);
      await expect(service.update(targetUserId, { email: "existing@email.com" }, admin)).rejects.toThrow("Email already in use");
      expect(userRepo.updateById).not.toHaveBeenCalled();
    });

    it("throws error for short password and does not update", async () => {
      const shortPasswordPayload = { password: "short" };
      await expect(service.update(targetUserId, shortPasswordPayload, admin)).rejects.toThrow(/Password must be at least/);
      expect(passwordService.createPasswordHash).not.toHaveBeenCalled();
      expect(userRepo.updateById).not.toHaveBeenCalled();
    });

    it("owner is forbidden from updating a user in a hotel they do not own", async () => {
      const targetUserId = 55n;
      // Owner ini hanya punya hotel 400
      hotelRepo.getHotelIdsForUser.mockResolvedValue([400n]);
      // Tapi user yang akan diupdate ada di hotel 999
      userRepo.findById.mockResolvedValue({ id: targetUserId } as any);
      userRepo.getUserHotelIds.mockResolvedValue([999n]);
      userRepo.getUserRoleSlugs.mockResolvedValue([RoleSlug.USER]);

      await expect(service.update(targetUserId, { name: "New Name" }, owner)).rejects.toThrow(ForbiddenError);
      await expect(service.update(targetUserId, { name: "New Name" }, owner)).rejects.toThrow("External actors cannot access users outside their hotels");
    });

    it("owner is forbidden from promoting a user to an internal role", async () => {
      const targetUserId = 55n;
      // Mock setup sama seperti tes update lainnya
      userRepo.findById.mockResolvedValue({ id: targetUserId } as any);
      userRepo.getUserRoleSlugs.mockResolvedValue([RoleSlug.USER]);
      userRepo.getUserHotelIds.mockResolvedValue([400n]);
      hotelRepo.getHotelIdsForUser.mockResolvedValue([400n]);

      await expect(service.update(targetUserId, { roleSlug: RoleSlug.ADMIN }, owner)).rejects.toThrow(ForbiddenError);
      await expect(service.update(targetUserId, { roleSlug: RoleSlug.ADMIN }, owner)).rejects.toThrow("External actors cannot assign internal roles");
    });

    it("admin can update a user role and hotel assignment", async () => {
      const targetUserId = 55n;
      userRepo.findById.mockResolvedValue({ id: targetUserId } as any);

      await service.update(targetUserId, { roleSlug: RoleSlug.MANAGER, hotelId: 777n }, admin);

      expect(userRepo.updateUserRoleAndHotel).toHaveBeenCalledWith(targetUserId, RoleSlug.MANAGER, 777n);
    });

    describe("Field-specific updates", () => {
      it("updates name only", async () => {
        await service.update(targetUserId, { name: "New Name" }, admin);
        expect(userRepo.updateById).toHaveBeenCalledWith(targetUserId, { name: "New Name" });
        expect(userRepo.updateUserRoleAndHotel).not.toHaveBeenCalled();
      });

      it("updates status only", async () => {
        await service.update(targetUserId, { status: "suspended" }, admin);
        expect(userRepo.updateById).toHaveBeenCalledWith(targetUserId, { status: "suspended" });
        expect(userRepo.updateUserRoleAndHotel).not.toHaveBeenCalled();
      });

      it("updates password only", async () => {
        await service.update(targetUserId, { password: "a-valid-new-secret" }, admin);
        expect(passwordService.createPasswordHash).toHaveBeenCalledWith("a-valid-new-secret");
        expect(userRepo.updateById).toHaveBeenCalledWith(targetUserId, { password: "hashed-password" });
        expect(userRepo.updateUserRoleAndHotel).not.toHaveBeenCalled();
      });

      it("updates role only", async () => {
        await service.update(targetUserId, { roleSlug: RoleSlug.MANAGER }, admin);
        expect(userRepo.updateUserRoleAndHotel).toHaveBeenCalledWith(targetUserId, RoleSlug.MANAGER, undefined);
        // The service implementation updates other fields first, so this call is expected
        expect(userRepo.updateById).toHaveBeenCalledWith(targetUserId, {});
      });
    });
  });

  describe('remove()', () => {
    it('throws when trying to remove a non-existent user', async () => {
      userRepo.findById.mockResolvedValue(null);
      await expect(service.remove(999n, admin)).rejects.toThrow('User not found');
      expect(userRepo.softDeleteById).not.toHaveBeenCalled();
    });

    it('actor is forbidden from removing themselves', async () => {
      userRepo.findById.mockResolvedValue({ id: BigInt(owner.userId) } as any);
      await expect(service.remove(BigInt(owner.userId), owner)).rejects.toThrow('Actors cannot remove themselves');
      expect(userRepo.softDeleteById).not.toHaveBeenCalled();
    });

    it('owner can remove user in their hotel', async () => {
      const targetUserId = 101n;
      userRepo.findById.mockResolvedValue({ id: targetUserId } as any);
      hotelRepo.getHotelIdsForUser.mockResolvedValue([800n]);
      userRepo.getUserRoleSlugs.mockResolvedValue([RoleSlug.USER]);
      userRepo.getUserHotelIds.mockResolvedValue([800n]);
      // On success, assume the function completes without returning a value.
      userRepo.softDeleteById.mockResolvedValue(undefined);

      await service.remove(targetUserId, owner);
      expect(userRepo.softDeleteById).toHaveBeenCalledWith(targetUserId);
    });

    it('owner is forbidden from removing a user in a hotel they do not own', async () => {
      const targetUserId = 101n;
      hotelRepo.getHotelIdsForUser.mockResolvedValue([800n]);
      userRepo.findById.mockResolvedValue({ id: targetUserId } as any);
      userRepo.getUserHotelIds.mockResolvedValue([900n]);
      userRepo.getUserRoleSlugs.mockResolvedValue([RoleSlug.USER]);

      await expect(service.remove(targetUserId, owner)).rejects.toThrow(ForbiddenError);
      await expect(service.remove(targetUserId, owner)).rejects.toThrow('External actors cannot access users outside their hotels');
    });

    it('throws a descriptive error if repository fails to soft delete', async () => {
      const targetUserId = 101n;
      userRepo.findById.mockResolvedValue({ id: targetUserId } as any);
      // Simulate a failure at the repository layer by rejecting the promise.
      const dbError = new Error('Database constraint failed');
      userRepo.softDeleteById.mockRejectedValue(dbError);

      await expect(service.remove(targetUserId, admin)).rejects.toThrow('Failed to remove user: Database constraint failed');
    });
  });
});
