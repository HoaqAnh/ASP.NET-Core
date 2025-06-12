using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TranPhamHoangAnh_2280600123.Migrations
{
    /// <inheritdoc />
    public partial class AddHistoryQuizIdToHistoryQuestion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HistoryQuizId",
                table: "HistoryQuestions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_HistoryQuestions_HistoryQuizId",
                table: "HistoryQuestions",
                column: "HistoryQuizId");

            migrationBuilder.AddForeignKey(
                name: "FK_HistoryQuestions_HistoryQuizzes_HistoryQuizId",
                table: "HistoryQuestions",
                column: "HistoryQuizId",
                principalTable: "HistoryQuizzes",
                principalColumn: "HistoryQuizId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_HistoryQuestions_HistoryQuizzes_HistoryQuizId",
                table: "HistoryQuestions");

            migrationBuilder.DropIndex(
                name: "IX_HistoryQuestions_HistoryQuizId",
                table: "HistoryQuestions");

            migrationBuilder.DropColumn(
                name: "HistoryQuizId",
                table: "HistoryQuestions");
        }
    }
}
