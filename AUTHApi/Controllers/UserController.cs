// Controllers/UserController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
[Authorize] // any authenticated user
public class UserController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    public UserController(UserManager<IdentityUser> userManager) => _userManager = userManager;

    // GET: api/User/profile
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return NotFound();

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new { user.Id, user.Email, user.UserName, Roles = roles });
    }

    // PUT: api/User/profile
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileModel model)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return NotFound();

        // simple example: allow changing username
        user.UserName = model.UserName ?? user.UserName;
        user.Email = model.Email ?? user.Email;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return Ok(new { message = "Profile updated" });
    }
}

public class UpdateProfileModel
{
    public string UserName { get; set; }
    public string Email { get; set; }
}
