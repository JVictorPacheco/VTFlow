using System.Security.Claims;

namespace VTFlow.Api.Shared;

public static class UserContext
{
    public static int? GetUserId(HttpContext context)
    {
        var sub = context.User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        return sub is not null && int.TryParse(sub, out var id) ? id : null;
    }
}
