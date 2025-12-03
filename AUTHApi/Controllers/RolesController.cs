using AUTHApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // Added this using directive
using System.Security.Claims; // Added this using directive

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

        /// Get all users (SuperAdmin only)
        /// GET /api/Roles/AllUsers
        [HttpGet("AllUsers")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var userList = new List<object>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userList.Add(new { user.Id, user.Name, user.Email, Roles = roles });
            }

            return Ok(new { success = true, users = userList });
        }

        /// Get all admins (SuperAdmin only)
        /// GET /api/Roles/AllAdmins
        [HttpGet("AllAdmins")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> GetAllAdmins()
        {
            var admins = await _userManager.GetUsersInRoleAsync("Admin");
            var adminList = new List<object>();

            foreach (var admin in admins)
            {
                var roles = await _userManager.GetRolesAsync(admin);
                adminList.Add(new { admin.Id, admin.Name, admin.Email, Roles = roles });
            }

            return Ok(new { success = true, admins = adminList });
        }

        /// Get users managed by the current Admin (Admin only)
        /// GET /api/Admin/users
        [HttpGet("Admin/users")] // Corrected path to match frontend
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUsersForAdmin()
        {
            var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; // Get Admin's ID from JWT

            if (string.IsNullOrEmpty(adminId))
            {
                return Unauthorized(new { success = false, message = "Admin ID not found in token." });
            }

            // Assuming ApplicationUser has a ManagerId property to link users to their managing Admin
            var users = await _userManager.Users
                                        .Where(u => u.ManagerId == adminId)
                                        .ToListAsync();

            var userList = new List<object>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userList.Add(new { user.Id, user.Name, user.Email, Roles = roles });
            }

            return Ok(new { success = true, users = userList });
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


