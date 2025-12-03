using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AUTHApi.Migrations
{
    /// <inheritdoc />
    public partial class asdfghm : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ManagerId",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ManagerId",
                table: "AspNetUsers");
        }
    }
}
