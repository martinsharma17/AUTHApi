// Controllers/AdminController.cs
using AUTHApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin")] // Admins and SuperAdmin
public class AdminController : ControllerBase
{
    //private readonly UserManager<IdentityUser> _userManager;
    //public AdminController(UserManager<IdentityUser> userManager) => _userManager = userManager;

    private readonly UserManager<ApplicationUser> _userManager;

    public AdminController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }
    // GET: api/Admin/users
    [HttpGet("users")]
    public IActionResult GetUsers()
    {
        var users = _userManager.Users.Select(u => new { u.Id, u.Email, u.UserName }).ToList();
        return Ok(users);
    }

    // Optionally: Admin can view their own profile
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return NotFound();
        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new { user.Id, user.Email, Roles = roles });
    }
}
