using AUTHApi.Data;
using AUTHApi.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace AUTHApi.Controllers
{
    /// <summary>
    /// Controller for user authentication (Register, Login, Logout)
    /// Base URL: /api/UserAuth
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class UserAuthController : ControllerBase
    {
        // Dependencies injected via constructor
        private readonly UserManager<ApplicationUser> _userManager;  // Manage users
        private readonly SignInManager<ApplicationUser> _signinManager;  // Handle sign-in
        private readonly RoleManager<IdentityRole> _roleManager;  // Manage roles
        private readonly string? _jwtKey;  // JWT secret key
        private readonly string? _JwtIssuer;  // JWT issuer
        private readonly string? _JwtAudience;  // JWT audience
        private readonly int _JwtExpiry;  // Token expiration in minutes

        public UserAuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _signinManager = signInManager;
            _roleManager = roleManager;
            _jwtKey = configuration["Jwt:Key"];
            _JwtIssuer = configuration["Jwt:Issuer"];
            _JwtAudience = configuration["Jwt:Audience"];
            _JwtExpiry = int.Parse(configuration["Jwt:ExpireMinutes"] ?? "60");
        }

        /// <summary>
        /// Register a new user
        /// POST /api/UserAuth/Register
        /// </summary>
        /// <param name="registerModel">User registration data (Name, Email, Password)</param>
        /// <returns>Success message</returns>
        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel registerModel)
        {
            // Validate input
            if (registerModel == null
                 || string.IsNullOrEmpty(registerModel.Name)
                 || string.IsNullOrEmpty(registerModel.Email)
                 || string.IsNullOrEmpty(registerModel.Password))
            {
                return BadRequest(new { success = false, message = "Invalid client request" });
            }

            // Check if user already exists
            var existingUser = await _userManager.FindByEmailAsync(registerModel.Email);
            if (existingUser != null)
            {
                return BadRequest(new { success = false, message = "User already exists" });
            }

            // Create new user
            var user = new ApplicationUser
            {
                UserName = registerModel.Email,
                Email = registerModel.Email,
                Name = registerModel.Name
            };

            // Save user to database
            var result = await _userManager.CreateAsync(user, registerModel.Password);
            if (result.Succeeded)
            {
                // IMPORTANT: Assign "User" role to new registrations
                // This allows them to access endpoints with [Authorize(Roles = "User")]
                await _userManager.AddToRoleAsync(user, "User");
                return Ok(new { success = true, message = "User registered successfully" });
            }
            else
            {
                return BadRequest(new { success = false, message = "User registration failed", errors = result.Errors });
            }
        }

        /// <summary>
        /// Login user and get JWT token
        /// POST /api/UserAuth/Login
        /// </summary>
        /// <param name="loginModel">Login credentials (Email, Password)</param>
        /// <returns>JWT token and user roles</returns>
        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginModel loginModel)
        {
            // Find user by email
            var user = await _userManager.FindByEmailAsync(loginModel.Email);
            if (user == null)
            {
                return Unauthorized(new { success = false, message = "Invalid email or password" });
            }

            // Verify password
            var result = await _signinManager.CheckPasswordSignInAsync(user, loginModel.Password, false);
            if (!result.Succeeded)
            {
                return Unauthorized(new { success = false, message = "Invalid email or password" });
            }

            // Generate JWT token with user roles and claims
            var token = await GenerateJWTToken(user);
            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new { success = true, token = token, roles = roles });
        }

        /// <summary>
        /// Logout user
        /// POST /api/UserAuth/Logout
        /// </summary>
        [HttpPost("Logout")]
        public async Task<IActionResult> Logout()
        {
            await _signinManager.SignOutAsync();
            return Ok(new { success = true, message = "User logged out successfully" });
        }

        /// <summary>
        /// Generate JWT token for authenticated user
        /// This token includes user roles and claims for authorization
        /// </summary>
        /// <param name="user">The user to generate token for</param>
        /// <returns>JWT token string</returns>
        private async Task<string> GenerateJWTToken(ApplicationUser user)
        {
            // Step 1: Get user roles (e.g., "Admin", "User")
            // These roles will be included in the token and used for [Authorize(Roles = "Admin")]
            var roles = await _userManager.GetRolesAsync(user);
            
            // Step 2: Get user claims (custom permissions)
            var userClaims = await _userManager.GetClaimsAsync(user);
            
            // Step 3: Build base claims (user information)
            var claims = new List<Claim>
            { 
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),  // Subject (user ID)
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),  // Email
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),  // Unique token ID
                new Claim(ClaimTypes.Name, user.Name),  // User's name
                new Claim(ClaimTypes.NameIdentifier, user.Id)  // User ID
            };

            // Step 4: Add roles as claims
            // IMPORTANT: This makes [Authorize(Roles = "Admin")] work
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            // Step 5: Add custom claims (permissions, etc.)
            foreach (var claim in userClaims)
            {
                claims.Add(claim);
            }

            // Step 6: Create signing credentials
            var key = new SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(
                    _jwtKey ?? throw new InvalidOperationException("JWT Key is not configured")));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Step 7: Create JWT token
            var token = new JwtSecurityToken(
                issuer: _JwtIssuer,  // Who issued the token
                audience: _JwtAudience,  // Who the token is for
                claims: claims,  // All claims (roles, user info, etc.)
                expires: DateTime.Now.AddMinutes(_JwtExpiry),  // Token expiration
                signingCredentials: creds  // Signing key
            );
            
            // Step 8: Return token as string
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }


    

}
