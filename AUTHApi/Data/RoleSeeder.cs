using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading.Tasks;

namespace AUTHApi.Data
{
    public static class RoleSeeder
    {
        public static async Task SeedRolesAsync(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            string[] roles = { "SuperAdmin", "Admin", "User" };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }

        public static async Task SeedSuperAdminAsync(IServiceProvider serviceProvider)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            string email = "martinsharma18@gmail.com";
            string password = "Martin#123";  // dev only

            var superAdmin = await userManager.FindByEmailAsync(email);

            // Temporarily remove the if check to force recreation
            // if (superAdmin == null)
            // {
                superAdmin = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(superAdmin, password);

                if (!result.Succeeded)
                {
                    foreach (var e in result.Errors)
                        Console.WriteLine("Error creating SuperAdmin: " + e.Description);

                    return;
                }
            // }

            // Assign roles
            if (!await userManager.IsInRoleAsync(superAdmin, "SuperAdmin"))
                await userManager.AddToRoleAsync(superAdmin, "SuperAdmin");

            if (!await userManager.IsInRoleAsync(superAdmin, "Admin"))
                await userManager.AddToRoleAsync(superAdmin, "Admin");

            if (!await userManager.IsInRoleAsync(superAdmin, "User"))
                await userManager.AddToRoleAsync(superAdmin, "User");

            Console.WriteLine("SUPER ADMIN READY ✔");
        }
    }
}
