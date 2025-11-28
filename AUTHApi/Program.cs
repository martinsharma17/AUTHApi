using Microsoft.EntityFrameworkCore;
using AUTHApi.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using AUTHApi.Services;

internal class Program
{
    private static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.

        builder.Services.AddControllers();
        // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
        builder.Services.AddSwaggerGen();

        // ============================================
        // IDENTITY CONFIGURATION
        // ============================================
        // Configure ASP.NET Core Identity for user management
        builder.Services.AddIdentity<ApplicationUser, IdentityRole>(option =>
        {
            // Password requirements (simplified for development)
            option.Password.RequireDigit = false;
            option.Password.RequireLowercase = false;
            option.Password.RequireUppercase = false;
            option.Password.RequireNonAlphanumeric = false;
            option.Password.RequiredLength = 4;
        })
            .AddEntityFrameworkStores<ApplicationDbContext>()  // Store users in database
            .AddDefaultTokenProviders();  // For password reset tokens, etc.


        // DbContext configuration
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
        });

        // ============================================
        // JWT AUTHENTICATION CONFIGURATION
        // ============================================
        // This configures how JWT tokens are validated
        builder.Services.AddAuthentication(options =>
        {
            // Use JWT Bearer tokens for authentication
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                // Validate token issuer (who created the token)
                ValidateIssuer = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],

                // Validate token audience (who the token is for)
                ValidateAudience = true,
                ValidAudience = builder.Configuration["Jwt:Audience"],

                // Validate token expiration
                ValidateLifetime = true,

                // Validate signing key
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(
                    System.Text.Encoding.UTF8.GetBytes(
                        builder.Configuration["Jwt:Key"] ?? 
                        throw new InvalidOperationException("JWT Key is not configured"))),

                // IMPORTANT: Map role claims from JWT token
                // This allows [Authorize(Roles = "Admin")] to work
                RoleClaimType = ClaimTypes.Role,
                NameClaimType = ClaimTypes.Name
            };
        });

        // ============================================
        // AUTHORIZATION POLICIES
        // ============================================
        // Policies define who can access what endpoints
        // You can use these policies with [Authorize(Policy = "PolicyName")]
        builder.Services.AddAuthorization(options =>
        {
            // POLICY 1: AdminOnly
            // Only users with "Admin" role can access
            // Usage: [Authorize(Policy = "AdminOnly")]
            options.AddPolicy("AdminOnly", policy => 
                policy.RequireRole("Admin"));

            // POLICY 2: UserOnly  
            // Only users with "User" role can access
            // Usage: [Authorize(Policy = "UserOnly")]
            options.AddPolicy("UserOnly", policy => 
                policy.RequireRole("User"));

            // POLICY 3: AdminOrUser
            // Users with either "Admin" OR "User" role can access
            // Usage: [Authorize(Policy = "AdminOrUser")]
            options.AddPolicy("AdminOrUser", policy => 
                policy.RequireRole("Admin", "User"));
        });

        var app = builder.Build();

        // Seed roles and admin user on startup
        using (var scope = app.Services.CreateScope())
        {
            var services = scope.ServiceProvider;
            try
            {
                await RoleSeeder.SeedRolesAsync(services);
                // Uncomment and set admin credentials if you want to auto-create an admin user
                // await RoleSeeder.SeedAdminUserAsync(services, "admin@example.com", "Admin@123");
            }
            catch (Exception ex)
            {
                var logger = services.GetRequiredService<ILogger<Program>>();
                logger.LogError(ex, "An error occurred while seeding roles.");
            }
        }

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            //app.UseSwaggerUI();
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "AUTHApi");
            });
        }

        app.UseHttpsRedirection();
//in order 
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        await app.RunAsync();
    }
}