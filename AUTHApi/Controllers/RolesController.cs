using AUTHApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AUTHApi.Controllers
{
   
    /// Controller for managing roles
    /// Base URL: /api/Roles
    /// IMPORTANT: All endpoints require Admin role
   
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "AdminOnly")]  // Only Admins can access this controller
    public class RolesController : ControllerBase
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;

        public RolesController(RoleManager<IdentityRole> roleManager, UserManager<ApplicationUser> userManager)
        {
            _roleManager = roleManager;
            _userManager = userManager;
        }

       
        /// Get all roles in the system
        /// GET /api/Roles
   
        [HttpGet]
        public IActionResult GetAllRoles()
        {
            var roles = _roleManager.Roles.Select(r => new { r.Id, r.Name }).ToList();
            return Ok(new { success = true, roles = roles });
        }

     
        /// Assign a role to a user
        /// POST /api/Roles/AssignRole
 
        [HttpPost("AssignRole")]
        public async Task<IActionResult> AssignRoleToUser([FromBody] AssignRoleModel model)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.RoleName))
            {
                return BadRequest(new { success = false, message = "Email and RoleName are required" });
            }

            // Find user
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found" });
            }

            // Check if role exists
            var roleExists = await _roleManager.RoleExistsAsync(model.RoleName);
            if (!roleExists)
            {
                return NotFound(new { success = false, message = "Role not found" });
            }

            // Check if user already has this role
            var isInRole = await _userManager.IsInRoleAsync(user, model.RoleName);
            if (isInRole)
            {
                return BadRequest(new { success = false, message = "User already has this role" });
            }

            // Assign role to user
            var result = await _userManager.AddToRoleAsync(user, model.RoleName);
            if (result.Succeeded)
            {
                return Ok(new { success = true, message = $"Role '{model.RoleName}' assigned to user successfully" });
            }

            return BadRequest(new { success = false, message = "Failed to assign role", errors = result.Errors });
        }
         
        /// Remove a role from a user
    
        [HttpPost("RemoveRole")]
        public async Task<IActionResult> RemoveRoleFromUser([FromBody] AssignRoleModel model)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.RoleName))
            {
                return BadRequest(new { success = false, message = "Email and RoleName are required" });
            }

            // Find user
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found" });
            }

            // Check if user has this role
            var isInRole = await _userManager.IsInRoleAsync(user, model.RoleName);
            if (!isInRole)
            {
                return BadRequest(new { success = false, message = "User does not have this role" });
            }

            // Remove role from user
            var result = await _userManager.RemoveFromRoleAsync(user, model.RoleName);
            if (result.Succeeded)
            {
                return Ok(new { success = true, message = $"Role '{model.RoleName}' removed from user successfully" });
            }

            return BadRequest(new { success = false, message = "Failed to remove role", errors = result.Errors });
        }
 
        /// Get all roles for a specific user
        /// GET /api/Roles/UserRoles/{email}
       
        [HttpGet("UserRoles/{email}")]
        public async Task<IActionResult> GetUserRoles(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found" });
            }

            var roles = await _userManager.GetRolesAsync(user);
            return Ok(new { success = true, email = email, roles = roles });
        }
    }
 
    /// Model for assigning/removing roles
  
    public class AssignRoleModel
    {
        public string Email { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
    }
}


