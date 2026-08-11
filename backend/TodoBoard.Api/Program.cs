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

var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(jwtKey))
{
    jwtKey = Environment.GetEnvironmentVariable("DOTNET_JWT_KEY");
}
if (string.IsNullOrEmpty(jwtKey) && builder.Environment.IsDevelopment())
{
    jwtKey = "dev-secret-key-for-local-development-only";
}

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
                Encoding.UTF8.GetBytes(jwtKey!))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseMiddleware<ExceptionHandlerMiddleware>();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
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
