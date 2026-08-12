using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using VTFlow.Api.Features.Auth;
using VTFlow.Api.Features.Boards;
using VTFlow.Api.Features.Cards;
using VTFlow.Api.Features.Columns;
using VTFlow.Api.Features.Labels;
using VTFlow.Api.Shared;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.ConfigureHttpJsonOptions(opts =>
    opts.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

var jwtService = new JwtService(builder.Configuration, builder.Environment);
builder.Services.AddSingleton(jwtService);
builder.Services.AddScoped<AuthService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = jwtService.CreateValidationParameters();
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseMiddleware<ExceptionHandlerMiddleware>();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (db.Database.IsRelational())
    {
        db.Database.Migrate();
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseCors("AllowAll");
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" })).AllowAnonymous();

Register.Map(app);
Login.Map(app);

CreateLabel.Map(app);
GetLabels.Map(app);
UpdateLabel.Map(app);
DeleteLabel.Map(app);

CreateBoard.Map(app);
GetBoards.Map(app);
GetBoardById.Map(app);
UpdateBoard.Map(app);
DeleteBoard.Map(app);

CreateColumn.Map(app);
GetColumns.Map(app);
RenameColumn.Map(app);
ReorderColumn.Map(app);
DeleteColumn.Map(app);

CreateCard.Map(app);
GetCards.Map(app);
UpdateCard.Map(app);
MoveCard.Map(app);
ReorderCard.Map(app);
DeleteCard.Map(app);

CreateSubtask.Map(app);
GetSubtasks.Map(app);
ToggleSubtask.Map(app);
RenameSubtask.Map(app);
DeleteSubtask.Map(app);

CreateComment.Map(app);
GetComments.Map(app);
UpdateComment.Map(app);
DeleteComment.Map(app);

GetCardActivities.Map(app);

app.Run();

public partial class Program { }
