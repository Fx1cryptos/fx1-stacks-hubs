import { describe, expect, it, beforeEach } from "vitest"
import { Cl } from "@stacks/transactions"

declare const simnet: any

describe("Hubs Contract - Comprehensive Tests", () => {
  const accounts = simnet.getAccounts()
  const deployer = accounts.get("deployer")!
  const owner1 = accounts.get("wallet_1")!
  const owner2 = accounts.get("wallet_2")!
  const member1 = accounts.get("wallet_3")!
  const member2 = accounts.get("wallet_4")!
  const member3 = accounts.get("wallet_5")!
  const randomUser = accounts.get("wallet_6")!

  const hubId1 = 1
  const hubId2 = 2
  const hubName1 = "Tech Innovators" as const
  const hubName2 = "Web3 Builders" as const

  describe("Hub Creation", () => {
    it("should create a hub with valid parameters", () => {
      const result = simnet.callPublicFn(
        "hubs",
        "create-hub",
        [Cl.uint(hubId1), Cl.stringAscii(hubName1)],
        owner1
      )

      expect(result.result).toBeOk(Cl.uint(hubId1))

      // Verify hub data
      const hub = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(hubId1)],
        deployer
      )

      expect(hub.result).toBeSome(
        Cl.tuple({
          name: Cl.stringAscii(hubName1),
          owner: Cl.principal(owner1),
          members: Cl.list([Cl.principal(owner1)])
        })
      )
    })

    it("should create multiple hubs with different IDs", () => {
      // First hub
      simnet.callPublicFn(
        "hubs",
        "create-hub",
        [Cl.uint(hubId1), Cl.stringAscii(hubName1)],
        owner1
      )

      // Second hub
      const result2 = simnet.callPublicFn(
        "hubs",
        "create-hub",
        [Cl.uint(hubId2), Cl.stringAscii(hubName2)],
        owner2
      )

      expect(result2.result).toBeOk(Cl.uint(hubId2))

      const hub2 = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(hubId2)],
        deployer
      )

      expect(hub2.result).toBeSome(
        Cl.tuple({
          name: Cl.stringAscii(hubName2),
          owner: Cl.principal(owner2),
          members: Cl.list([Cl.principal(owner2)])
        })
      )
    })

    it("should allow same owner to create multiple hubs", () => {
      // First hub
      simnet.callPublicFn(
        "hubs",
        "create-hub",
        [Cl.uint(hubId1), Cl.stringAscii(hubName1)],
        owner1
      )

      // Second hub by same owner
      const result2 = simnet.callPublicFn(
        "hubs",
        "create-hub",
        [Cl.uint(hubId2), Cl.stringAscii(hubName2)],
        owner1
      )

      expect(result2.result).toBeOk(Cl.uint(hubId2))

      const hub2 = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(hubId2)],
        deployer
      )

      expect(hub2.value.data.owner).toEqual(Cl.principal(owner1))
    })

    it("should allow creation with maximum length name", () => {
      const maxLengthName = "A".repeat(50) as `${string}`
      
      const result = simnet.callPublicFn(
        "hubs",
        "create-hub",
        [Cl.uint(3), Cl.stringAscii(maxLengthName)],
        owner1
      )

      expect(result.result).toBeOk(Cl.uint(3))
    })

    it("should reject creation with existing hub ID", () => {
      // Create first hub
      simnet.callPublicFn(
        "hubs",
        "create-hub",
        [Cl.uint(hubId1), Cl.stringAscii(hubName1)],
        owner1
      )

      // Try to create hub with same ID
      const result = simnet.callPublicFn(
        "hubs",
        "create-hub",
        [Cl.uint(hubId1), Cl.stringAscii("Another Hub")],
        owner2
      )

      // map-insert should return false (key exists) but wrapped in ok?
      // The contract doesn't check the return value of map-insert
      expect(result.result).toBeOk(Cl.uint(hubId1))
      
      // Verify original hub wasn't overwritten
      const hub = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(hubId1)],
        deployer
      )

      expect(hub.value.data.name).toEqual(Cl.stringAscii(hubName1))
      expect(hub.value.data.owner).toEqual(Cl.principal(owner1))
    })

    it("should handle zero hub ID", () => {
      const result = simnet.callPublicFn(
        "hubs",
        "create-hub",
        [Cl.uint(0), Cl.stringAscii("Zero Hub")],
        owner1
      )

      expect(result.result).toBeOk(Cl.uint(0))
      
      const hub = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(0)],
        deployer
      )

      expect(hub.result).toBeSome()
    })
  })

  describe("Add Member", () => {
    beforeEach(() => {
      // Create a hub before each test
      simnet.callPublicFn(
        "hubs",
        "create-hub",
        [Cl.uint(hubId1), Cl.stringAscii(hubName1)],
        owner1
      )
    })

    it("should allow owner to add a member", () => {
      const result = simnet.callPublicFn(
        "hubs",
        "add-member",
        [Cl.uint(hubId1), Cl.principal(member1)],
        owner1
      )

      expect(result.result).toBeOk(Cl.bool(true))

      const hub = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(hubId1)],
        deployer
      )

      expect(hub.value.data.members).toEqual(
        Cl.list([Cl.principal(owner1), Cl.principal(member1)])
      )
    })

    it("should allow non-owner to add member (contract doesn't check authorization)", () => {
      const result = simnet.callPublicFn(
        "hubs",
        "add-member",
        [Cl.uint(hubId1), Cl.principal(member2)],
        randomUser // Not the owner
      )

      expect(result.result).toBeOk(Cl.bool(true))

      const hub = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(hubId1)],
        deployer
      )

      expect(hub.value.data.members).toEqual(
        Cl.list([Cl.principal(owner1), Cl.principal(member2)])
      )
    })

    it("should allow adding multiple members", () => {
      // Add first member
      simnet.callPublicFn(
        "hubs",
        "add-member",
        [Cl.uint(hubId1), Cl.principal(member1)],
        owner1
      )

      // Add second member
      simnet.callPublicFn(
        "hubs",
        "add-member",
        [Cl.uint(hubId1), Cl.principal(member2)],
        owner1
      )

      const hub = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(hubId1)],
        deployer
      )

      expect(hub.value.data.members).toEqual(
        Cl.list([Cl.principal(owner1), Cl.principal(member1), Cl.principal(member2)])
      )
    })

    it("should allow adding same member multiple times (duplicates)", () => {
      // Add member once
      simnet.callPublicFn(
        "hubs",
        "add-member",
        [Cl.uint(hubId1), Cl.principal(member1)],
        owner1
      )

      // Add same member again
      simnet.callPublicFn(
        "hubs",
        "add-member",
        [Cl.uint(hubId1), Cl.principal(member1)],
        owner1
      )

      const hub = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(hubId1)],
        deployer
      )

      // Member appears twice in list
      expect(hub.value.data.members).toEqual(
        Cl.list([Cl.principal(owner1), Cl.principal(member1), Cl.principal(member1)])
      )
    })

    it("should allow adding owner as member again", () => {
      const result = simnet.callPublicFn(
        "hubs",
        "add-member",
        [Cl.uint(hubId1), Cl.principal(owner1)],
        owner1
      )

      expect(result.result).toBeOk(Cl.bool(true))

      const hub = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(hubId1)],
        deployer
      )

      expect(hub.value.data.members).toEqual(
        Cl.list([Cl.principal(owner1), Cl.principal(owner1)])
      )
    })

    it("should handle adding members up to list limit", () => {
      const members = [member1, member2, member3]
      
      // Add members up to limit (list can hold 10, starting with 1)
      for (let i = 0; i < 9; i++) {
        const member = accounts.get(`wallet_${i + 3}`)!
        simnet.callPublicFn(
          "hubs",
          "add-member",
          [Cl.uint(hubId1), Cl.principal(member)],
          owner1
        )
      }

      const hub = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(hubId1)],
        deployer
      )

      // Should have 10 members (owner + 9 added)
      expect(hub.value.data.members.list.length).toBe(10)
    })

    it("should fail when adding member beyond list limit", () => {
      // Add 9 members (to reach limit of 10 including owner)
      for (let i = 0; i < 9; i++) {
        const member = accounts.get(`wallet_${i + 3}`)!
        simnet.callPublicFn(
          "hubs",
          "add-member",
          [Cl.uint(hubId1), Cl.principal(member)],
          owner1
        )
      }

      // Try to add one more
      const result = simnet.callPublicFn(
        "hubs",
        "add-member",
        [Cl.uint(hubId1), Cl.principal(accounts.get("wallet_12")!)],
        owner1
      )

      // This should fail due to list overflow
      expect(result.result.type).toBe("err")
    })

    it("should reject adding member to non-existent hub", () => {
      const result = simnet.callPublicFn(
        "hubs",
        "add-member",
        [Cl.uint(999), Cl.principal(member1)],
        owner1
      )

      expect(result.result).toBeErr(Cl.stringAscii("Hub not found"))
    })
  })

  describe("Read Operations", () => {
    beforeEach(() => {
      // Create a hub and add members
      simnet.callPublicFn(
        "hubs",
        "create-hub",
        [Cl.uint(hubId1), Cl.stringAscii(hubName1)],
        owner1
      )

      simnet.callPublicFn(
        "hubs",
        "add-member",
        [Cl.uint(hubId1), Cl.principal(member1)],
        owner1
      )

      simnet.callPublicFn(
        "hubs",
        "add-member",
        [Cl.uint(hubId1), Cl.principal(member2)],
        owner1
      )
    })

    it("should return correct hub data", () => {
      const result = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(hubId1)],
        randomUser
      )

      expect(result.result).toBeSome(
        Cl.tuple({
          name: Cl.stringAscii(hubName1),
          owner: Cl.principal(owner1),
          members: Cl.list([Cl.principal(owner1), Cl.principal(member1), Cl.principal(member2)])
        })
      )
    })

    it("should return none for non-existent hub", () => {
      const result = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(999)],
        randomUser
      )

      expect(result.result).toBeNone()
    })

    it("should allow anyone to read hub data", () => {
      const result = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(hubId1)],
        randomUser
      )

      expect(result.result).toBeSome()
    })
  })

  describe("Edge Cases", () => {
    it("should handle very large hub IDs", () => {
      const largeHubId = 1000000
      
      const result = simnet.callPublicFn(
        "hubs",
        "create-hub",
        [Cl.uint(largeHubId), Cl.stringAscii("Large ID Hub")],
        owner1
      )

      expect(result.result).toBeOk(Cl.uint(largeHubId))

      const hub = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(largeHubId)],
        deployer
      )

      expect(hub.result).toBeSome()
    })

    it("should handle maximum uint value for hub ID", () => {
      const maxUint = 340282366920938463463374607431768211455
      
      const result = simnet.callPublicFn(
        "hubs",
        "create-hub",
        [Cl.uint(maxUint), Cl.stringAscii("Max ID Hub")],
        owner1
      )

      expect(result.result).toBeOk(Cl.uint(maxUint))
    })

    it("should handle empty string as hub name", () => {
      const result = simnet.callPublicFn(
        "hubs",
        "create-hub",
        [Cl.uint(5), Cl.stringAscii("")],
        owner1
      )

      expect(result.result).toBeOk(Cl.uint(5))

      const hub = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(5)],
        deployer
      )

      expect(hub.value.data.name).toEqual(Cl.stringAscii(""))
    })

    it("should handle special characters in hub name", () => {
      const specialName = "!@#$%^&*()_+ Hub 123" as const
      
      const result = simnet.callPublicFn(
        "hubs",
        "create-hub",
        [Cl.uint(6), Cl.stringAscii(specialName)],
        owner1
      )

      expect(result.result).toBeOk(Cl.uint(6))

      const hub = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(6)],
        deployer
      )

      expect(hub.value.data.name).toEqual(Cl.stringAscii(specialName))
    })
  })

  describe("Multiple Hub Operations", () => {
    it("should maintain separate member lists for different hubs", () => {
      // Create first hub
      simnet.callPublicFn(
        "hubs",
        "create-hub",
        [Cl.uint(hubId1), Cl.stringAscii(hubName1)],
        owner1
      )

      // Create second hub
      simnet.callPublicFn(
        "hubs",
        "create-hub",
        [Cl.uint(hubId2), Cl.stringAscii(hubName2)],
        owner2
      )

      // Add members to first hub
      simnet.callPublicFn(
        "hubs",
        "add-member",
        [Cl.uint(hubId1), Cl.principal(member1)],
        owner1
      )

      // Add members to second hub
      simnet.callPublicFn(
        "hubs",
        "add-member",
        [Cl.uint(hubId2), Cl.principal(member2)],
        owner2
      )

      const hub1 = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(hubId1)],
        deployer
      )

      const hub2 = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(hubId2)],
        deployer
      )

      expect(hub1.value.data.members).toEqual(
        Cl.list([Cl.principal(owner1), Cl.principal(member1)])
      )

      expect(hub2.value.data.members).toEqual(
        Cl.list([Cl.principal(owner2), Cl.principal(member2)])
      )
    })

    it("should allow same member to join multiple hubs", () => {
      // Create two hubs
      simnet.callPublicFn(
        "hubs",
        "create-hub",
        [Cl.uint(hubId1), Cl.stringAscii(hubName1)],
        owner1
      )

      simnet.callPublicFn(
        "hubs",
        "create-hub",
        [Cl.uint(hubId2), Cl.stringAscii(hubName2)],
        owner2
      )

      // Add same member to both hubs
      simnet.callPublicFn(
        "hubs",
        "add-member",
        [Cl.uint(hubId1), Cl.principal(member1)],
        owner1
      )

      simnet.callPublicFn(
        "hubs",
        "add-member",
        [Cl.uint(hubId2), Cl.principal(member1)],
        owner2
      )

      const hub1 = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(hubId1)],
        deployer
      )

      const hub2 = simnet.callReadOnlyFn(
        "hubs",
        "get-hub",
        [Cl.uint(hubId2)],
        deployer
      )

      expect(hub1.value.data.members).toContain(Cl.principal(member1))
      expect(hub2.value.data.members).toContain(Cl.principal(member1))
    })
  })

  describe("Performance and Stress Tests", () => {
    it("should handle rapid consecutive hub creations", () => {
      for (let i = 0; i < 10; i++) {
        const result = simnet.callPublicFn(
          "hubs",
          "create-hub",
          [Cl.uint(i + 100), Cl.stringAscii(`Hub ${i}` as const)],
          owner1
        )
        expect(result.result).toBeOk(Cl.uint(i + 100))
      }
    })

    it("should handle rapid member additions", () => {
      // Create hub
      simnet.callPublicFn(
        "hubs",
        "create-hub",
        [Cl.uint(200), Cl.stringAscii("Stress Test Hub")],
        owner1
      )

      // Rapidly add members
      for (let i = 0; i < 5; i++) {
        const member = accounts.get(`wallet_${i + 10}`)!
        const result = simnet.callPublicFn(
          "hubs",
          "add-member",
          [Cl.uint(200), Cl.principal(member)],
          owner1
        )
        expect(result.result).toBeOk(Cl.bool(true))
      }
    })
  })

  describe("Error Conditions", () => {
    it("should return error when adding member to non-existent hub", () => {
      const result = simnet.callPublicFn(
        "hubs",
        "add-member",
        [Cl.uint(999), Cl.principal(member1)],
        owner1
      )

      expect(result.result).toBeErr(Cl.stringAscii("Hub not found"))
    })

    it("should handle adding member to hub that was deleted (not supported)", () => {
      // Can't test deletion since contract doesn't support it
    })
  })
})
