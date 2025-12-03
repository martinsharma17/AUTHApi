using Microsoft.EntityFrameworkCore;
using AUTHApi.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;


internal class Program
{
    private static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddControllers();
        builder.Services.AddSwaggerGen();

        // CORS for frontend
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowSpecificOrigin",
                builder =>
                {
                    builder.WithOrigins("http://localhost:5173")
                           .AllowAnyHeader()
                           .AllowAnyMethod();
                });
        });

        // ============= IDENTITY CONFIG =============
        builder.Services.AddIdentity<ApplicationUser, IdentityRole>(option =>
        {
            option.Password.RequireDigit = false;
            option.Password.RequireLowercase = false;
            option.Password.RequireUppercase = false;
            option.Password.RequireNonAlphanumeric = false;
            option.Password.RequiredLength = 4;
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

        // DbContext
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
        });

        // ============= JWT CONFIG =============
        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],

                ValidateAudience = true,
                ValidAudience = builder.Configuration["Jwt:Audience"],

                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(
                    System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])
                ),

                RoleClaimType = ClaimTypes.Role,
                NameClaimType = ClaimTypes.Name
            };
        });

        // ============= AUTH POLICIES =============
        builder.Services.AddAuthorization(options =>
        {
            options.AddPolicy("AdminOnly", policy =>
                policy.RequireRole("Admin"));

            options.AddPolicy("UserOnly", policy =>
                policy.RequireRole("User"));

            options.AddPolicy("AdminOrUser", policy =>
                policy.RequireRole("Admin", "User"));
        });

        var app = builder.Build();

        // ============= SEED ROLES + SUPERADMIN =============
        using (var scope = app.Services.CreateScope())
        {
            var services = scope.ServiceProvider;

            try
            {
                await RoleSeeder.SeedRolesAsync(services);
                await RoleSeeder.SeedSuperAdminAsync(services);
            }
            catch (Exception ex)
            {
                var logger = services.GetRequiredService<ILogger<Program>>();
                logger.LogError(ex, "Error while seeding roles or superadmin.");
            }
        }

        // Swagger
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "AUTHApi");
            });
        }

        app.UseHttpsRedirection();
        app.UseCors("AllowSpecificOrigin");

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        await app.RunAsync();
    }
}
