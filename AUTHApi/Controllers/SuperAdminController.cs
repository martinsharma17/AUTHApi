// Controllers/SuperAdminController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin")] // Only SuperAdmin can call these endpoints
public class SuperAdminController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public SuperAdminController(UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    // GET: api/SuperAdmin/users
    [HttpGet("users")]
    public IActionResult GetAllUsers()
    {
        var users = _userManager.Users.Select(u => new {
            u.Id,
            u.UserName,
            u.Email
        }).ToList();

        return Ok(users);
    }

    // GET: api/SuperAdmin/admins
    [HttpGet("admins")]
    public async Task<IActionResult> GetAllAdmins()
    {
        var admins = (await _userManager.GetUsersInRoleAsync("Admin"))
                     .Select(u => new { u.Id, u.Email, u.UserName })
                     .ToList();
        return Ok(admins);
    }

    // POST: api/SuperAdmin/promote/{userId}
    [HttpPost("promote/{userId}")]
    public async Task<IActionResult> PromoteToAdmin(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound("User not found");

        if (!await _roleManager.RoleExistsAsync("Admin"))
            await _roleManager.CreateAsync(new IdentityRole("Admin"));

        if (await _userManager.IsInRoleAsync(user, "Admin"))
            return BadRequest("User is already an admin");

        var result = await _userManager.AddToRoleAsync(user, "Admin");
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { message = "User promoted to Admin", userId = user.Id });
    }

    // Optionally: GET: api/SuperAdmin/users-with-roles
    [HttpGet("users-with-roles")]
    public async Task<IActionResult> GetUsersWithRoles()
    {
        var allUsers = _userManager.Users.ToList();
        var results = new System.Collections.Generic.List<object>();
        foreach (var u in allUsers)
        {
            var roles = await _userManager.GetRolesAsync(u);
            results.Add(new { u.Id, u.Email, Roles = roles });
        }
        return Ok(results);
    }
}
