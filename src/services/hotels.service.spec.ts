
import { HotelsService } from "./hotels.service";
import { HotelRepository, HotelFilter } from "../repositories/hotel.repository";
import { UserRepository } from "../repositories/user.repository";
import { AuthContext } from "../domain/auth/types";
import { ForbiddenError, ValidationError } from "../core/http/error";
import { RoleSlug } from "../rbac/enums";
import { Hotel } from "../domain";

const createHotelRepositoryMock = (): jest.Mocked<HotelRepository> => ({
  paginate: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateById: jest.fn(),
  softDeleteById: jest.fn(),
  getHotelIdsForUser: jest.fn(),
  findMany: jest.fn(),
  findOne: jest.fn(),
  listByOwner: jest.fn(),
  count: jest.fn(),
});

const createUserRepositoryMock = (): jest.Mocked<UserRepository> =>
  ({
    getUserHotelIds: jest.fn(),
  } as any);

const createActor = (
  userId: string,
  roles: { slug: RoleSlug; scope: "internal" | "external" }[]
): AuthContext => ({
  userId,
  sessionId: "session-id",
  scope: roles.some((role) => role.scope === "internal") ? "internal" : "external",
  roles: roles as any,
  permissions: [],
});

describe("HotelsService", () => {
  let hotelRepo: jest.Mocked<HotelRepository>;
  let service: HotelsService;

  // Actors
  const superadmin = createActor("1", [{ slug: RoleSlug.SUPERADMIN, scope: "internal" }]);
  const admin = createActor("2", [{ slug: RoleSlug.ADMIN, scope: "internal" }]);
  const owner1 = createActor("101", [{ slug: RoleSlug.OWNER, scope: "external" }]);
  const owner2 = createActor("102", [{ slug: RoleSlug.OWNER, scope: "external" }]);

  const hotel1: Hotel = { id: 1n, name: "Hotel California", owner_user_id: BigInt(owner1.userId), status: "active", created_at: new Date(), updated_at: new Date(), deleted_at: null };
  const hotel2: Hotel = { id: 2n, name: "Grand Hotel", owner_user_id: BigInt(owner2.userId), status: "active", created_at: new Date(), updated_at: new Date(), deleted_at: null };

  beforeEach(() => {
    jest.clearAllMocks();
    hotelRepo = createHotelRepositoryMock();
    service = new HotelsService(hotelRepo);
    hotelRepo.paginate.mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 20 });
  });

  describe("list()", () => {
    it("internal actor (admin) can list all hotels without filters", async () => {
      hotelRepo.paginate.mockResolvedValue({ data: [hotel1, hotel2], total: 2, page: 1, pageSize: 20 });
      const result = await service.list({}, admin);
      expect(hotelRepo.paginate).toHaveBeenCalledWith({}, 1, 20, { id: "DESC" });
      expect(result.data).toHaveLength(2);
    });

    it("external actor (owner) is scoped to their own hotels", async () => {
      hotelRepo.paginate.mockResolvedValue({ data: [hotel1], total: 1, page: 1, pageSize: 20 });
      const result = await service.list({}, owner1);
      const expectedFilter: HotelFilter = { owner_user_id: BigInt(owner1.userId) };
      expect(hotelRepo.paginate).toHaveBeenCalledWith(expectedFilter, 1, 20, { id: "DESC" });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].owner_user_id).toBe(BigInt(owner1.userId));
    });

    it("throws ForbiddenError if no actor is provided for an external scope action", async () => {
        // Simulating a scenario where an external user's context is missing
        await expect(service.list({}, undefined)).rejects.toThrow(ForbiddenError);
    });

    it("passes pagination parameters to the repository", async () => {
        await service.list({ page: 2, pageSize: 10 }, admin);
        expect(hotelRepo.paginate).toHaveBeenCalledWith({}, 2, 10, { id: "DESC" });
    });

    it('throws a ValidationError for an invalid sortBy field', async () => {
      const invalidFilter = { sortBy: 'owner_user_id' as any };
      await expect(service.list(invalidFilter, admin)).rejects.toThrow(ValidationError);
      await expect(service.list(invalidFilter, admin)).rejects.toThrow("Invalid sortBy field: owner_user_id");
    });
  });

  describe("getById()", () => {
    it("internal actor (admin) can get any hotel by ID", async () => {
        hotelRepo.findById.mockResolvedValue(hotel2);
        const result = await service.getById(hotel2.id, admin);
        expect(hotelRepo.findById).toHaveBeenCalledWith(hotel2.id);
        expect(result).toEqual(hotel2);
    });

    it("owner can get their own hotel by ID", async () => {
        hotelRepo.findById.mockResolvedValue(hotel1);
        const result = await service.getById(hotel1.id, owner1);
        expect(result).toEqual(hotel1);
    });

    it("owner is forbidden from getting a hotel they do not own", async () => {
        hotelRepo.findById.mockResolvedValue(hotel2);
        await expect(service.getById(hotel2.id, owner1)).rejects.toThrow(ForbiddenError);
        await expect(service.getById(hotel2.id, owner1)).rejects.toThrow("External actors can only access their own hotels");
    });

    it("returns null for a non-existent hotel ID", async () => {
        hotelRepo.findById.mockResolvedValue(null);
        const result = await service.getById(999n, admin);
        expect(result).toBeNull();
    });
  });

  describe("create()", () => {
    const createPayload = { name: "New Resort" };

    it("internal actor (superadmin) can create a hotel for a specific owner", async () => {
      const payloadWithOwner = { ...createPayload, ownerUserId: BigInt(owner2.userId) };
      hotelRepo.create.mockResolvedValue({ ...hotel1, ...payloadWithOwner });
      
      await service.create(payloadWithOwner, superadmin);
      
      expect(hotelRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        name: createPayload.name,
        owner_user_id: BigInt(owner2.userId),
        status: "active"
      }));
    });

    it("throws an error if an internal actor does not provide ownerUserId", async () => {
        await expect(service.create(createPayload, admin)).rejects.toThrow("ownerUserId is required for internal actors");
    });

    it("owner can create a hotel and is set as the owner automatically", async () => {
        hotelRepo.create.mockResolvedValue({ ...hotel1, name: createPayload.name, owner_user_id: BigInt(owner1.userId) });
        
        await service.create(createPayload, owner1);
        
        expect(hotelRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            name: createPayload.name,
            owner_user_id: BigInt(owner1.userId)
        }));
    });

    it("owner is forbidden from creating a hotel for another user", async () => {
        const payload = { ...createPayload, ownerUserId: BigInt(owner2.userId) };
        await expect(service.create(payload, owner1)).rejects.toThrow(ForbiddenError);
        await expect(service.create(payload, owner1)).rejects.toThrow("External actors cannot assign hotels to other owners");
    });

    it("throws an error if name is not provided", async () => {
        await expect(service.create({ name: "" }, admin)).rejects.toThrow("name is required");
    });

    it('throws an error for an invalid status value', async () => {
      const payload = { ...createPayload, ownerUserId: BigInt(owner1.userId), status: 'invalid-status' as any };
      await expect(service.create(payload, superadmin)).rejects.toThrow('Invalid status value');
    });
  });

  describe("update()", () => {
    const updatePayload = { name: "Updated Hotel Name" };

    it("internal actor (admin) can update any hotel", async () => {
        hotelRepo.findById.mockResolvedValue(hotel2);
        await service.update(hotel2.id, updatePayload, admin);
        expect(hotelRepo.updateById).toHaveBeenCalledWith(hotel2.id, updatePayload);
    });

    it("owner can update their own hotel", async () => {
        hotelRepo.findById.mockResolvedValue(hotel1);
        await service.update(hotel1.id, updatePayload, owner1);
        expect(hotelRepo.updateById).toHaveBeenCalledWith(hotel1.id, updatePayload);
    });

    it("owner is forbidden from updating a hotel they do not own", async () => {
        hotelRepo.findById.mockResolvedValue(hotel2);
        await expect(service.update(hotel2.id, updatePayload, owner1)).rejects.toThrow(ForbiddenError);
    });

    it("owner is forbidden from changing hotel ownership", async () => {
        hotelRepo.findById.mockResolvedValue(hotel1);
        const payload = { ownerUserId: BigInt(owner2.userId) };
        await expect(service.update(hotel1.id, payload, owner1)).rejects.toThrow("Only internal actors can reassign hotel ownership");
    });

    it("admin can change hotel ownership", async () => {
        hotelRepo.findById.mockResolvedValue(hotel1);
        const payload = { ownerUserId: BigInt(owner2.userId) };
        await service.update(hotel1.id, payload, admin);
        expect(hotelRepo.updateById).toHaveBeenCalledWith(hotel1.id, { owner_user_id: BigInt(owner2.userId) });
    });

    it("throws an error when trying to update a non-existent hotel", async () => {
        hotelRepo.findById.mockResolvedValue(null);
        await expect(service.update(999n, updatePayload, admin)).rejects.toThrow("Hotel not found");
    });

    it('throws an error for an invalid status value', async () => {
      hotelRepo.findById.mockResolvedValue(hotel1);
      const payload = { status: 'invalid-status' as any };
      await expect(service.update(hotel1.id, payload, admin)).rejects.toThrow('Invalid status value');
    });
  });

  describe("remove()", () => {
    it("admin can remove any hotel", async () => {
        hotelRepo.findById.mockResolvedValue(hotel2);
        await service.remove(hotel2.id, admin);
        expect(hotelRepo.softDeleteById).toHaveBeenCalledWith(hotel2.id);
    });

    it("owner can remove their own hotel", async () => {
        hotelRepo.findById.mockResolvedValue(hotel1);
        await service.remove(hotel1.id, owner1);
        expect(hotelRepo.softDeleteById).toHaveBeenCalledWith(hotel1.id);
    });

    it("owner is forbidden from removing a hotel they do not own", async () => {
        hotelRepo.findById.mockResolvedValue(hotel2);
        await expect(service.remove(hotel2.id, owner1)).rejects.toThrow(ForbiddenError);
    });

    it("throws an error when trying to remove a non-existent hotel", async () => {
        hotelRepo.findById.mockResolvedValue(null);
        await expect(service.remove(999n, admin)).rejects.toThrow("Hotel not found");
    });

    it('throws a descriptive error if repository fails to soft delete', async () => {
      hotelRepo.findById.mockResolvedValue(hotel1);
      const dbError = new Error('Database constraint failed');
      hotelRepo.softDeleteById.mockRejectedValue(dbError);

      await expect(service.remove(hotel1.id, admin)).rejects.toThrow('Failed to remove hotel: Database constraint failed');
    });
  });
});
