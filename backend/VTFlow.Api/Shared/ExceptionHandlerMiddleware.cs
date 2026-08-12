using System.Net;
using System.Text.Json;

namespace VTFlow.Api.Shared;

public class ExceptionHandlerMiddleware(RequestDelegate next, IHostEnvironment env, ILogger<ExceptionHandlerMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception");
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";

            object response = env.IsDevelopment()
                ? new { error = "Ocorreu um erro interno.", details = ex.ToString() }
                : new { error = "Ocorreu um erro interno." };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
