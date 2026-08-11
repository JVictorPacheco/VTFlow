using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TodoBoard.Api.Features.Auth;
using TodoBoard.Api.Features.Boards;
using TodoBoard.Api.Features.Cards;
using TodoBoard.Api.Features.Columns;
using TodoBoard.Api.Features.Labels;
using TodoBoard.Api.Shared;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.ConfigureHttpJsonOptions(opts =>
    opts.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddScoped<AuthService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseCors("AllowAll");
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// Health
app.MapGet("/health", () => Results.Ok(new { status = "healthy" })).AllowAnonymous();

// Auth
Register.Map(app);
Login.Map(app);

// Labels
CreateLabel.Map(app);
GetLabels.Map(app);
UpdateLabel.Map(app);
DeleteLabel.Map(app);

// Boards
CreateBoard.Map(app);
GetBoards.Map(app);
GetBoardById.Map(app);
UpdateBoard.Map(app);
DeleteBoard.Map(app);

// Columns
CreateColumn.Map(app);
GetColumns.Map(app);
RenameColumn.Map(app);
ReorderColumn.Map(app);
DeleteColumn.Map(app);

// Cards
CreateCard.Map(app);
GetCards.Map(app);
UpdateCard.Map(app);
MoveCard.Map(app);
ReorderCard.Map(app);
DeleteCard.Map(app);

// Subtasks
CreateSubtask.Map(app);
GetSubtasks.Map(app);
ToggleSubtask.Map(app);
RenameSubtask.Map(app);
DeleteSubtask.Map(app);

// Comments
CreateComment.Map(app);
GetComments.Map(app);
UpdateComment.Map(app);
DeleteComment.Map(app);

// Card Activities
GetCardActivities.Map(app);

app.Run();
